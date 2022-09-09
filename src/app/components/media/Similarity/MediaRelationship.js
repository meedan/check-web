/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from '@material-ui/icons/MoreVert';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import { FormattedMessage } from 'react-intl';
import MediaItem from './MediaItem';
import SelectProjectDialog from '../SelectProjectDialog';
import globalStrings from '../../../globalStrings';
import { withSetFlashMessage } from '../../FlashMessage';

const useStyles = makeStyles(() => ({
  outer: {
    position: 'relative',
  },
  inner: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
}));

const RelationshipMenu = ({
  canDelete,
  canSwitch,
  setFlashMessage,
  id,
  sourceId,
  targetId,
  mainProjectMedia,
}) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(false), [setIsDialogOpen]);

  const swallowClick = (event, callback) => {
    event.stopPropagation();
    callback();
  };

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleError = () => {
    // FIXME: Replace with `<GenericUnknownErrorMessage />`;
    setFlashMessage(<FormattedMessage id="mediaItem.error" defaultMessage="Error, please try again" />, 'error');
  };

  const handleSwitch = () => {
    setFlashMessage(<FormattedMessage id="mediaItem.pinning" defaultMessage="Pinning…" />, 'info');

    const mutation = graphql`
      mutation MediaRelationshipUpdateRelationshipMutation($input: UpdateRelationshipInput!) {
        updateRelationship(input: $input) {
          relationship {
            id
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id,
          source_id: targetId,
          target_id: sourceId,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          setFlashMessage((
            <FormattedMessage
              id="mediaItem.doneRedirecting"
              defaultMessage="Done, redirecting to new main item…"
            />
          ), 'success');
          window.location.assign(`/${teamSlug}/media/${targetId}/similar-media`);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleDelete = (project) => {
    setIsDialogOpen(false);
    const mutation = graphql`
      mutation MediaRelationshipDestroyRelationshipMutation($input: DestroyRelationshipInput!) {
        destroyRelationship(input: $input) {
          deletedId
          source_project_media {
            id
            demand
            hasMain: is_confirmed_similar_to_another_item
            confirmedSimilarCount: confirmed_similar_items_count
            default_relationships_count
          }
          target_project_media {
            id
            demand
            hasMain: is_confirmed_similar_to_another_item
            confirmedSimilarCount: confirmed_similar_items_count
            default_relationships_count
          }
        }
      }
    `;

    const optimisticResponse = {
      destroyRelationship: {
        deletedId: id,
        source_project_media: {
          id: mainProjectMedia.id,
          demand: mainProjectMedia.demand - 1,
          confirmed_similar_items_count: mainProjectMedia.confirmedSimilarCount - 1,
        },
      },
    };

    commitMutation(Store, {
      mutation,
      optimisticResponse,
      variables: {
        input: {
          id,
          add_to_project_id: project.dbid,
        },
      },
      configs: [
        {
          type: 'NODE_DELETE',
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'RANGE_DELETE',
          parentID: mainProjectMedia.id,
          pathToConnection: ['source_project_media', 'confirmed_similar_relationships'],
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'RANGE_DELETE',
          parentID: mainProjectMedia.id,
          pathToConnection: ['source_project_media', 'default_relationships'],
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'RANGE_DELETE',
          parentID: mainProjectMedia.id,
          pathToConnection: ['target_project_media', 'default_relationships'],
          deletedIDFieldName: 'deletedId',
        },
      ],
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          const { title: projectTitle, dbid: projectId } = project;
          const message = (
            <FormattedMessage
              id="mediaItem.detachedSuccessfully"
              defaultMessage="Item detached to '{toProject}'"
              description="Banner displayed after items are detached successfully"
              values={{
                toProject: (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
                  <a onClick={() => browserHistory.push(`/${teamSlug}/project/${projectId}`)}>
                    {projectTitle}
                  </a>
                ),
              }}
            />
          );
          setFlashMessage(message, 'success');
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <>
      { canDelete && canSwitch ? (
        <Box>
          <IconButton
            onClick={handleOpenMenu}
            className="media-similarity__menu-icon"
          >
            <IconMoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={event => swallowClick(event, handleSwitch)}>
              <ListItemText
                className="similarity-media-item__pin-relationship"
                primary={
                  <FormattedMessage id="mediaItem.pinAsMain" defaultMessage="Pin as main" />
                }
              />
            </MenuItem>
            <MenuItem onClick={event => swallowClick(event, openDialog)}>
              <ListItemText
                className="similarity-media-item__delete-relationship"
                primary={
                  <FormattedMessage id="mediaItem.detach" defaultMessage="Detach" />
                }
              />
            </MenuItem>
          </Menu>
        </Box>) : null
      }
      { canDelete && !canSwitch ?
        <Box>
          <IconButton onClick={event => swallowClick(event, openDialog)}>
            <RemoveCircleOutlineIcon className="related-media-item__delete-relationship" />
          </IconButton>
        </Box> : null }
      <SelectProjectDialog
        open={isDialogOpen}
        excludeProjectDbids={[]}
        title={
          <FormattedMessage
            id="detachDialog.dialogdetachedToListTitle"
            defaultMessage="Move detached item to…"
            description="Dialog title prompting user to select a destination folder for the item"
          />
        }
        cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
        submitLabel={
          <FormattedMessage
            id="detachDialog.detached"
            defaultMessage="Move to folder"
            description="Button to commit the action of moving item"
          />
        }
        submitButtonClassName="media-item__add-button"
        onCancel={closeDialog}
        onSubmit={handleDelete}
      />
    </>
  );
};

const MediaRelationship = ({
  relationship,
  relationshipSourceId,
  relationshipTargetId,
  canSwitch,
  canDelete,
  handleSelectItem,
  isSelected,
  mainProjectMediaId,
  mainProjectMediaDemand,
  mainProjectMediaConfirmedSimilarCount,
  setFlashMessage,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.outer} id="media__relationship">
      <MediaItem
        key={relationship.id}
        mainProjectMedia={{
          id: mainProjectMediaId,
          confirmedSimilarCount: mainProjectMediaConfirmedSimilarCount,
          demand: mainProjectMediaDemand,
        }}
        projectMedia={relationship.target}
        isSelected={isSelected}
        showReportStatus={false}
        onSelect={handleSelectItem}
        modalOnly
      />
      <div className={classes.inner} id="media__relationship__menu">
        <RelationshipMenu
          canDelete={canDelete}
          canSwitch={canSwitch}
          id={relationship.id}
          sourceId={relationshipSourceId}
          targetId={relationshipTargetId}
          setFlashMessage={setFlashMessage}
          mainProjectMedia={{
            id: mainProjectMediaId,
            confirmedSimilarCount: mainProjectMediaConfirmedSimilarCount,
            demand: mainProjectMediaDemand,
          }}
        />
      </div>
    </div>
  );
};

MediaRelationship.propTypes = {
  relationship: PropTypes.object.isRequired,
  relationshipSourceId: PropTypes.number.isRequired,
  relationshipTargetId: PropTypes.number.isRequired,
  canSwitch: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  mainProjectMediaId: PropTypes.string.isRequired,
  mainProjectMediaDemand: PropTypes.number.isRequired,
  mainProjectMediaConfirmedSimilarCount: PropTypes.number.isRequired,
};

export default withSetFlashMessage(MediaRelationship);
