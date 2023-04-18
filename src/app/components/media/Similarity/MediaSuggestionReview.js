import React from 'react';
import PropTypes from 'prop-types';
import { Store } from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import {
  CheckCircleOutline as AcceptIcon,
  HighlightOff as RejectIcon,
} from '@material-ui/icons';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { withSetFlashMessage } from '../../FlashMessage';
import { can } from '../../Can';

const useStyles = makeStyles(theme => ({
  root: {
    background: 'var(--alertLight)',
    borderColor: 'var(--alertLight)',
    borderRadius: '8px',
    marginBottom: `${theme.spacing(2)}px`,
    fontSize: '12px',
  },
  title: {
    fontSize: '16px',
    marginBottom: `${theme.spacing(1)}px`,
  },
  prompt: {
    marginBottom: `${theme.spacing(1)}px`,
  },
  button: {
    borderRadius: '8px',
    float: 'right',
  },
  accept: {
    color: 'var(--validationMain)',
    padding: '4px',
  },
  reject: {
    color: 'var(--errorMain)',
    padding: '4px',
  },
}));

const MediaSuggestionReview = ({ projectMedia, setFlashMessage }) => {
  const classes = useStyles();
  const [isMutationPending, setIsMutationPending] = React.useState(false);
  const disableAcceptRejectButtons = !can(projectMedia.team.permissions, 'update Relationship') || isMutationPending;
  const suggestedMainItem = projectMedia.suggested_main_item;
  const suggestedMainItemLink = `/${suggestedMainItem?.team?.slug}/media/${suggestedMainItem?.dbid}/similar-media?reviewId=${projectMedia.dbid}`;
  const confirmedMainItem = projectMedia.confirmed_main_item;

  const destroyMutation = graphql`
    mutation MediaSuggestionReviewDestroyRelationshipMutation($input: DestroyRelationshipInput!, $rejection: Boolean!) {
      destroyRelationship(input: $input) {
        deletedId
        source_project_media @include(if: $rejection) {
          suggested_main_item {
            id
          }
          confirmed_main_item {
            id
          }
          claim_description {
            id
          }
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
          suggested_main_item {
            id
          }
          confirmed_main_item {
            id
          }
          claim_description {
            id
          }
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

  const handleCompleted = () => {
    setIsMutationPending(false);
  };

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
    setIsMutationPending(false);
    setFlashMessage(errorMessage, 'error');
  };

  const getSuggestedParentRelationshipId = () => {
    const relationships = projectMedia.suggested_similar_relationships.edges;
    return relationships?.find(item => item.node.source_id === suggestedMainItem?.dbid && item.node.target_id === projectMedia.dbid)?.node?.id;
  };

  const handleAccept = () => {
    const relationship_type = 'confirmed_sibling';

    const mutation = graphql`
      mutation MediaSuggestionReviewUpdateRelationshipMutation($input: UpdateRelationshipInput!) {
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
            confirmed_main_item {
              dbid
              team {
                slug
              }
            }
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
          id: getSuggestedParentRelationshipId(),
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

  const handleReject = () => {
    setIsMutationPending(true);
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        rejection: true,
        input: {
          id: getSuggestedParentRelationshipId(),
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

  if (projectMedia.is_confirmed_similar_to_another_item) {
    const confirmedMainItemLink = `/${confirmedMainItem?.team?.slug}/media/${confirmedMainItem?.dbid}`;
    return (
      <Card
        variant="outlined"
        className={classes.root}
        elevation={0}
      >
        <CardContent>
          <Typography className={classes.title} variant="h5" component="h1">
            <FormattedMessage id="mediaSuggestionReview.matchTitle" defaultMessage="Matched claim" description="Title of a box that lets the user open a claim that this has been matched with." />
          </Typography>
          <Typography className={classes.prompt} variant="body1" component="p">
            <FormattedMessage
              id="mediaSuggestionReview.matchDescription"
              defaultMessage="This media has been matched to the claim and fact-check below."
              description="Hint text to tell the user what the 'Open claim' button does."
            />
          </Typography>
          <Grid container direction="row" justifyContent="center" alignItems="flex-end">
            <Grid item xs={6}>
              <></>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                className={classes.button}
                onClick={() => browserHistory.push(confirmedMainItemLink)}
              >
                <FormattedMessage id="mediaSuggestionReview.openButtonMatched" defaultMessage="Open claim" description="A label for a button that opens a claim item" />
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (!getSuggestedParentRelationshipId()) return null;

  return (
    <Card
      variant="outlined"
      className={classes.root}
    >
      <CardContent>
        <Typography className={classes.title} variant="h5" component="h1">
          <FormattedMessage id="mediaSuggestionReview.title" defaultMessage="Suggested Claim and Fact-check" description="Title of a box that prompts the user to review a suggestion for a related Claim and Fact-check (technical terms from elsewhere in the app)." />
        </Typography>
        <Typography className={classes.prompt} variant="body1" component="p">
          <FormattedMessage id="mediaSuggestionReview.prompt" defaultMessage="Is the Claim or Fact-check below a good match for this media?" description="Text that prompts the user to review a suggestion for a related Claim and Fact-check (technical terms from elsewhere in the app)." />
        </Typography>
        <Grid container direction="row" justifyContent="center" alignItems="flex-end">
          <Grid item xs={6}>
            <IconButton
              className={classes.accept}
              onClick={handleAccept}
              disabled={disableAcceptRejectButtons}
            >
              <AcceptIcon fontSize="large" />
            </IconButton>
            <IconButton
              className={classes.reject}
              onClick={handleReject}
              disabled={disableAcceptRejectButtons}
            >
              <RejectIcon fontSize="large" />
            </IconButton>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              className={classes.button}
              onClick={() => window.open(suggestedMainItemLink, '_blank')}
            >
              <FormattedMessage id="mediaSuggestionReview.openButtonMatched" defaultMessage="Open claim" description="A label for a button that opens a claim item" />
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

MediaSuggestionReview.propTypes = {
  projectMedia: PropTypes.object.isRequired, // FIXME: Detail which fields are expected
};

export default withSetFlashMessage(MediaSuggestionReview);
