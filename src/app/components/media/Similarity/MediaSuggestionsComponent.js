import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { browserHistory } from 'react-router';
import {
  CheckCircleOutline as AcceptIcon,
  DeleteOutline as TrashIcon,
  HelpOutline as HelpIcon,
  HighlightOff as RejectIcon,
  NavigateBefore as PreviousIcon,
  NavigateNext as NextIcon,
  ReportGmailerrorred as SpamIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import SelectProjectDialog from '../SelectProjectDialog';
import { can } from '../../Can';
import SuggestedMediaDialogComponent from '../../cds/menus-lists-dialogs/SuggestedMediaDialogComponent';
import MediaCardCondensed from '../../cds/media-cards/MediaCardCondensed';
import MediaTypeDisplayName from '../MediaTypeDisplayName';
import MediasLoading from '../MediasLoading';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { withSetFlashMessage } from '../../FlashMessage';
import CheckArchivedFlags from '../../../CheckArchivedFlags';
import globalStrings from '../../../globalStrings';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import {
  Column,
  brandMain,
  validationMain,
  errorMain,
  brandBorder,
  textSecondary,
  brandBackground,
  otherWhite,
  textPrimary,
} from '../../../styles/js/shared';
import BulkArchiveProjectMediaMutation from '../../../relay/mutations/BulkArchiveProjectMediaMutation';

const useStyles = makeStyles(theme => ({
  containerBox: {
    backgroundColor: brandBackground,
    borderRadius: theme.spacing(2),
    position: 'relative',
  },
  title: {
    userSelect: 'none',
    fontWeight: 'bold',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    minWidth: theme.spacing(28), // a number that is arbitrary but looks okay
    textAlign: 'center',
  },
  break: {
    flexBasis: '100%',
    height: 0,
  },
  helpIconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  helpIcon: {
    color: brandMain,
  },
  disabled: {
    opacity: 0.5,
  },
  accept: {
    color: validationMain,
    padding: theme.spacing(0.5),
  },
  reject: {
    color: errorMain,
    padding: theme.spacing(0.5),
  },
  spamTrash: {
    padding: theme.spacing(0.5),
  },
  media: {
    border: `1px solid ${brandBorder}`,
    borderRadius: 8,
    color: textPrimary,
    backgroundColor: otherWhite,
  },
  noMedia: {
    color: textPrimary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: otherWhite,
  },
  spaced: {
    padding: theme.spacing(1),
  },
  suggestionsBackButton: {
    padding: 0,
    color: textSecondary,
  },
  suggestionsNoMediaBox: {
    border: `1px solid ${brandBorder}`,
    borderRadius: theme.spacing(1),
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  spamTrashBox: {
    width: '100%',
    textAlign: 'right',
  },
  card: {
    border: `1px solid ${brandBorder}`,
    borderRadius: theme.spacing(2),
    color: textPrimary,
    backgroundColor: otherWhite,
    margin: theme.spacing(2, 1, 1, 1),
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardText: {
    fontSize: '14px',
    lineHeight: '143%',
    fontWeight: 400,
  },
}));

const MediaSuggestionsComponent = ({
  mainItem,
  reportType,
  relationships,
  team,
  project,
  setFlashMessage,
  relay,
  totalCount,
  pageSize,
  intl,
}) => {
  const classes = useStyles();
  const [selectedItemId, setSelectedItemId] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isBulkRejectDialogOpen, setIsBulkRejectDialogOpen] = React.useState(false);
  const [isBulkSpamDialogOpen, setIsBulkSpamDialogOpen] = React.useState(false);
  const [isBulkTrashDialogOpen, setIsBulkTrashDialogOpen] = React.useState(false);
  const [isBulkAcceptDialogOpen, setIsBulkAcceptDialogOpen] = React.useState(false);
  const [isSuggestedMediaDialogOpen, setIsSuggestedMediaDialogOpen] = React.useState(false);
  const [isMutationPending, setIsMutationPending] = React.useState(false);
  const [selectedRelationship, setSelectedRelationship] = React.useState(0);
  const [cursor, setCursor] = React.useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = React.useState(false);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(false), [setIsDialogOpen]);
  const openBulkRejectDialog = React.useCallback(() => setIsBulkRejectDialogOpen(true), [setIsBulkRejectDialogOpen]);
  const closeBulkRejectDialog = React.useCallback(() => setIsBulkRejectDialogOpen(false), [setIsBulkRejectDialogOpen]);
  const openBulkAcceptDialog = React.useCallback(() => setIsBulkAcceptDialogOpen(true), [setIsBulkAcceptDialogOpen]);
  const closeBulkAcceptDialog = React.useCallback(() => setIsBulkAcceptDialogOpen(false), [setIsBulkAcceptDialogOpen]);
  const openBulkSpamDialog = React.useCallback(() => setIsBulkSpamDialogOpen(true), [setIsBulkSpamDialogOpen]);
  const closeBulkSpamDialog = React.useCallback(() => setIsBulkSpamDialogOpen(false), [setIsBulkSpamDialogOpen]);
  const openBulkTrashDialog = React.useCallback(() => setIsBulkTrashDialogOpen(true), [setIsBulkTrashDialogOpen]);
  const closeBulkTrashDialog = React.useCallback(() => setIsBulkTrashDialogOpen(false), [setIsBulkTrashDialogOpen]);

  const swallowClick = (event) => {
    event.stopPropagation();
  };

  const handleCompleted = () => {
    setIsMutationPending(false);
  };

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
    setIsMutationPending(false);
    setFlashMessage(errorMessage, 'error');
  };

  const handleReplace = (relationship) => {
    const mutation = graphql`
      mutation MediaSuggestionsComponentReplaceProjectMediaMutation($input: ReplaceProjectMediaInput!) {
        replaceProjectMedia(input: $input) {
          new_project_media {
            dbid
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          project_media_to_be_replaced_id: mainItem.id,
          new_project_media_id: relationship.target?.id,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
        } else {
          const projectMediaDbid = relationship.target_id;
          const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
          const newPath = `/${teamSlug}/media/${projectMediaDbid}`;
          window.location.href = window.location.href.replace(window.location.pathname, newPath);
        }
      },
      onError: onFailure,
    });
  };

  const destroyMutation = graphql`
    mutation MediaSuggestionsComponentDestroyRelationshipMutation($input: DestroyRelationshipInput!, $rejection: Boolean!, $totalLoaded: Int) {
      destroyRelationship(input: $input) {
        deletedId
        source_project_media @include(if: $rejection) {
          hasMain: is_confirmed_similar_to_another_item
          suggestionsCount: suggested_similar_items_count
          confirmedSimilarCount: confirmed_similar_items_count
          suggested_similar_relationships(first: $totalLoaded) {
            edges {
              node {
                id
                target_id
              }
            }
            totalCount
          }
        }
        target_project_media @include(if: $rejection) {
          hasMain: is_confirmed_similar_to_another_item
          suggestionsCount: suggested_similar_items_count
          confirmedSimilarCount: confirmed_similar_items_count
          is_suggested
          suggested_similar_relationships(first: $totalLoaded) {
            edges {
              node {
                id
                target_id
              }
            }
            totalCount
          }
        }
      }
    }
  `;

  const handleDestroyAndReplace = (relationship) => {
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: false,
        input: {
          id: relationship.id,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
        } else {
          handleReplace(relationship);
        }
      },
      onError: onFailure,
    });
  };

  const destroyBulkMutation = graphql`
    mutation MediaSuggestionsComponentDestroyRelationshipsMutation($input: DestroyRelationshipsInput!, $rejection: Boolean!, $totalLoaded: Int) {
      destroyRelationships(input: $input) {
        ids
        source_project_media @include(if: $rejection) {
          hasMain: is_confirmed_similar_to_another_item
          suggestionsCount: suggested_similar_items_count
          confirmedSimilarCount: confirmed_similar_items_count
          suggested_similar_relationships(first: $totalLoaded) {
            edges {
              node {
                id
                target_id
              }
            }
            totalCount
          }
        }
      }
    }
  `;

  const handleBulkReject = (targetProject, disableFlashMessage, callback = () => {}) => {
    setIsBulkRejectDialogOpen(false);
    const visibleItemIds = relationships.slice(cursor, cursor + pageSize).map(relationship => relationship.id);

    commitMutation(Store, {
      mutation: destroyBulkMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: true,
        input: {
          ids: visibleItemIds,
          add_to_project_id: targetProject.dbid,
          source_id: mainItem.dbid,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          return onFailure(error);
        }
        const message = (
          <div>
            <Typography variant="subtitle2">
              <FormattedMessage
                id="mediaSuggestionsComponent.flashBulkRejectTitle"
                defaultMessage="{number} media rejected"
                description="Title that appears in a popup to confirm that a 'bulk reject' action was successful"
                values={{
                  number: visibleItemIds.length,
                }}
              />
            </Typography>
            <div className={classes.break} />
            <Typography variant="body1">
              <FormattedMessage
                id="mediaSuggestionsComponent.flashBulkReject"
                defaultMessage='Added to the list "{folder}"'
                description="Text that appears in a popup to confirm that a 'bulk reject' action was successful"
                values={{
                  folder: targetProject.title,
                }}
              />
            </Typography>
          </div>
        );
        if (!disableFlashMessage) {
          setFlashMessage(message, 'success');
        }
        return callback();
      },
      onError: onFailure,
    });
  };

  const handleBulkConfirm = () => {
    const mutation = graphql`
      mutation MediaSuggestionsComponentUpdateRelationshipsMutation($input: UpdateRelationshipsInput!, $totalLoaded: Int) {
        updateRelationships(input: $input) {
          source_project_media {
            demand
            requests_count
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
            suggested_similar_relationships(first: $totalLoaded) {
              edges {
                node {
                  id
                  target_id
                }
              }
              totalCount
            }
            confirmed_similar_relationships(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  source_id
                  target_id
                  target {
                    id
                    dbid
                    title
                    picture
                    created_at
                    type
                    requests_count
                  }
                }
              }
            }
          }
        }
      }
    `;

    setIsMutationPending(true);
    const visibleItemIds = relationships.slice(cursor, cursor + pageSize).map(relationship => relationship.id);

    commitMutation(Store, {
      mutation,
      variables: {
        totalLoaded: relationships.length,
        input: {
          ids: visibleItemIds,
          source_id: mainItem.dbid,
          action: 'accept',
        },
      },
      onCompleted: ({ response, error }) => {
        if (error) {
          return onFailure(error);
        }
        const message = (
          <Typography variant="subtitle2">
            <FormattedMessage
              id="mediaSuggestionsComponent.flashBulkConfirmTitle"
              defaultMessage="{number} suggested media matched"
              description="Title that appears in a popup to confirm that a 'bulk accept' action was successful"
              values={{
                number: visibleItemIds.length,
              }}
            />
          </Typography>
        );
        closeBulkAcceptDialog();
        setFlashMessage(message, 'success');
        return handleCompleted(response);
      },
      onError: onFailure,
    });
  };

  const handleConfirm = (relationship) => {
    const relationship_type = 'confirmed_sibling';

    const mutation = graphql`
      mutation MediaSuggestionsComponentUpdateRelationshipMutation($input: UpdateRelationshipInput!, $totalLoaded: Int) {
        updateRelationship(input: $input) {
          relationship {
            relationship_type
          }
          source_project_media {
            demand
            requests_count
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
            suggested_similar_relationships(first: $totalLoaded) {
              edges {
                node {
                  id
                  target_id
                }
              }
              totalCount
            }
            confirmed_similar_relationships(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  source_id
                  target_id
                  target {
                    id
                    dbid
                    title
                    picture
                    created_at
                    type
                    requests_count
                  }
                }
              }
            }
          }
          target_project_media {
            demand
            requests_count
            added_as_similar_by_name
            confirmed_as_similar_by_name
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
            suggested_similar_relationships(first: $totalLoaded) {
              edges {
                node {
                  id
                  target_id
                }
              }
              totalCount
            }
          }
        }
      }
    `;

    setIsMutationPending(true);
    commitMutation(Store, {
      mutation,
      variables: {
        totalLoaded: relationships.length,
        input: {
          id: relationship.id,
          relationship_source_type: relationship_type,
          relationship_target_type: relationship_type,
        },
      },
      onCompleted: ({ response, error }) => {
        if (error) {
          return onFailure(error);
        }
        return handleCompleted(response);
      },
      onError: onFailure,
    });
  };

  const handleReject = (targetProject) => {
    setIsDialogOpen(false);

    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: true,
        input: {
          id: selectedRelationship.id,
          add_to_project_id: targetProject.dbid,
        },
      },
      onCompleted: ({ response, error }) => {
        if (error) {
          return onFailure(error);
        }
        return handleCompleted(response);
      },
      onError: onFailure,
    });
  };

  const handleBulkArchiveTarget = (archived) => {
    const visibleItemIds = relationships.slice(cursor, cursor + pageSize).map(relationship => relationship.target?.id);

    const mutation = new BulkArchiveProjectMediaMutation({
      ids: visibleItemIds,
      archived,
      team,
      project,
    });

    // reject these items and send them to a null folder
    handleBulkReject({ dbid: null }, true, () => {
      // after rejecting, send to spam
      Store.commitUpdate(mutation, {
        onSuccess: () => {
          const message = archived === CheckArchivedFlags.TRASHED ? (
            <FormattedMessage
              id="mediaSuggestionsComponent.flashBulkTrash"
              defaultMessage="{number} media sent to the trash"
              description="Text that appears in a popup to confirm that a 'bulk move to trash' action was successful"
              values={{
                number: visibleItemIds.length,
              }}
            />
          ) : (
            <FormattedMessage
              id="mediaSuggestionsComponent.flashBulkSpam"
              defaultMessage="{number} media marked as spam"
              description="Text that appears in a popup to confirm that a 'bulk move to spam' action was successful"
              values={{
                number: visibleItemIds.length,
              }}
            />
          );
          setFlashMessage(message, 'success');
          if (archived === CheckArchivedFlags.TRASHED) {
            closeBulkTrashDialog();
          } else {
            closeBulkSpamDialog();
          }
          setIsMutationPending(false);
        },
      });
    });
  };

  const handleArchiveTarget = (archived, relationship) => {
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: true,
        input: {
          id: relationship.id,
          archive_target: archived,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
        } else {
          const message = archived === CheckArchivedFlags.TRASHED ? (
            <FormattedMessage
              id="mediaSuggestionsComponent.movedToTrash"
              defaultMessage="The item was moved to {trash}"
              description="Text that appears in a popup to confirmt hat a 'move to trash' action was successful"
              values={{
                trash: (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
                  <a onClick={() => browserHistory.push(`/${team.slug}/trash`)}>
                    <FormattedMessage id="mediaDetail.trash" defaultMessage="Trash" description="Label on a link that, when clicked, takes the user to a list of trashed (marked for deletion) items" />
                  </a>
                ),
              }}
            />
          ) : (
            <FormattedMessage
              id="mediaSuggestionsComponent.movedToSpam"
              defaultMessage="The item was moved to {spam}"
              description="Text that appears in a popup to confirmt hat a 'move to spam' action was successful"
              values={{
                spam: (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
                  <a onClick={() => browserHistory.push(`/${team.slug}/spam`)}>
                    <FormattedMessage id="mediaDetail.spam" defaultMessage="Spam" description="Label on a link that, when clicked, takes the user to a list of items marked as spam" />
                  </a>
                ),
              }}
            />
          );
          setFlashMessage(message, 'success');
        }
      },
      onError: onFailure,
    });
  };

  const handleHelp = () => {
    window.open('http://help.checkmedia.org/en/articles/4705965-similarity-matching-and-suggestions');
  };

  const openSuggestedMediaDialog = (relationshipItem) => {
    setSelectedItemId(relationshipItem.target?.dbid);
    setIsSuggestedMediaDialogOpen(true);
  };

  const disableAcceptRejectButtons = totalCount === 0 || !can(team.permissions, 'update Relationship') || isMutationPending;

  if (totalCount === 0) {
    return (
      <Box className={classes.card}>
        <Typography variant="subtitle2" className="similarity-media-no-items">
          <FormattedMessage
            id="mediaSuggestionsComponent.noItems"
            defaultMessage="{total, plural, one {{total} suggestion} other {{total} suggestions}}"
            description="A header that tells the user there are no items in the list"
            values={{
              total: 0,
            }}
          />
        </Typography>
      </Box>
    );
  }

  return (
    <React.Fragment>
      <Column className="media__suggestions-column">
        { relationships.length > 0 ?
          <div>
            <Box className={classes.containerBox}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.previous" defaultMessage="Previous" description="Label for the 'go to previous page' button on paginated suggestions" />}>
                  <IconButton
                    disabled={isPaginationLoading || cursor - pageSize < 0}
                    onClick={() => {
                      if (cursor - pageSize >= 0) {
                        setCursor(cursor - pageSize);
                      }
                    }}
                  >
                    <PreviousIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="body1" className={classes.title}>
                  <FormattedMessage
                    id="mediaSuggestionsComponent.title"
                    defaultMessage="{start} to {end} of {total, plural, one {{total} suggestion} other {{total} suggestions}}"
                    description="A header that tells the user how many suggestions items are in the list to follow"
                    values={{
                      total: totalCount,
                      start: cursor + 1,
                      end: Math.min(cursor + pageSize, totalCount),
                    }}
                  />
                </Typography>
                <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.next" defaultMessage="Next" description="Label for the 'go to next page' button on paginated suggestions" />}>
                  <IconButton
                    disabled={isPaginationLoading || cursor + pageSize >= totalCount}
                    onClick={() => {
                      if (relay.hasMore() && !relay.isLoading() && (cursor + pageSize === relationships.length)) {
                        setIsPaginationLoading(true);
                        relay.loadMore(pageSize, () => {
                          setCursor(cursor + pageSize);
                          setIsPaginationLoading(false);
                        });
                      } else if (cursor + pageSize < relationships.length) {
                        setCursor(cursor + pageSize);
                      }
                    }}
                  >
                    <NextIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="overline">
                  <FormattedMessage
                    id="mediaSuggestionsComponent.bulkEdit"
                    defaultMessage="Bulk edit"
                    description="A header that tells the user the buttons to follow are for bulk editing items (editing more than one item at a time, like marking all as spam)"
                  />
                </Typography>
              </Box>
              <Grid container justify="center" direction="row" spacing={1}>
                <Grid item>
                  <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.bulkAccept" defaultMessage="Match all media on this page" description="Tooltip for a button that is a green check mark. Pressing it causes all visible media items on the page to be confirmed as matched media." />}>
                    <IconButton
                      onClick={() => {
                        openBulkAcceptDialog();
                      }}
                      disabled={disableAcceptRejectButtons}
                      className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.accept}`}
                    >
                      <AcceptIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.bulkReject" defaultMessage="Reject all medias on this page" description="Tooltip for a button that is a red X mark. Pressing it causes all visible media items on the page to be rejected and removed from the suggestions list." />}>
                    <IconButton
                      onClick={() => {
                        openBulkRejectDialog();
                      }}
                      disabled={disableAcceptRejectButtons}
                      className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.reject}`}
                    >
                      <RejectIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.bulkSpam" defaultMessage="Mark all medias on this page as spam" description="Tooltip for a button that is an octagon with an exclamation mark. Pressing this button causes all visible media items on the page to be marked as 'spam' and removed from the suggestions list." />}>
                    <IconButton
                      onClick={() => {
                        openBulkSpamDialog();
                      }}
                      disabled={disableAcceptRejectButtons}
                      className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.spamTrash}`}
                    >
                      <SpamIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.bulkTrash" defaultMessage="Send all medias on this page to trash" description="Tooltip for a button that is a trash bin. Pressing this button causes all visible media items on the page to be sent to the 'trash' folder and removed from the suggestions list." />}>
                    <IconButton
                      onClick={() => {
                        openBulkTrashDialog();
                      }}
                      disabled={disableAcceptRejectButtons}
                      className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.spamTrash}`}
                    >
                      <TrashIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <IconButton className={classes.helpIconContainer} onClick={handleHelp}>
                <HelpIcon className={classes.helpIcon} />
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center">
              <>
                <SuggestedMediaDialogComponent
                  isOpen={isSuggestedMediaDialogOpen}
                  projectMediaId={selectedItemId}
                  onClick={swallowClick}
                  onClose={() => setIsSuggestedMediaDialogOpen(false)}
                  maxWidth="sm"
                  fullWidth
                />
                <Dialog
                  open={isBulkAcceptDialogOpen}
                  onClose={closeBulkAcceptDialog}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>
                    <FormattedMessage
                      id="mediaSuggestionsComponent.dialogBulkAcceptTitle"
                      defaultMessage="Are you sure you want to match {number} suggestions?"
                      description="Prompt to a user when they choose to match media as a bulk action"
                      values={{
                        number: relationships.slice(cursor, cursor + pageSize).length,
                      }}
                    />
                  </DialogTitle>
                  <DialogActions>
                    <Button color="primary" onClick={closeBulkAcceptDialog}>
                      <FormattedMessage
                        id="global.cancel"
                        defaultMessage="Cancel"
                        description="Regular Cancel action label"
                      />
                    </Button>
                    <Button
                      color="primary"
                      onClick={handleBulkConfirm}
                    >
                      <FormattedMessage
                        id="mediaSuggestionsComponent.dialogBulkAcceptConfirm"
                        defaultMessage="Match all"
                        description="Button that a user presses to confirm that they are going to match all visible suggested media"
                        values={{
                          number: relationships.slice(cursor, cursor + pageSize).length,
                        }}
                      />
                    </Button>
                  </DialogActions>
                </Dialog>
                <Dialog
                  open={isBulkSpamDialogOpen}
                  onClose={closeBulkSpamDialog}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>
                    <FormattedMessage
                      id="mediaSuggestionsComponent.dialogBulkSpamTitle"
                      defaultMessage="Are you sure you want to mark {number} suggested media as spam?"
                      description="Prompt to a user when they choose to mark media as spam in bulk"
                      values={{
                        number: relationships.slice(cursor, cursor + pageSize).length,
                      }}
                    />
                  </DialogTitle>
                  <DialogActions>
                    <Button color="primary" onClick={closeBulkSpamDialog}>
                      <FormattedMessage
                        id="global.cancel"
                        defaultMessage="Cancel"
                        description="Regular Cancel action label"
                      />
                    </Button>
                    <Button
                      color="primary"
                      onClick={() => handleBulkArchiveTarget(CheckArchivedFlags.SPAM)}
                    >
                      <FormattedMessage
                        id="mediaSuggestionsComponent.dialogBulkSpamConfirm"
                        defaultMessage="Mark as spam"
                        description="Button that a user presses to confirm that they are going to mark all visible suggested media as spam"
                        values={{
                          number: relationships.slice(cursor, cursor + pageSize).length,
                        }}
                      />
                    </Button>
                  </DialogActions>
                </Dialog>
                <Dialog
                  open={isBulkTrashDialogOpen}
                  onClose={closeBulkTrashDialog}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>
                    <FormattedMessage
                      id="mediaSuggestionsComponent.dialogBulkTrashTitle"
                      defaultMessage="Are you sure you want to send {number} suggestions to the trash?"
                      description="Prompt to a user when they choose to send media to trash in bulk"
                      values={{
                        number: relationships.slice(cursor, cursor + pageSize).length,
                      }}
                    />
                  </DialogTitle>
                  <DialogActions>
                    <Button color="primary" onClick={closeBulkTrashDialog}>
                      <FormattedMessage
                        id="global.cancel"
                        defaultMessage="Cancel"
                        description="Regular Cancel action label"
                      />
                    </Button>
                    <Button
                      color="primary"
                      onClick={() => handleBulkArchiveTarget(CheckArchivedFlags.TRASHED)}
                    >
                      <FormattedMessage
                        id="mediaSuggestionsComponent.dialogBulkTrashConfirm"
                        defaultMessage="Send to trash"
                        description="Button that a user presses to confirm that they are going to send all visible suggested media to trash"
                        values={{
                          number: relationships.slice(cursor, cursor + pageSize).length,
                        }}
                      />
                    </Button>
                  </DialogActions>
                </Dialog>
                <SelectProjectDialog
                  open={isDialogOpen}
                  excludeProjectDbids={[]}
                  title={
                    <FormattedMessage
                      id="mediaSuggestionsComponent.dialogRejectTitle"
                      defaultMessage="Choose a destination folder for this item"
                      description="Prompt to a user when they need to assign a folder location to put the item that they are trying to perform an action on"
                    />
                  }
                  // eslint-disable-next-line @calm/react-intl/missing-attribute
                  cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
                  submitLabel={<FormattedMessage id="mediaSuggestionsComponent.moveItem" defaultMessage="Move item" description="Label for an action button that causes a user to move an item into a given folder" />}
                  submitButtonClassName="media-actions-bar__add-button"
                  onCancel={closeDialog}
                  onSubmit={handleReject}
                />
                <SelectProjectDialog
                  open={isBulkRejectDialogOpen}
                  excludeProjectDbids={[]}
                  title={
                    <FormattedMessage
                      id="mediaSuggestionsComponent.dialogBulkRejectTitle"
                      defaultMessage="Choose a destination folder for the {number} rejected medias"
                      description="Prompt to a user when they need to assign a folder location to put the item that they are trying to perform an action on"
                      values={{
                        number: relationships.slice(cursor, cursor + pageSize).length,
                      }}
                    />
                  }
                  // eslint-disable-next-line @calm/react-intl/missing-attribute
                  cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
                  submitLabel={<FormattedMessage id="mediaSuggestionsComponent.bulkRejectConfirm" defaultMessage="Reject all" description="Label for an action button that causes all selected items to be rejected" />}
                  submitButtonClassName="media-actions-bar__add-button"
                  onCancel={closeBulkRejectDialog}
                  onSubmit={handleBulkReject}
                />
              </>
            </Box>
          </div> : null }
        <div id="suggested-media__items">
          { isPaginationLoading ? <MediasLoading count={pageSize} /> : relationships.slice(cursor, cursor + pageSize).map(relationshipItem => (
            <Grid container alignItems="center" className="suggested-media__item" key={relationshipItem.id}>
              <Grid item xs={1}>
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  flexDirection="column"
                  mr={1}
                >
                  <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.accept" defaultMessage="Match media" description="Tooltip for a button that is a green check mark. Pressing this button causes the media item next to the button to be accepted as a matched item, and removed from the suggested items list." />}>
                    <IconButton
                      onClick={reportType === 'blank' ? () => { handleDestroyAndReplace(relationshipItem); } : () => { handleConfirm(relationshipItem); }}
                      disabled={disableAcceptRejectButtons}
                      className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.accept} similarity-media-item__accept-relationship`}
                    >
                      <AcceptIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.reject" defaultMessage="Reject media" description="Tooltip for a button that is a red X mark. Pressing this button causes the media item next to the button to be rejected as a matched item, and removed from the suggested items list." />}>
                    <IconButton
                      onClick={() => {
                        setSelectedRelationship(relationshipItem);
                        openDialog();
                      }}
                      disabled={disableAcceptRejectButtons}
                      className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.reject} similarity-media-item__reject-relationship`}
                    >
                      <RejectIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              <Grid item xs={10}>
                <MediaCardCondensed
                  title={relationshipItem?.target?.title}
                  details={[
                    <MediaTypeDisplayName mediaType={relationshipItem?.target?.type} />,
                    (
                      <FormattedMessage
                        id="mediaSuggestions.lastSubmitted"
                        defaultMessage="Last submitted {date}"
                        description="Shows the last time a media was submitted (on feed request media card)"
                        values={{
                          date: intl.formatDate(+relationshipItem?.target?.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
                        }}
                      />
                    ),
                    <FormattedMessage
                      id="mediaSuggestions.requestsCount"
                      defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
                      description="Header of requests list. Example: 26 requests"
                      values={{ requestsCount: relationshipItem?.target?.requests_count }}
                    />,
                  ]}
                  media={relationshipItem?.target}
                  type={relationshipItem?.target?.media?.type}
                  description={relationshipItem?.target?.description}
                  url={relationshipItem?.target?.url}
                  onClick={() => {
                    openSuggestedMediaDialog(relationshipItem);
                  }}
                />
              </Grid>
              <Grid item xs={1}>
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  flexDirection="column"
                  ml={1}
                >
                  <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.spam" defaultMessage="Mark media as spam" description="Tooltip for a button that is an octogon with an exclamation mark. Pressing this button causes the media item next to the button to be marked as spam, and removed from the suggested items list." />}>
                    <IconButton
                      onClick={() => handleArchiveTarget(CheckArchivedFlags.SPAM, relationshipItem)}
                      disabled={disableAcceptRejectButtons}
                      className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.spamTrash}`}
                    >
                      <SpamIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={<FormattedMessage id="mediaSuggestionsComponent.trash" defaultMessage="Send media to trash" description="Tooltip for a button that is a waste bin. Pressing this button causes the media item next to the button to be sent to the trash folder, and removed from the suggested items list." />}>
                    <IconButton
                      onClick={() => handleArchiveTarget(CheckArchivedFlags.TRASHED, relationshipItem)}
                      disabled={disableAcceptRejectButtons}
                      className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.spamTrash}`}
                    >
                      <TrashIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          ))}
        </div>
      </Column>
    </React.Fragment>
  );
};

MediaSuggestionsComponent.propTypes = {
  mainItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  reportType: PropTypes.string.isRequired,
  relationships: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    target_id: PropTypes.number.isRequired,
  })).isRequired,
  relay: PropTypes.object.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string,
    smooch_bot: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  project: PropTypes.object.isRequired,
};

// eslint-disable-next-line
export { MediaSuggestionsComponent as MediaSuggestionsComponentTest };
export default withSetFlashMessage(injectIntl(MediaSuggestionsComponent));
