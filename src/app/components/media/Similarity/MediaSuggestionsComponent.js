import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import {
  Box,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
} from '@material-ui/core';
import { browserHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { can } from '../../Can';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import MediaAndRequestsDialogComponent from '../../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import SmallMediaCard from '../../cds/media-cards/SmallMediaCard';
import MediaSlug from '../MediaSlug';
import MediasLoading from '../MediasLoading';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { withSetFlashMessage } from '../../FlashMessage';
import CheckArchivedFlags from '../../../CheckArchivedFlags';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import BulkArchiveProjectMediaMutation from '../../../relay/mutations/BulkArchiveProjectMediaMutation';
import HelpIcon from '../../../icons/help.svg';
import AcceptIcon from '../../../icons/check_circle.svg';
import RejectIcon from '../../../icons/cancel.svg';
import SpamIcon from '../../../icons/report.svg';
import TrashIcon from '../../../icons/delete.svg';
import NextIcon from '../../../icons/chevron_right.svg';
import PreviousIcon from '../../../icons/chevron_left.svg';
import styles from '../media.module.css';

const useStyles = makeStyles(theme => ({
  containerBox: {
    backgroundColor: 'var(--brandBackground)',
    borderRadius: '5px',
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
  helpIconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  disabled: {
    opacity: 0.5,
  },
}));

const MediaSuggestionsComponent = ({
  mainItem,
  reportType,
  relationships,
  team,
  superAdminMask,
  setFlashMessage,
  relay,
  totalCount,
  pageSize,
  intl,
}) => {
  const classes = useStyles();
  const [selectedItemId, setSelectedItemId] = React.useState(0);
  const [isBulkRejectDialogOpen, setIsBulkRejectDialogOpen] = React.useState(false);
  const [isBulkSpamDialogOpen, setIsBulkSpamDialogOpen] = React.useState(false);
  const [isBulkTrashDialogOpen, setIsBulkTrashDialogOpen] = React.useState(false);
  const [isBulkAcceptDialogOpen, setIsBulkAcceptDialogOpen] = React.useState(false);
  const [isMutationPending, setIsMutationPending] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = React.useState(false);
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
    const message = (
      <FormattedMessage
        id="mediaSuggestionsComponent.updatedSuccessfully"
        defaultMessage="Suggestion updated successfully"
        description="Banner displayed after items are accepted or rejected successfully"
      />
    );
    setFlashMessage(message, 'success');
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
          source_id: mainItem.dbid,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          return onFailure(error);
        }
        const message = (
          <FormattedMessage
            id="mediaSuggestionsComponent.flashBulkRejectTitle"
            defaultMessage="{number} media rejected"
            description="Title that appears in a popup to confirm that a 'bulk reject' action was successful"
            values={{
              number: visibleItemIds.length,
            }}
          />
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
          <FormattedMessage
            id="mediaSuggestionsComponent.flashBulkConfirmTitle"
            defaultMessage="{number} suggested media matched"
            description="Title that appears in a popup to confirm that a 'bulk accept' action was successful"
            values={{
              number: visibleItemIds.length,
            }}
          />
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

  const handleReject = (selectedRelationship) => {
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: true,
        input: {
          id: selectedRelationship.id,
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
    });

    // reject these items and send them to trash or spam
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

  const disableAcceptRejectButtons = totalCount === 0 || !can(team.permissions, 'update Relationship') || isMutationPending;

  if (totalCount === 0) {
    return (
      <div className={cx('media__suggestions-column', styles['media-suggestions'], styles['media-item-content'])}>
        <div className={cx(styles['empty-list'], 'similarity-media-no-items')}>
          <FormattedMessage
            id="mediaSuggestionsComponent.noItems"
            defaultMessage="{total, plural, one {{total} Suggestion} other {{total} Suggestions}}"
            description="A header that tells the user there are no items in the list"
            values={{
              total: 0,
            }}
          />
        </div>
      </div>
    );
  }

  const RelationshipItem = ({ relationshipItem, details }) => (
    <Grid container alignItems="center" className="suggested-media__item">
      <Grid item xs={1}>
        <Box
          display="flex"
          justifyContent="flex-end"
          flexDirection="column"
          mr={1}
        >
          <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.accept" defaultMessage="Match media" description="Tooltip for a button that is a green check mark. Pressing this button causes the media item next to the button to be accepted as a matched item, and removed from the suggested items list." />}>
            <span>
              <ButtonMain
                iconCenter={<AcceptIcon />}
                onClick={reportType === 'blank' ? () => { handleDestroyAndReplace(relationshipItem); } : () => { handleConfirm(relationshipItem); }}
                variant="text"
                size="large"
                theme="validation"
                disabled={disableAcceptRejectButtons}
                className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.accept} similarity-media-item__accept-relationship`}
              />
            </span>
          </Tooltip>
          <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.reject" defaultMessage="Reject media" description="Tooltip for a button that is a red X mark. Pressing this button causes the media item next to the button to be rejected as a matched item, and removed from the suggested items list." />}>
            <span>
              <ButtonMain
                iconCenter={<RejectIcon />}
                onClick={() => {
                  handleReject(relationshipItem);
                }}
                variant="text"
                size="large"
                theme="error"
                disabled={disableAcceptRejectButtons}
                className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.reject} similarity-media-item__reject-relationship`}
              />
            </span>
          </Tooltip>
        </Box>
      </Grid>
      <Grid item xs={10}>
        {
          relationshipItem?.target && (
            <SmallMediaCard
              customTitle={relationshipItem.target.title}
              details={details}
              media={relationshipItem.target.media}
              description={relationshipItem.target.description}
              maskContent={relationshipItem.target.show_warning_cover}
              superAdminMask={superAdminMask}
              onClick={() => setSelectedItemId(relationshipItem.target.dbid)}
            />
          )
        }
        { selectedItemId === relationshipItem?.target_id ?
          <MediaAndRequestsDialogComponent
            mediaSlug={
              <MediaSlug
                mediaType={relationshipItem?.target?.type}
                slug={relationshipItem?.target?.title}
                details={details}
              />
            }
            projectMediaId={selectedItemId}
            onClick={swallowClick}
            onClose={() => setSelectedItemId(null)}
          />
          : null }
      </Grid>
      <Grid item xs={1}>
        <Box
          display="flex"
          justifyContent="flex-end"
          flexDirection="column"
          ml={1}
        >
          <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.spam" defaultMessage="Mark media as spam" description="Tooltip for a button that is an octogon with an exclamation mark. Pressing this button causes the media item next to the button to be marked as spam, and removed from the suggested items list." />}>
            <span>
              <ButtonMain
                iconCenter={<SpamIcon />}
                onClick={() => handleArchiveTarget(CheckArchivedFlags.SPAM, relationshipItem)}
                variant="text"
                size="large"
                theme="lightText"
                disabled={disableAcceptRejectButtons}
                className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.spamTrash}`}
              />
            </span>
          </Tooltip>
          <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.trash" defaultMessage="Send media to trash" description="Tooltip for a button that is a waste bin. Pressing this button causes the media item next to the button to be sent to the trash  and removed from the suggested items list." />}>
            <span>
              <ButtonMain
                iconCenter={<TrashIcon />}
                onClick={() => handleArchiveTarget(CheckArchivedFlags.TRASHED, relationshipItem)}
                variant="text"
                size="large"
                theme="lightText"
                disabled={disableAcceptRejectButtons}
                className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.spamTrash}`}
              />
            </span>
          </Tooltip>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <React.Fragment>
      <div className={cx('media__suggestions-column', styles['media-suggestions'], styles['media-item-content'])}>
        { relationships.length > 0 ?
          <>
            <Box className={classes.containerBox} mb={2}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.previous" defaultMessage="Previous" description="Label for the 'go to previous page' button on paginated suggestions" />}>
                  <span>
                    <ButtonMain
                      iconCenter={<PreviousIcon />}
                      onClick={() => {
                        if (cursor - pageSize >= 0) {
                          setCursor(cursor - pageSize);
                        }
                      }}
                      variant="text"
                      size="default"
                      theme="lightText"
                      disabled={isPaginationLoading || cursor - pageSize < 0}
                    />
                  </span>
                </Tooltip>
                <span className={cx('typography-body1', classes.title)}>
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
                </span>
                <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.next" defaultMessage="Next" description="Label for the 'go to next page' button on paginated suggestions" />}>
                  <span>
                    <ButtonMain
                      iconCenter={<NextIcon />}
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
                      variant="text"
                      size="default"
                      theme="lightText"
                      disabled={isPaginationLoading || cursor + pageSize >= totalCount}
                    />
                  </span>
                </Tooltip>
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center">
                <span className="typography-overline">
                  <FormattedMessage
                    id="mediaSuggestionsComponent.bulkEdit"
                    defaultMessage="Bulk edit"
                    description="A header that tells the user the buttons to follow are for bulk editing items (editing more than one item at a time, like marking all as spam)"
                  />
                </span>
              </Box>
              <Grid container justify="center" direction="row" spacing={1}>
                <Grid item>
                  <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.bulkAccept" defaultMessage="Match all media on this page" description="Tooltip for a button that is a green check mark. Pressing it causes all visible media items on the page to be confirmed as matched media." />}>
                    <span>
                      <ButtonMain
                        iconCenter={<AcceptIcon />}
                        onClick={() => openBulkAcceptDialog()}
                        variant="text"
                        size="large"
                        theme="validation"
                        disabled={disableAcceptRejectButtons}
                        className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.accept}`}
                      />
                    </span>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.bulkReject" defaultMessage="Reject all medias on this page" description="Tooltip for a button that is a red X mark. Pressing it causes all visible media items on the page to be rejected and removed from the suggestions list." />}>
                    <span>
                      <ButtonMain
                        iconCenter={<RejectIcon />}
                        onClick={() => openBulkRejectDialog()}
                        variant="text"
                        size="large"
                        theme="error"
                        disabled={disableAcceptRejectButtons}
                        className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.reject}`}
                      />
                    </span>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.bulkSpam" defaultMessage="Mark all medias on this page as spam" description="Tooltip for a button that is an octagon with an exclamation mark. Pressing this button causes all visible media items on the page to be marked as 'spam' and removed from the suggestions list." />}>
                    <span>
                      <ButtonMain
                        iconCenter={<SpamIcon />}
                        onClick={() => openBulkSpamDialog()}
                        variant="text"
                        size="large"
                        theme="lightText"
                        disabled={disableAcceptRejectButtons}
                        className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.spamTrash}`}
                      />
                    </span>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip arrow title={<FormattedMessage id="mediaSuggestionsComponent.bulkTrash" defaultMessage="Send all medias on this page to trash" description="Tooltip for a button that is a trash bin. Pressing this button causes all visible media items on the page to be sent to the 'trash' and removed from the suggestions list." />}>
                    <span>
                      <ButtonMain
                        iconCenter={<TrashIcon />}
                        onClick={() => openBulkTrashDialog()}
                        variant="text"
                        size="large"
                        theme="lightText"
                        disabled={disableAcceptRejectButtons}
                        className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.spamTrash}`}
                      />
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
              <ButtonMain
                iconCenter={<HelpIcon />}
                onClick={handleHelp}
                variant="text"
                size="default"
                theme="brand"
                className={classes.helpIconContainer}
              />
            </Box>
            <>
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
                  <ButtonMain
                    variant="text"
                    size="default"
                    theme="text"
                    onClick={closeBulkAcceptDialog}
                    label={
                      <FormattedMessage
                        id="global.cancel"
                        defaultMessage="Cancel"
                        description="Regular Cancel action label"
                      />
                    }
                  />
                  <ButtonMain
                    variant="contained"
                    size="default"
                    theme="brand"
                    onClick={handleBulkConfirm}
                    label={
                      <FormattedMessage
                        id="mediaSuggestionsComponent.dialogBulkAcceptConfirm"
                        defaultMessage="Match all"
                        description="Button that a user presses to confirm that they are going to match all visible suggested media"
                        values={{
                          number: relationships.slice(cursor, cursor + pageSize).length,
                        }}
                      />
                    }
                  />
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
                  <ButtonMain
                    variant="text"
                    size="default"
                    theme="text"
                    onClick={closeBulkSpamDialog}
                    label={
                      <FormattedMessage
                        id="global.cancel"
                        defaultMessage="Cancel"
                        description="Regular Cancel action label"
                      />
                    }
                  />
                  <ButtonMain
                    variant="contained"
                    size="default"
                    theme="brand"
                    onClick={() => handleBulkArchiveTarget(CheckArchivedFlags.SPAM)}
                    label={
                      <FormattedMessage
                        id="mediaSuggestionsComponent.dialogBulkSpamConfirm"
                        defaultMessage="Mark as spam"
                        description="Button that a user presses to confirm that they are going to mark all visible suggested media as spam"
                        values={{
                          number: relationships.slice(cursor, cursor + pageSize).length,
                        }}
                      />
                    }
                  />
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
                  <ButtonMain
                    variant="text"
                    size="default"
                    theme="text"
                    onClick={closeBulkTrashDialog}
                    label={
                      <FormattedMessage
                        id="global.cancel"
                        defaultMessage="Cancel"
                        description="Regular Cancel action label"
                      />
                    }
                  />
                  <ButtonMain
                    variant="contained"
                    size="default"
                    theme="brand"
                    onClick={() => handleBulkArchiveTarget(CheckArchivedFlags.TRASHED)}
                    label={
                      <FormattedMessage
                        id="mediaSuggestionsComponent.dialogBulkTrashConfirm"
                        defaultMessage="Send to trash"
                        description="Button that a user presses to confirm that they are going to send all visible suggested media to trash"
                        values={{
                          number: relationships.slice(cursor, cursor + pageSize).length,
                        }}
                      />
                    }
                  />
                </DialogActions>
              </Dialog>
              <Dialog
                open={isBulkRejectDialogOpen}
                onClose={closeBulkRejectDialog}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  <FormattedMessage
                    id="mediaSuggestionsComponent.dialogBulkRejectTitle"
                    defaultMessage="Are you sure you want to reject {number} suggestions?"
                    description="Prompt to a user when they choose to reject media in bulk"
                    values={{
                      number: relationships.slice(cursor, cursor + pageSize).length,
                    }}
                  />
                </DialogTitle>
                <DialogActions>
                  <ButtonMain
                    variant="text"
                    size="default"
                    theme="text"
                    onClick={closeBulkRejectDialog}
                    label={<FormattedMessage
                      id="global.cancel"
                      defaultMessage="Cancel"
                      description="Regular Cancel action label"
                    />}
                  />
                  <ButtonMain
                    variant="contained"
                    size="default"
                    theme="brand"
                    onClick={() => handleBulkReject()}
                    label={<FormattedMessage
                      id="mediaSuggestionsComponent.dialogBulkRejectConfirm"
                      defaultMessage="Reject"
                      description="Button that a user presses to confirm that they are going to reject all visible suggested media"
                      values={{
                        number: relationships.slice(cursor, cursor + pageSize).length,
                      }}
                    />}
                  />
                </DialogActions>
              </Dialog>
            </>
          </> : null }
        <div id="suggested-media__items">
          { isPaginationLoading ?
            <MediasLoading theme="grey" variant="inline" size="medium" /> :
            relationships
              .slice(cursor, cursor + pageSize)
              .map(relationshipItem => (
                <RelationshipItem
                  key={relationshipItem.target_id}
                  relationshipItem={relationshipItem}
                  details={[
                    <FormattedMessage
                      id="mediaSuggestions.lastSubmitted"
                      defaultMessage="Last submitted {date}"
                      description="Shows the last time a media was submitted (on feed request media card)"
                      values={{
                        date: intl.formatDate(+relationshipItem?.target?.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
                      }}
                    />,
                    <FormattedMessage
                      id="mediaSuggestions.requestsCount"
                      defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
                      description="Header of requests list. Example: 26 requests"
                      values={{ requestsCount: relationshipItem?.target?.requests_count }}
                    />,
                  ]}
                />
              ))}
        </div>
      </div>
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
  superAdminMask: PropTypes.bool,
};

MediaSuggestionsComponent.defaultProps = {
  superAdminMask: false,
};

// eslint-disable-next-line
export { MediaSuggestionsComponent as MediaSuggestionsComponentTest };
export default withSetFlashMessage(injectIntl(MediaSuggestionsComponent));
