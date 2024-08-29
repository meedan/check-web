/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { browserHistory } from 'react-router';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import CreateRelatedMediaDialog from '../CreateRelatedMediaDialog';
import { withSetFlashMessage } from '../../FlashMessage';

const MediaSimilarityBarAdd = ({
  canMerge,
  projectMediaDbid,
  projectMediaId,
  setFlashMessage,
}) => {
  const [showDialog, setShowDialog] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Accepts a JS Error object
  const handleError = (error) => {
    setSubmitting(false);
    setFlashMessage(error.message, 'error');
  };

  const handleSuccess = (response) => {
    setSubmitting(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Items merged successfully."
        description="Banner displayed when items are merged successfully."
        id="mediaSimilarityBarAdd.mergedSuccessfully"
      />
    ), 'success');
    setShowDialog(false);
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    const mainItemDbid = response.createRelationship.relationshipEdge.node.source_id;
    const mediaUrl = `/${teamSlug}/media/${mainItemDbid}`;
    browserHistory.push(mediaUrl);
  };

  const handleSubmit = (selectedProjectMedia, reverse) => {
    setSubmitting(true);

    const relationship_type = 'confirmed_sibling';
    let source_id = projectMediaDbid;
    let target_id = selectedProjectMedia.dbid;
    if (reverse) {
      source_id = selectedProjectMedia.dbid;
      target_id = projectMediaDbid;
    }

    const mutation = graphql`
      mutation MediaSimilarityBarAddCreateRelationshipMutation($input: CreateRelationshipInput!) {
        createRelationship(input: $input) {
          relationshipEdge {
            node {
              id
              dbid
              source_id
              target_id
              target {
                id
                dbid
                title
                description
                picture
                type
                last_seen
                requests_count
                linked_items_count
                report_status
                url
                media {
                  url
                  domain
                  type
                }
              }
            }
          }
          source_project_media {
            dbid
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: linked_items_count
            team {
              slug
            }
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          source_id,
          target_id,
          relationship_source_type: relationship_type,
          relationship_target_type: relationship_type,
        },
      },
      configs: [{
        type: 'RANGE_ADD',
        parentName: 'source_project_media',
        parentID: projectMediaId,
        edgeName: 'relationshipEdge',
        connectionName: 'confirmed_similar_relationships',
        rangeBehaviors: () => ('prepend'),
        connectionInfo: [{
          key: 'ProjectMedia_confirmed_similar_relationships',
          rangeBehavior: 'prepend',
        }],
      }],
      onCompleted: (response, errors) => {
        if (errors?.length > 0) {
          for (let i = 0; i < errors.length; i += 1) {
            handleError(errors[i]);
          }
        } else {
          handleSuccess(response);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <React.Fragment>
      <Tooltip
        arrow
        disableFocusListener
        disableHoverListener={canMerge}
        disableTouchListener
        title={
          <FormattedMessage
            defaultMessage="TEMP Content"
            description="Tooltip message for when merging media is not allowed from this item"
            id="mediaSimilarityBarAdd.mergeItemsTooltip"
          />
        }
      >
        <span>
          <ButtonMain
            buttonProps={{
              id: 'media-similarity__add-button',
            }}
            disabled={!canMerge}
            label={<FormattedMessage defaultMessage="Merge Items" description="Label for the Merge Items button." id="mediaSimilarityBarAdd.mergeItems" />}
            size="default"
            theme="info"
            variant="contained"
            onClick={() => { setShowDialog(true); }}
          />
        </span>
      </Tooltip>
      <CreateRelatedMediaDialog
        disablePublished
        hideNew
        isSubmitting={submitting}
        media={{ dbid: projectMediaDbid }}
        open={showDialog}
        showFilters
        submitButtonLabel={count => (
          <FormattedMessage
            defaultMessage="{count, plural, one {Merge Selected Item} other {Merge # Selected Items}}"
            description="Button label to commit action of merging items."
            id="mediaSimilarityBarAdd.mergeItemsButton"
            values={{ count }}
          />
        )}
        title={
          <FormattedMessage
            defaultMessage="Search for Media to Merge"
            description="Dialog title for merging items."
            id="mediaSimilarityBarAdd.mergeItemsTitle"
            tagName="h6"
          />
        }
        onDismiss={() => { setShowDialog(false); }}
        onSelect={handleSubmit}
      />
    </React.Fragment>
  );
};

MediaSimilarityBarAdd.defaultProps = {
  canMerge: true,
};

MediaSimilarityBarAdd.propTypes = {
  projectMediaId: PropTypes.string.isRequired,
  projectMediaDbid: PropTypes.number.isRequired,
  canMerge: PropTypes.bool,
};

export default withSetFlashMessage(MediaSimilarityBarAdd);
