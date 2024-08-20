import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { browserHistory } from 'react-router';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import CreateRelatedMediaDialog from '../CreateRelatedMediaDialog';
import { withSetFlashMessage } from '../../FlashMessage';

const MediaSimilarityBarAdd = ({
  projectMediaId,
  projectMediaDbid,
  canMerge,
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
        id="mediaSimilarityBarAdd.mergedSuccessfully"
        defaultMessage="Items merged successfully."
        description="Banner displayed when items are merged successfully."
      />
    ), 'success');
    setShowDialog(false);
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    const mainItemDbid = response.createRelationship.relationshipEdge.node.source_id;
    const mediaUrl = `/${teamSlug}/media/${mainItemDbid}`;
    browserHistory.push(mediaUrl);
  };

  const handleSubmit = (selectedProjectMedia) => {
    setSubmitting(true);

    const relationship_type = 'confirmed_sibling';
    const source_id = projectMediaDbid;
    const target_id = selectedProjectMedia.dbid;

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
      <ButtonMain
        label={<FormattedMessage id="mediaSimilarityBarAdd.mergeItems" defaultMessage="Merge Items" description="Label for the Merge Items button." />}
        variant="contained"
        size="default"
        theme="brand"
        onClick={() => { setShowDialog(true); }}
        disabled={!canMerge}
        buttonProps={{
          id: 'media-similarity__add-button',
        }}
      />
      <CreateRelatedMediaDialog
        title={
          <FormattedMessage
            tagName="h6"
            id="mediaSimilarityBarAdd.mergeItemsTitle"
            defaultMessage="Find other media to merge with this item"
            description="Dialog title for merging items."
          />
        }
        open={showDialog}
        onDismiss={() => { setShowDialog(false); }}
        onSelect={handleSubmit}
        media={{ dbid: projectMediaDbid }}
        isSubmitting={submitting}
        submitButtonLabel={count => (
          <FormattedMessage
            id="mediaSimilarityBarAdd.mergeItemsButton"
            defaultMessage="{count, plural, one {Merge Selected Item} other {Merge # Selected Items}}"
            values={{ count }}
            description="Button label to commit action of merging items."
          />
        )}
        multiple
        hideNew
        showFilters
        disablePublished
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
