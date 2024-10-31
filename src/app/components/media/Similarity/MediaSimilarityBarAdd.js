import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import CreateRelatedMediaDialog from '../CreateRelatedMediaDialog';
import { withSetFlashMessage } from '../../FlashMessage';

const MediaSimilarityBarAdd = ({
  canExport,
  canImport,
  projectMediaDbid,
  projectMediaId,
  setFlashMessage,
}) => {
  const [showDialog, setShowDialog] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const canMerge = canExport || canImport;

  // Accepts a JS Error object
  const handleError = (error) => {
    setSubmitting(false);
    setFlashMessage(error.message, 'error');
  };

  const handleSuccess = (mainItemDbid) => {
    setSubmitting(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Media Clusters merged successfully."
        description="Banner displayed when clusters of media are merged successfully."
        id="mediaSimilarityBarAdd.mergedSuccessfully"
      />
    ), 'success');
    setShowDialog(false);
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    const mediaUrl = `/${teamSlug}/media/${mainItemDbid}`;
    window.location.assign(mediaUrl);
  };

  const handleAdd = (projectMedia) => {
    setSubmitting(true);
    commitMutation(Store, {
      mutation: graphql`
        mutation MediaSimilarityBarAddReplaceProjectMediaMutation($input: ReplaceProjectMediaInput!) {
          replaceProjectMedia(input: $input) {
            new_project_media {
              dbid
            }
          }
        }
      `,
      variables: {
        input: {
          project_media_to_be_replaced_id: projectMedia.id,
          new_project_media_id: projectMediaId,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError(error);
        } else {
          handleSuccess(response.replaceProjectMedia.new_project_media.dbid);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });
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
          handleSuccess(response.createRelationship.relationshipEdge.node.source_id);
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
            defaultMessage="This media cluster has already been merged."
            description="Tooltip message for when merging media clusters is not allowed from this cluster of media"
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
            label={<FormattedMessage defaultMessage="Merge Media Clusters" description="Label for the Merge Media Clusters button." id="mediaSimilarityBarAdd.mergeItems" />}
            size="default"
            theme="info"
            variant="contained"
            onClick={() => { setShowDialog(true); }}
          />
        </span>
      </Tooltip>
      <CreateRelatedMediaDialog
        canExport={canExport}
        canImport={canImport}
        disablePublished
        hideNew
        isSubmitting={submitting}
        media={{ dbid: projectMediaDbid }}
        open={showDialog}
        showFilters
        submitButtonLabel={() => (
          <FormattedMessage
            defaultMessage="Merge Selected Media Clusters"
            description="Button label to commit action of merging items."
            id="mediaSimilarityBarAdd.mergeItemsButton"
          />
        )}
        title={
          <FormattedMessage
            defaultMessage="Search for Media Clusters to Merge"
            description="Dialog title for merging items."
            id="mediaSimilarityBarAdd.mergeItemsTitle"
            tagName="h6"
          />
        }
        onAdd={handleAdd}
        onDismiss={() => { setShowDialog(false); }}
        onSelect={handleSubmit}
      />
    </React.Fragment>
  );
};

MediaSimilarityBarAdd.defaultProps = {
  canExport: true,
  canImport: true,
};

MediaSimilarityBarAdd.propTypes = {
  canExport: PropTypes.bool,
  canImport: PropTypes.bool,
  projectMediaDbid: PropTypes.number.isRequired,
  projectMediaId: PropTypes.string.isRequired,
};

export default withSetFlashMessage(MediaSimilarityBarAdd);
