import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Tooltip from '@material-ui/core/Tooltip';
import { browserHistory } from 'react-router';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PublishIcon from '@material-ui/icons/Publish';
import GetAppIcon from '@material-ui/icons/GetApp';
import IconReport from '@material-ui/icons/PlaylistAddCheck';
import { makeStyles } from '@material-ui/core/styles';
import BlankMediaButton from '../BlankMediaButton';
import CreateRelatedMediaDialog from '../CreateRelatedMediaDialog';
import { withSetFlashMessage } from '../../FlashMessage';

const useStyles = makeStyles(() => ({
  button: {
    whiteSpace: 'nowrap',
  },
}));

const MediaSimilarityBarAdd = ({
  projectMediaId,
  projectMediaDbid,
  setFlashMessage,
  canBeAddedToSimilar,
  similarCanBeAddedToIt,
  canBeAddedToImported,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [action, setAction] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  let label = '';
  let reverse = false;
  if (action === 'addSimilarToThis') {
    label = <FormattedMessage id="mediaSimilarityBarAdd.addSimilarToThisTitle" defaultMessage="Import similar media from other items" />;
  } else if (action === 'addThisToSimilar') {
    label = <FormattedMessage id="mediaSimilarityBarAdd.addThisToSimilarTitle" defaultMessage="Export all media to another item" />;
    reverse = true;
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAction(null);
    setAnchorEl(null);
  };

  const handleAddSimilarToThis = () => {
    setAction('addSimilarToThis');
    setAnchorEl(null);
  };

  const handleAddThisToSimilar = () => {
    setAction('addThisToSimilar');
    setAnchorEl(null);
  };

  const handleError = () => {
    setSubmitting(false);
    setFlashMessage((
      <FormattedMessage
        id="mediaSimilarityBarAdd.defaultErrorMessage"
        defaultMessage="Could not add similar item"
        description="Warning displayed if an error occurred when adding a similar item"
      />
    ));
  };

  const handleSuccess = (response) => {
    setSubmitting(false);
    setFlashMessage((
      <FormattedMessage
        id="mediaSimilarityBarAdd.savedSuccessfully"
        defaultMessage="Similar item added successfully"
        description="Banner displayed when similar item is added successfully"
      />
    ));
    handleClose();
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    const mainItemDbid = response.createRelationship.relationshipEdge.node.source_id;
    const mediaUrl = `/${teamSlug}/media/${mainItemDbid}/similar-media`;
    browserHistory.push(mediaUrl);
  };

  const handleSubmit = (selectedProjectMedia) => {
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
              }
            }
          }
          source_project_media {
            dbid
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
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

  return (
    <React.Fragment>
      <Button
        onClick={handleClick}
        variant="outlined"
        color="primary"
        endIcon={<ExpandMoreIcon />}
        disabled={!canBeAddedToSimilar && !similarCanBeAddedToIt}
        className={classes.button}
      >
        <FormattedMessage
          id="mediaSimilarityBarAdd.addSimilar"
          defaultMessage="Add similar"
        />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        keepMounted
      >
        <MenuItem onClick={handleAddSimilarToThis} disabled={!similarCanBeAddedToIt}>
          <ListItemIcon>
            <GetAppIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <FormattedMessage
                id="mediaSimilarityBarAdd.addSimilarToThis"
                defaultMessage="Import similar media into this item"
              />
            }
          />
        </MenuItem>
        <Tooltip
          disableFocusListener
          disableTouchListener
          disableHoverListener={canBeAddedToSimilar}
          title={
            <FormattedMessage
              id="mediaSimilarityBarAdd.exportTooltip"
              defaultMessage="Media from this item cannot be exported if this item is attached to a main item or if its report is published"
            />
          }
        >
          <span>
            <MenuItem onClick={handleAddThisToSimilar} disabled={!canBeAddedToSimilar}>
              <ListItemIcon>
                <PublishIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <FormattedMessage
                    id="mediaSimilarityBarAdd.addThisToSimilar"
                    defaultMessage="Export all media to another item"
                  />
                }
              />
            </MenuItem>
          </span>
        </Tooltip>
        <Divider />
        <BlankMediaButton
          reverse
          projectMediaId={projectMediaId}
          ButtonComponent={({ onClick }) => (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onClick();
              }}
              disabled={!canBeAddedToImported}
            >
              <ListItemIcon>
                <IconReport />
              </ListItemIcon>
              <ListItemText
                primary={
                  <FormattedMessage
                    id="mediaSimilarityBarAdd.addToImportedReport"
                    defaultMessage="Add to imported report"
                  />
                }
              />
            </MenuItem>
          )}
        />
      </Menu>
      <CreateRelatedMediaDialog
        title={label}
        open={Boolean(action)}
        onDismiss={handleClose}
        onSelect={handleSubmit}
        media={{ dbid: projectMediaDbid }}
        isSubmitting={submitting}
        submitButtonLabel={count => (
          reverse ?
            <FormattedMessage id="mediaSimilarityBarAdd.addAsSimilar" defaultMessage="Export all media" /> :
            <FormattedMessage id="mediaSimilarityBarAdd.addSimilarItem" defaultMessage="{count, plural, one {Import all media from one item} other {Import all media from # items}}" values={{ count }} />
        )}
        multiple={!reverse}
        hideNew
        showFilters
      />
    </React.Fragment>
  );
};

MediaSimilarityBarAdd.defaultProps = {
  canBeAddedToSimilar: true,
  similarCanBeAddedToIt: true,
  canBeAddedToImported: false,
};

MediaSimilarityBarAdd.propTypes = {
  projectMediaId: PropTypes.string.isRequired,
  projectMediaDbid: PropTypes.number.isRequired,
  canBeAddedToSimilar: PropTypes.bool,
  similarCanBeAddedToIt: PropTypes.bool,
  canBeAddedToImported: PropTypes.bool,
};

export default withSetFlashMessage(MediaSimilarityBarAdd);
