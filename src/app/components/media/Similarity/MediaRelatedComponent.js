import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MediaItem from './MediaItem';
import CreateRelatedMediaDialog from '../CreateRelatedMediaDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import { can } from '../../Can';

const useStyles = makeStyles(theme => ({
  spaced: {
    margin: theme.spacing(2),
  },
}));

const MediaRelatedComponent = ({ projectMedia, setFlashMessage }) => {
  const classes = useStyles();

  const [showDialog, setShowDialog] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const relatedItemsDbids = [];
  projectMedia.default_relationships.edges.forEach((relationship) => {
    if (relationship.node.target_id === projectMedia.dbid) {
      relatedItemsDbids.push(relationship.node.source_id);
    } else {
      relatedItemsDbids.push(relationship.node.target_id);
    }
  });

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  const handleError = () => {
    setSubmitting(false);
    // FIXME: Show error from backend
    setFlashMessage((
      <FormattedMessage
        id="mediaRelatedComponent.defaultErrorMessage"
        defaultMessage="Could not add related item"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSubmitting(false);
    setFlashMessage((
      <FormattedMessage
        id="mediaRelatedComponent.savedSuccessfully"
        defaultMessage="Related item added successfully"
      />
    ), 'success');
    handleClose();
  };

  const handleSubmit = (selectedProjectMedia) => {
    setSubmitting(true);

    const source_id = projectMedia.dbid;
    const target_id = selectedProjectMedia.dbid;
    const relationship_source_type = 'parent';
    const relationship_target_type = 'child';

    const mutation = graphql`
      mutation MediaRelatedComponentCreateRelationshipMutation($input: CreateRelationshipInput!) {
        createRelationship(input: $input) {
          relationshipEdge {
            node {
              id
              dbid
              source_id
              target_id
              source {
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
              }
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
              }
            }
          }
          source_project_media {
            default_relationships_count
          }
          target_project_media {
            default_relationships_count
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
          relationship_source_type,
          relationship_target_type,
        },
      },
      configs: [
        {
          type: 'RANGE_ADD',
          parentName: 'source_project_media',
          parentID: projectMedia.id,
          edgeName: 'relationshipEdge',
          connectionName: 'default_relationships',
          rangeBehaviors: () => ('prepend'),
          connectionInfo: [{
            key: 'ProjectMedia_default_relationships',
            rangeBehavior: 'prepend',
          }],
        },
        {
          type: 'RANGE_ADD',
          parentName: 'target_project_media',
          parentID: selectedProjectMedia.id,
          edgeName: 'relationshipEdge',
          connectionName: 'default_relationships',
          rangeBehaviors: () => ('prepend'),
          connectionInfo: [{
            key: 'ProjectMedia_default_relationships',
            rangeBehavior: 'prepend',
          }],
        },
      ],
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const filterResults = items => items.filter(i => relatedItemsDbids.indexOf(i.dbid) === -1);

  return (
    <React.Fragment>
      <Box display="flex" justifyContent="space-between" alignItems="center" className={classes.spaced}>
        <Typography variant="subtitle2">
          <FormattedMessage
            id="mediaRelatedComponent.count"
            defaultMessage="{count, plural, one {# related item} other {# related items}}"
            values={{
              count: projectMedia.default_relationships_count,
            }}
          />
        </Typography>
        <Button
          onClick={handleClick}
          variant="outlined"
          color="primary"
          disabled={!can(projectMedia.permissions, 'update ProjectMedia')}
        >
          <FormattedMessage
            id="mediaRelatedComponent.addSimilar"
            defaultMessage="Add relation"
          />
        </Button>
      </Box>
      { projectMedia.default_relationships.edges.map(relationship => (
        <Box className={classes.spaced} key={relationship.node.id}>
          <MediaItem
            projectMedia={
              relationship.node.source_id === projectMedia.dbid ?
                relationship.node.target :
                relationship.node.source
            }
            relationship={relationship.node}
            canDelete={can(projectMedia.permissions, 'destroy ProjectMedia')}
          />
        </Box>
      ))}
      { showDialog ?
        <CreateRelatedMediaDialog
          open
          title={<FormattedMessage id="mediaRelatedComponent.dialogTitle" defaultMessage="Add relation" />}
          onDismiss={handleClose}
          onSelect={handleSubmit}
          media={{ dbid: projectMedia.dbid }}
          isSubmitting={submitting}
          submitButtonLabel={count => <FormattedMessage id="mediaRelatedComponent.submitButton" defaultMessage="{count, plural, one {Add relation for one item} other {Add relation for # items}}" values={{ count }} />}
          customFilter={filterResults}
          showFilters
          hideNew
          multiple
        /> : null }
    </React.Fragment>
  );
};

MediaRelatedComponent.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired,
    default_relationships_count: PropTypes.number.isRequired,
    default_relationships: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          id: PropTypes.string.isRequired,
          source_id: PropTypes.number.isRequired,
          target_id: PropTypes.number.isRequired,
          source: PropTypes.object.isRequired,
          target: PropTypes.object.isRequired,
        }).isRequired,
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(MediaRelatedComponent), graphql`
  fragment MediaRelatedComponent_projectMedia on ProjectMedia {
    id
    dbid
    permissions
    default_relationships_count
    default_relationships(first: 10000) {
      edges {
        node {
          id
          source_id
          target_id
          source {
            ...MediaItem_projectMedia
          }
          target {
            ...MediaItem_projectMedia
          }
        }
      }
    }
  }
`);
