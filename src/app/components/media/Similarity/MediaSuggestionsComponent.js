import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import {
  Box,
  Grid,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { browserHistory } from 'react-router';
import HelpIcon from '@material-ui/icons/HelpOutline';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import IconMoreVert from '@material-ui/icons/MoreVert';
import { makeStyles } from '@material-ui/core/styles';
import SelectProjectDialog from '../SelectProjectDialog';
import { can } from '../../Can';
// import MediaCardComponent from '../../cds/media-cards/MediaCardComponent';
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
  checkBlue,
  completedGreen,
  alertRed,
  brandSecondary,
  black54,
} from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  title: {
    fontWeight: 'bold',
    lineHeight: 'normal',
    letterSpacing: 'normal',
  },
  helpIcon: {
    color: checkBlue,
  },
  disabled: {
    opacity: 0.5,
  },
  accept: {
    color: completedGreen,
    padding: theme.spacing(0.5),
  },
  reject: {
    color: alertRed,
    padding: theme.spacing(0.5),
  },
  media: {
    border: `1px solid ${brandSecondary}`,
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
  },
  noMedia: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'white',
  },
  spaced: {
    padding: theme.spacing(1),
  },
  suggestionsTopBar: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    margin: theme.spacing(-2),
    marginBottom: 0,
    position: 'sticky',
    top: theme.spacing(-2),
    zIndex: 2,
  },
  suggestionsBackButton: {
    padding: 0,
    color: black54,
  },
  suggestionsNoMediaBox: {
    border: `1px solid ${brandSecondary}`,
    borderRadius: theme.spacing(1),
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  spamTrashBox: {
    width: '100%',
    textAlign: 'right',
  },
  card: {
    border: `1px solid ${brandSecondary}`,
    borderRadius: theme.spacing(2),
    color: 'black',
    backgroundColor: 'white',
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
  setFlashMessage,
  relay,
  totalCount,
  pageSize,
  intl,
}) => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [openEl, setOpenEl] = React.useState(null);
  const [isMutationPending, setIsMutationPending] = React.useState(false);
  const [selectedRelationship, setSelectedRelationship] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [cursor, setCursor] = React.useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = React.useState(false);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(false), [setIsDialogOpen]);

  const handleCompleted = () => {
    setIsMutationPending(false);
  };

  const handleOpenMenu = element => (event) => {
    setAnchorEl(event.currentTarget);
    setOpenEl(element);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setOpenEl(null);
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
    mutation MediaSuggestionsComponentDestroyRelationshipMutation($input: DestroyRelationshipInput!, $rejection: Boolean!) {
      destroyRelationship(input: $input) {
        deletedId
        source_project_media @include(if: $rejection) {
          hasMain: is_confirmed_similar_to_another_item
          suggestionsCount: suggested_similar_items_count
          confirmedSimilarCount: confirmed_similar_items_count
          suggested_similar_relationships(first: 10000) {
            edges {
              node {
                id
                target_id
              }
            }
          }
        }
        target_project_media @include(if: $rejection) {
          hasMain: is_confirmed_similar_to_another_item
          suggestionsCount: suggested_similar_items_count
          confirmedSimilarCount: confirmed_similar_items_count
          is_suggested
          suggested_similar_relationships(first: 10000) {
            edges {
              node {
                id
                target_id
              }
            }
          }
        }
      }
    }
  `;

  const handleDestroyAndReplace = (relationship) => {
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
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

  const handleConfirm = (relationship) => {
    const relationship_type = 'confirmed_sibling';

    const mutation = graphql`
      mutation MediaSuggestionsComponentUpdateRelationshipMutation($input: UpdateRelationshipInput!) {
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
            suggested_similar_relationships(first: 10000) {
              edges {
                node {
                  id
                  target_id
                }
              }
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
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
            suggested_similar_relationships(first: 10000) {
              edges {
                node {
                  id
                  target_id
                }
              }
            }
          }
        }
      }
    `;

    setIsMutationPending(true);
    commitMutation(Store, {
      mutation,
      variables: {
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

  const handleReject = (project) => {
    setIsDialogOpen(false);

    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        rejection: true,
        input: {
          id: selectedRelationship.id,
          add_to_project_id: project.dbid,
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

  const handleArchiveTarget = (archived, relationship) => {
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
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
      <Box className={classes.card}>
        <Typography variant="h2" className="similarity-media-no-items">
          <FormattedMessage
            id="mediaSuggestionsComponent.noItems"
            defaultMessage="{total, plural, one {{total} suggested media} other {{total} suggested medias}}"
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
            <Button
              disabled={isPaginationLoading || cursor - pageSize < 0}
              onClick={() => {
                if (cursor - pageSize >= 0) {
                  setCursor(cursor - pageSize);
                }
              }}
            >
              <FormattedMessage
                id="mediaSuggestionsComponent.previous"
                defaultMessage="Previous"
                description="Label for the 'go to previous page' button on paginated suggestions"
              />
            </Button>
            <Button
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
              <FormattedMessage
                id="mediaSuggestionsComponent.back"
                defaultMessage="Next"
                description="Label for the 'go to next page' button on paginated suggestions"
              />
            </Button>
            <Box display="flex" alignItems="center" className={classes.suggestionsTopBar}>
              <Typography variant="body" className={classes.title}>
                <FormattedMessage
                  id="mediaSuggestionsComponent.title"
                  defaultMessage="{start} to {end} of {total, plural, one {{total} suggested media} other {{total} suggested medias}}"
                  description="A header that tells the user how many suggested media items are in the list to follow"
                  values={{
                    total: totalCount,
                    start: cursor + 1,
                    end: Math.min(cursor + pageSize, totalCount),
                  }}
                />
              </Typography>
              <IconButton onClick={handleHelp}>
                <HelpIcon className={classes.helpIcon} />
              </IconButton>
            </Box>
            <Typography variant="body2">
              <FormattedMessage
                id="mediaSuggestionsComponent.question"
                defaultMessage="Are the medias below a good match for the claim and medias on the left?"
                description="Subtitle for similarity matching widget"
              />
            </Typography>
            <Box display="flex" alignItems="center">
              <>
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
                  <IconButton
                    onClick={reportType === 'blank' ? () => { handleDestroyAndReplace(relationshipItem); } : () => { handleConfirm(relationshipItem); }}
                    disabled={disableAcceptRejectButtons}
                    className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.accept} similarity-media-item__accept-relationship`}
                  >
                    <CheckCircleOutlineIcon fontSize="large" />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedRelationship(relationshipItem);
                      openDialog();
                    }}
                    disabled={disableAcceptRejectButtons}
                    className={`${disableAcceptRejectButtons ? classes.disabled : ''} ${classes.reject} similarity-media-item__reject-relationship`}
                  >
                    <HighlightOffIcon fontSize="large" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={11}>
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
                  description={relationshipItem?.target?.description}
                  url={relationshipItem?.target?.url}
                  onClick={() => window.open(`/${team.slug}/media/${relationshipItem.target_id}`, '_blank')}
                  menu={(
                    <div>
                      <IconButton
                        tooltip={<FormattedMessage id="mediaSuggestionsMenu.tooltip" defaultMessage="Item actions" description="Label for a tooltip on a menu button, indicating that this will list a series of actions that can be performed on an item" />}
                        onClick={handleOpenMenu(relationshipItem.id)}
                      >
                        <IconMoreVert />
                      </IconButton>
                      <Menu
                        className="media-suggestions-menu"
                        anchorEl={anchorEl}
                        open={openEl === relationshipItem.id}
                        onClose={handleCloseMenu}
                      >
                        <MenuItem
                          onClick={() => handleArchiveTarget(CheckArchivedFlags.SPAM, relationshipItem)}
                        >
                          <FormattedMessage
                            id="mediaSuggestionsComponent.sendItemsToSpam"
                            defaultMessage="Mark as spam"
                            description="Label for a menu item, indicating that clicking this will mark an item as spam and send it to the spam list"
                          />
                        </MenuItem>
                        <MenuItem onClick={() => handleArchiveTarget(CheckArchivedFlags.TRASHED, relationshipItem)}>
                          <FormattedMessage
                            id="mediaSuggestionsComponent.sendItemsToTrash"
                            defaultMessage="Send to trash"
                            description="Label for a menu item, indicating that clicking this will mark an item as trash and send it to the trash list"
                          />
                        </MenuItem>
                      </Menu>
                    </div>
                  )}
                />
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
};

// eslint-disable-next-line
export { MediaSuggestionsComponent as MediaSuggestionsComponentTest };
export default withSetFlashMessage(injectIntl(MediaSuggestionsComponent));
