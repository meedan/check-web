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
import MediaExpanded from '../MediaExpanded';
import MediaRequests from '../MediaRequests';
import MediaComments from '../MediaComments';
import {
  Column,
  inProgressYellow,
  checkBlue,
  completedGreen,
  alertRed,
  brandSecondary,
} from '../../../styles/js/shared';
import { isBotInstalled } from '../../../helpers';

const useStyles = makeStyles(theme => ({
  title: {
    color: inProgressYellow,
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
    paddingTop: theme.spacing(5),
    textAlign: 'center',
  },
  spaced: {
    padding: theme.spacing(1),
  },
}));

const MediaSuggestionsComponent = ({
  relationships,
  team,
}) => {
  const classes = useStyles();
  const itemUrl = window.location.pathname.replace(/\/suggested-matches$/, '');
  const [index, setIndex] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const relationship = relationships[index];
  const projectMedia = relationship ? { dbid: relationship.target_id } : null;
  const total = relationships.length;
  const hasNext = (index + 1 < total);
  const hasPrevious = (index > 0);

  const handleGoBack = () => {
    browserHistory.push(itemUrl);
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

  const handleCompleted = () => {
    setSaving(false);
  };

  const handleConfirm = () => {
    setSaving(true);

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
      onCompleted: () => {
        handleCompleted();
      },
      onError: () => {
        handleCompleted();
      },
    });
  };

  const handleReject = () => {
    setSaving(true);

    const mutation = graphql`
      mutation MediaSuggestionsComponentDestroyRelationshipMutation($input: DestroyRelationshipInput!) {
        destroyRelationship(input: $input) {
          source_project_media {
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
          target_project_media {
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
        },
      },
      onCompleted: () => {
        handleCompleted();
      },
      onError: () => {
        handleCompleted();
      },
    });
  };

  const handleHelp = () => {
    window.open('http://help.checkmedia.org/en/articles/4705965-similarity-matching-and-suggestions');
  };

  return (
    <React.Fragment>
      <Column className="media__column">
        <Box display="flex" width="1" justifyContent="space-between" alignItems="center">
          <Box>
            <Button startIcon={<IconArrowBack />} onClick={handleGoBack} size="small" disabled={saving}>
              <FormattedMessage
                id="mediaSuggestionsComponent.back"
                defaultMessage="Back"
              />
            </Button>
            <Typography variant="button" display="block" className={classes.title}>
              <FormattedMessage
                id="mediaSuggestionsComponent.title"
                defaultMessage="Suggested matches ({current} of {total})"
                values={{
                  current: total === 0 ? 0 : index + 1,
                  total,
                }}
              />
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2">
                <FormattedMessage
                  id="mediaSuggestionsComponent.question"
                  defaultMessage="Is the suggested media similar to the main?"
                />
              </Typography>
              <IconButton onClick={handleHelp}>
                <HelpIcon className={classes.helpIcon} />
              </IconButton>
            </Box>
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handlePrevious} disabled={!hasPrevious || saving}>
              <KeyboardArrowLeftIcon fontSize="large" />
            </IconButton>
            <IconButton
              onClick={handleConfirm}
              style={{ color: completedGreen }}
              disabled={total === 0 || saving}
              className={total === 0 || saving ? classes.disabled : ''}
            >
              <CheckCircleOutlineIcon fontSize="large" />
            </IconButton>
            <IconButton
              onClick={handleReject}
              style={{ color: alertRed }}
              disabled={total === 0 || saving}
              className={total === 0 || saving ? classes.disabled : ''}
            >
              <HighlightOffIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={handleNext} disabled={!hasNext || saving}>
              <KeyboardArrowRightIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
        <Box className={projectMedia ? classes.media : classes.noMedia}>
          { projectMedia ?
            <MediaExpanded
              media={projectMedia}
              mediaUrl={itemUrl}
            /> :
            <Box justifyContent="center">
              <Box mb={2}>
                <Typography>
                  <FormattedMessage
                    id="mediaSuggestionsComponent.noSuggestions"
                    defaultMessage="There are no suggested matches."
                  />
                </Typography>
              </Box>
              <Button onClick={handleGoBack} color="primary" variant="contained">
                <FormattedMessage
                  id="mediaSuggestionsComponent.goBack"
                  defaultMessage="Back to main view"
                />
              </Button>
            </Box>
          }
        </Box>
      </Column>
      <Column className="media__annotations-column">
        { isBotInstalled(team, 'smooch') ?
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
            { projectMedia ?
              <MediaRequests media={{ dbid: projectMedia.dbid }} all={false} /> :
              <Typography variant="subtitle2" className={classes.spaced}>
                <FormattedMessage
                  id="mediaSuggestionsComponent.noRequests"
                  defaultMessage="No requests"
                />
              </Typography>
            }
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
            { projectMedia ?
              <MediaComments media={{ dbid: projectMedia.dbid }} /> :
              <Typography variant="subtitle2" className={classes.spaced}>
                <FormattedMessage
                  id="mediaSuggestionsComponent.noNotes"
                  defaultMessage="No notes"
                />
              </Typography>
            }
          </React.Fragment>
        }
      </Column>
    </React.Fragment>
  );
};

MediaSuggestionsComponent.propTypes = {
  relationships: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    target_id: PropTypes.number.isRequired,
  })).isRequired,
  team: PropTypes.shape({
    team_bot_installations: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          team_bot: PropTypes.shape({
            identifier: PropTypes.string,
          }),
        }),
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

export default MediaSuggestionsComponent;
