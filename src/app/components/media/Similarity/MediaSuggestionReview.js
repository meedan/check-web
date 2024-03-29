import React from 'react';
import PropTypes from 'prop-types';
import { Store } from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import AcceptIcon from '../../../icons/check_circle.svg';
import RejectIcon from '../../../icons/cancel.svg';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { withSetFlashMessage } from '../../FlashMessage';
import { can } from '../../Can';
import styles from './MediaSuggestionReview.module.css';

const MediaSuggestionReview = ({ projectMedia, setFlashMessage }) => {
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
      <div className={styles.MediaSuggestionReview}>
        <div className={styles.MediaSuggestionReviewTitle}>
          <FormattedMessage id="mediaSuggestionReview.matchTitle" defaultMessage="Matched claim" description="Title of a box that lets the user open a claim that this has been matched with." />
        </div>
        <FormattedMessage
          tagName="p"
          id="mediaSuggestionReview.matchDescription"
          defaultMessage="This media has been matched to the claim and fact-check below."
          description="Hint text to tell the user what the 'Open claim' button does."
        />
        <div className={styles.MediaSuggestionReviewActions}>
          <ButtonMain
            variant="outlined"
            theme="text"
            size="default"
            onClick={() => browserHistory.push(confirmedMainItemLink)}
            label={<FormattedMessage id="mediaSuggestionReview.openButtonMatched" defaultMessage="Open claim" description="A label for a button that opens a claim item" />}
          />
        </div>
      </div>
    );
  }

  if (!getSuggestedParentRelationshipId()) return null;

  return (
    <div className={styles.MediaSuggestionReview}>
      <div className={styles.MediaSuggestionReviewTitle}>
        <FormattedMessage id="mediaSuggestionReview.title" defaultMessage="Suggested Claim and Fact-check" description="Title of a box that prompts the user to review a suggestion for a related Claim and Fact-check (technical terms from elsewhere in the app)." />
      </div>
      <FormattedMessage
        tagName="p"
        id="mediaSuggestionReview.prompt"
        defaultMessage="Is the Claim or Fact-check below a good match for this media?"
        description="Text that prompts the user to review a suggestion for a related Claim and Fact-check (technical terms from elsewhere in the app)."
      />
      <div className={styles.MediaSuggestionReviewActions}>
        <div className={styles.MediaSuggestionReviewActionsConfirm}>
          <ButtonMain
            iconCenter={<AcceptIcon />}
            onClick={handleAccept}
            variant="text"
            size="large"
            theme="validation"
            disabled={disableAcceptRejectButtons}
          />
          <ButtonMain
            iconCenter={<RejectIcon />}
            onClick={handleReject}
            variant="text"
            size="large"
            theme="error"
            disabled={disableAcceptRejectButtons}
          />
        </div>
        <ButtonMain
          variant="outlined"
          theme="text"
          size="default"
          onClick={() => window.open(suggestedMainItemLink, '_blank')}
          label={<FormattedMessage id="mediaSuggestionReview.openButtonMatched" defaultMessage="Open claim" description="A label for a button that opens a claim item" />}
        />
      </div>
    </div>
  );
};

MediaSuggestionReview.propTypes = {
  projectMedia: PropTypes.object.isRequired, // FIXME: Detail which fields are expected
};

export default withSetFlashMessage(MediaSuggestionReview);
