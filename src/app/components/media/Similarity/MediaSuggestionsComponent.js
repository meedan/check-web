import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Box from '@material-ui/core/Box';
import { browserHistory } from 'react-router';
import Button from '@material-ui/core/Button';
import HelpIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Typography from '@material-ui/core/Typography';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import { makeStyles } from '@material-ui/core/styles';
import { can } from '../../Can';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import MediaExpanded from '../MediaExpanded';
import MediaRequests from '../MediaRequests';
import MediaComments from '../MediaComments';
import SelectProjectDialog from '../SelectProjectDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import globalStrings from '../../../globalStrings';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import {
  Column,
  brandHighlight,
  checkBlue,
  completedGreen,
  alertRed,
  brandSecondary,
  backgroundMain,
} from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  title: {
    color: brandHighlight,
    fontSize: 12,
    lineHeight: 'normal',
    letterSpacing: 'normal',
  },
  helpIcon: {
    color: checkBlue,
  },
  disabled: {
    opacity: 0.5,
  },
  media: {
    background: 'white',
    border: `1px solid ${brandSecondary}`,
    borderRadius: 8,
    color: 'black',
  },
  noMedia: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  spaced: {
    padding: theme.spacing(1),
  },
  suggestionsTopBar: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    margin: theme.spacing(-2),
    marginBottom: 0,
    borderBottom: `1px solid ${brandSecondary}`,
    position: 'sticky',
    top: theme.spacing(-2),
    background: backgroundMain,
    zIndex: 2,
  },
  suggestionsBackButton: {
    padding: 0,
  },
  suggestionsNoMediaBox: {
    border: `1px solid ${brandSecondary}`,
    borderRadius: theme.spacing(1),
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
}));

const MediaSuggestionsComponent = ({
  mainItem,
  relationships,
  team,
  setFlashMessage,
}) => {
  const classes = useStyles();
  const params = new URLSearchParams(window.location.search);
  const listIndex = params.get('listIndex');
  const mainItemUrl = `${window.location.pathname.replace(/\/suggested-matches$/, '')}?listIndex=${listIndex}`;
  const [index, setIndex] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(false), [setIsDialogOpen]);

  const relationship = relationships[index];
  const projectMedia = relationship ? { dbid: relationship.target_id } : null;
  const itemUrl = projectMedia ? window.location.pathname.replace(/[0-9]+\/suggested-matches$/, projectMedia.dbid) : '';
  const total = relationships.length;
  const hasNext = (index + 1 < total);
  const hasPrevious = (index > 0);

  const handleGoBack = () => {
    browserHistory.push(mainItemUrl);
  };

  const handleNext = () => {
    if (hasNext) {
      setIndex(index + 1);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setIndex(index - 1);
    }
  };

  const handleCompleted = () => {};

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
    setFlashMessage(errorMessage, 'error');
  };

  const handleReplace = () => {
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
          new_project_media_id: relationship.target.id,
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

  const handleDestroyAndReplace = () => {
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
          handleReplace();
        }
      },
      onError: onFailure,
    });
  };

  const handleConfirm = () => {
    handleNext();

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
    handleNext();

    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        rejection: true,
        input: {
          id: relationship.id,
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

  const handleHelp = () => {
    window.open('http://help.checkmedia.org/en/articles/4705965-similarity-matching-and-suggestions');
  };

  return (
    <React.Fragment>
      <Column className="media__column">
        <Box className={classes.suggestionsTopBar}>
          <Button startIcon={<IconArrowBack />} onClick={handleGoBack} size="small" className={classes.suggestionsBackButton}>
            <FormattedMessage
              id="mediaSuggestionsComponent.back"
              defaultMessage="Back"
            />
          </Button>
          <Typography variant="button" display="block" className={classes.title}>
            <FormattedMessage
              id="mediaSuggestionsComponent.title"
              defaultMessage="{total, plural, one {{current} of # suggested media} other {{current} of # suggested medias}}"
              values={{
                current: total === 0 ? 0 : index + 1,
                total,
              }}
            />
          </Typography>
        </Box>
        <Box display="flex" width="1" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Typography variant="body2">
              { mainItem.report_type === 'blank' ?
                <FormattedMessage
                  id="mediaSuggestionsComponent.questionBlank"
                  defaultMessage="Is the suggested media similar to the imported report?"
                /> :
                <FormattedMessage
                  id="mediaSuggestionsComponent.question"
                  defaultMessage="Is this media a good match for this claim?"
                /> }
            </Typography>
            <IconButton onClick={handleHelp}>
              <HelpIcon className={classes.helpIcon} />
            </IconButton>
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handlePrevious} disabled={!hasPrevious}>
              <KeyboardArrowLeftIcon fontSize="large" />
            </IconButton>
            {can(team.permissions, 'update Relationship') ?
              <IconButton
                onClick={mainItem.report_type === 'blank' ? handleDestroyAndReplace : handleConfirm}
                style={{ color: completedGreen }}
                disabled={total === 0}
                className={total === 0 ? classes.disabled : ''}
                id="similarity-media-item__accept-relationship"
              >
                <CheckCircleOutlineIcon fontSize="large" />
              </IconButton> : null
            }
            {can(team.permissions, 'destroy Relationship') ?
              <React.Fragment>
                <IconButton
                  onClick={openDialog}
                  style={{ color: alertRed }}
                  disabled={total === 0}
                  className={total === 0 ? classes.disabled : ''}
                  id="similarity-media-item__reject-relationship"
                >
                  <HighlightOffIcon fontSize="large" />
                </IconButton>
                <SelectProjectDialog
                  open={isDialogOpen}
                  excludeProjectDbids={[]}
                  title={
                    <FormattedMessage
                      id="mediaSuggestionsComponent.dialogRejectTitle"
                      defaultMessage="Choose a destination folder for this item"
                    />
                  }
                  cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
                  submitLabel={<FormattedMessage id="mediaSuggestionsComponent.moveItem" defaultMessage="Move item" />}
                  submitButtonClassName="media-actions-bar__add-button"
                  onCancel={closeDialog}
                  onSubmit={handleReject}
                />
              </React.Fragment> : null
            }
            <IconButton onClick={handleNext} disabled={!hasNext}>
              <KeyboardArrowRightIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
        <Box className={projectMedia ? classes.media : classes.noMedia}>
          { projectMedia ?
            <MediaExpanded
              media={projectMedia}
              mediaUrl={itemUrl}
              linkTitle
            /> :
            <Box justifyContent="center" className={classes.suggestionsNoMediaBox}>
              <Box mb={2}>
                <Typography>
                  <FormattedMessage
                    id="mediaSuggestionsComponent.noSuggestions"
                    defaultMessage="There is no suggested media."
                  />
                </Typography>
              </Box>
              <Button onClick={handleGoBack} color="primary" variant="contained" className="media-page__back-button">
                <FormattedMessage
                  id="mediaSuggestionsComponent.goBack"
                  defaultMessage="Back to main view"
                />
              </Button>
            </Box>
          }
        </Box>
      </Column>
      <Column className="media__annotations-column" overflow="hidden">
        { team.smooch_bot ?
          <React.Fragment>
            <Tabs indicatorColor="primary" textColor="primary" className="media__annotations-tabs" value="requests">
              <Tab
                label={
                  <FormattedMessage
                    id="mediaSuggestionsComponent.requests"
                    defaultMessage="Requests"
                  />
                }
                value="requests"
                className="media-tab__requests"
              />
            </Tabs>
            { /* Set maxHeight to screen height - (media bar + tabs) */ }
            <Box maxHeight="calc(100vh - 112px)" style={{ overflowY: 'auto' }}>
              { projectMedia ?
                <MediaRequests media={{ dbid: projectMedia.dbid }} all={false} /> :
                <Typography variant="subtitle2" className={classes.spaced}>
                  <FormattedMessage
                    id="mediaSuggestionsComponent.noRequests"
                    defaultMessage="No requests"
                  />
                </Typography>
              }
            </Box>
          </React.Fragment> :
          <React.Fragment>
            <Tabs indicatorColor="primary" textColor="primary" className="media__annotations-tabs" value="notes">
              <Tab
                label={
                  <FormattedMessage
                    id="mediaSuggestionsComponent.notes"
                    defaultMessage="Notes"
                  />
                }
                value="notes"
                className="media-tab__notes"
              />
            </Tabs>
            { /* Set maxHeight to screen height - (media bar + tabs) */ }
            <Box maxHeight="calc(100vh - 112px)" style={{ overflowY: 'auto' }}>
              { projectMedia ?
                <MediaComments media={{ dbid: projectMedia.dbid }} /> :
                <Typography variant="subtitle2" className={classes.spaced}>
                  <FormattedMessage
                    id="mediaSuggestionsComponent.noNotes"
                    defaultMessage="No notes"
                  />
                </Typography>
              }
            </Box>
          </React.Fragment>
        }
      </Column>
    </React.Fragment>
  );
};

MediaSuggestionsComponent.propTypes = {
  mainItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    report_type: PropTypes.string.isRequired,
  }).isRequired,
  relationships: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    target_id: PropTypes.number.isRequired,
  })).isRequired,
  team: PropTypes.shape({
    smooch_bot: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

export default withSetFlashMessage(MediaSuggestionsComponent);
