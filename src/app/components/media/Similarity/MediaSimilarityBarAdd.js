import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Tooltip from '@material-ui/core/Tooltip';
import { browserHistory } from 'react-router';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import BlankMediaButton from '../BlankMediaButton';
import CreateRelatedMediaDialog from '../CreateRelatedMediaDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import ExpandMoreIcon from '../../../icons/expand_more.svg';
import IconFileDownload from '../../../icons/file_download.svg';
import IconFileUpload from '../../../icons/file_upload.svg';
import IconReport from '../../../icons/playlist_add_check.svg';

const MediaSimilarityBarAdd = ({
  projectMediaId,
  projectMediaDbid,
  setFlashMessage,
  canBeAddedToSimilar,
  similarCanBeAddedToIt,
  canBeAddedToImported,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [action, setAction] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  let label = '';
  let reverse = false;
  if (action === 'addSimilarToThis') {
    label = (
      <FormattedMessage
        id="mediaSimilarityBarAdd.addSimilarToThisTitle"
        defaultMessage="Import media from other items"
        description="Dialog title for importing media from other items."
      />
    );
  } else if (action === 'addThisToSimilar') {
    label = (
      <FormattedMessage
        id="mediaSimilarityBarAdd.addThisToSimilarTitle"
        defaultMessage="Export all media to another item"
        description="Dialog title for exporting media to other item."
      />
    );
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

  // Accepts a JS Error object
  const handleError = (error) => {
    setSubmitting(false);
    setFlashMessage(error.message, 'error');
  };

  const handleSuccess = (response) => {
    setSubmitting(false);
    setFlashMessage((
      <FormattedMessage
        id="mediaSimilarityBarAdd.savedSuccessfully"
        defaultMessage="Similar item added successfully"
        description="Banner displayed when similar item is added successfully"
      />
    ), 'success');
    handleClose();
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    const mainItemDbid = response.createRelationship.relationshipEdge.node.source_id;
    const mediaUrl = `/${teamSlug}/media/${mainItemDbid}`;
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
        iconRight={<ExpandMoreIcon />}
        label={<FormattedMessage id="mediaSimilarityBarAdd.addSimilar"defaultMessage="Manage media"description="Label to the similarity menu that allows importing and exporting media" />}
        variant="outlined"
        size="default"
        theme="brand"
        onClick={handleClick}
        disabled={!canBeAddedToSimilar && !similarCanBeAddedToIt}
        buttonProps={{
          id: 'media-similarity__add-button',
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        keepMounted
      >
        <MenuItem onClick={handleAddSimilarToThis} disabled={!similarCanBeAddedToIt}>
          <ListItemIcon>
            <IconFileDownload />
          </ListItemIcon>
          <ListItemText
            id="import-fact-check__button"
            primary={
              <FormattedMessage
                id="mediaSimilarityBarAdd.addSimilarToThis"
                defaultMessage="Import media into this fact-check"
                description="Menu item for importing (one or more) media matched as similar"
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
              description="Tooltip message for exporting media menu option"
            />
          }
        >
          <span>
            <MenuItem onClick={handleAddThisToSimilar} disabled={!canBeAddedToSimilar}>
              <ListItemIcon>
                <IconFileUpload />
              </ListItemIcon>
              <ListItemText
                id="export-fact-check__button"
                primary={
                  <FormattedMessage
                    id="mediaSimilarityBarAdd.addThisToSimilar"
                    defaultMessage="Export media to another fact-check"
                    description="Menu option for exporting media from this item to another"
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
                    defaultMessage="Add media to an imported fact-check"
                    description="Menu option for adding the current media to an imported fact-check"
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
          reverse ? (
            <FormattedMessage
              id="mediaSimilarityBarAdd.addAsSimilar"
              defaultMessage="Export all media"
              description="Button label to commit action of exporting media"
            />
          ) : (
            <FormattedMessage
              id="mediaSimilarityBarAdd.addSimilarItem"
              defaultMessage="{count, plural, one {Import all media from one item} other {Import all media from # items}}"
              values={{ count }}
              description="Button label to commit action of importing media from one or more items into the current one"
            />
          )
        )}
        multiple={!reverse}
        hideNew
        showFilters
        disablePublished
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
