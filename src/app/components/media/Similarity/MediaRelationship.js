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
import { withSetFlashMessage } from '../../FlashMessage';
import MediaAndRequestsDialogComponent from '../../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import globalStrings from '../../../globalStrings';
import { getErrorMessage } from '../../../helpers';

const useStyles = makeStyles(() => ({
  outer: {
    position: 'relative',
    cursor: 'pointer',
  },
  inner: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
}));

const commitPinMutation = (id, targetId, sourceId, onCompleted, onError) => {
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
    onCompleted,
    onError,
  });
};

const RelationshipMenu = ({
  canDelete,
  canSwitch,
  setFlashMessage,
  isDialogOpen,
  setIsDialogOpen,
  id,
  sourceId,
  targetId,
  mainProjectMedia,
}) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const [anchorEl, setAnchorEl] = React.useState(null);
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

  const openMedia = () => {
    const url = window.location.pathname.replace(/\/media\/\d+/, `/media/${targetId}`);
    browserHistory.push(url);
  };

  const handleError = (error) => {
    const message = getErrorMessage(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
  };

  const handleSwitch = () => {
    setFlashMessage(
      <FormattedMessage
        id="mediaItem.pinning"
        defaultMessage="Pinning…"
        description="Message displayed while action of pinning an item is being processed by the server. Same as defining an item as the main item"
      />,
      'info',
    );

    commitPinMutation(id, targetId, sourceId, (response, error) => {
      if (error) {
        handleError();
      } else {
        setFlashMessage((
          <FormattedMessage
            id="mediaItem.doneRedirecting"
            defaultMessage="Done, redirecting to new main item…"
            description="A message that informs the user a 'pin' action is finished and a redirect is about to happen"
          />
        ), 'success');
        browserHistory.push(`/${teamSlug}/media/${targetId}`);
      }
    },
    () => {
      handleError();
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
          handleError(error);
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
      onError: handleError,
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
                  <FormattedMessage
                    id="mediaItem.pinAsMain"
                    defaultMessage="Pin as main"
                    description="Menu option for pinning an item as the main item"
                  />
                }
              />
            </MenuItem>
            <MenuItem onClick={event => swallowClick(event, openDialog)}>
              <ListItemText
                className="similarity-media-item__delete-relationship"
                primary={
                  <FormattedMessage id="mediaItem.detach" defaultMessage="Un-match media" description="Label for a button that lets the user set the media item they are clicking to be _not_ matched to its parent media item." />
                }
              />
            </MenuItem>
            <MenuItem onClick={event => swallowClick(event, openMedia)}>
              <ListItemText
                className="similarity-media-item__open-relationship"
                primary={
                  <FormattedMessage
                    id="mediaRelationship.openMedia"
                    defaultMessage="Open media"
                    description="Singular 'media'. Label for a button that opens the media item the user is currently viewing."
                  />
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
        /* eslint-disable-next-line @calm/react-intl/missing-attribute */
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
  mainProjectMediaId,
  mainProjectMediaDemand,
  mainProjectMediaConfirmedSimilarCount,
  setFlashMessage,
}) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const classes = useStyles();
  const [isSelected, setIsSelected] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const swallowClick = (ev) => {
    // Don't close Dialog when clicking on it
    ev.stopPropagation();
  };

  const handleError = () => {
    // FIXME: Replace with `<GenericUnknownErrorMessage />`;
    setFlashMessage(<FormattedMessage id="mediaItem.error" defaultMessage="Error, please try again" description="A generic error message" />, 'error');
  };

  const onPin = () => {
    commitPinMutation(relationship.id, relationshipTargetId, relationshipSourceId, (response, error) => {
      if (error) {
        handleError();
      } else {
        setFlashMessage((
          <FormattedMessage
            id="mediaItem.doneRedirecting"
            defaultMessage="Done, redirecting to new main item…"
            description="A message that informs the user a 'pin' action is finished and a redirect is about to happen"
          />
        ), 'success');
        browserHistory.push(`/${teamSlug}/media/${relationshipTargetId}`);
      }
    },
    () => {
      handleError();
    });
  };

  return (
    <div className={`${classes.outer} media__relationship`} >
      { isSelected ?
        <MediaAndRequestsDialogComponent
          projectMediaId={relationship.target_id}
          onClick={swallowClick}
          onClose={() => setIsSelected(false)}
          onPin={onPin}
          onUnmatch={() => {
            setIsDialogOpen(true);
          }}
          maxWidth="sm"
          fullWidth
        />
        : null }
      <MediaItem
        key={relationship.id}
        mainProjectMedia={{
          id: mainProjectMediaId,
          confirmedSimilarCount: mainProjectMediaConfirmedSimilarCount,
          demand: mainProjectMediaDemand,
        }}
        projectMedia={relationship.target}
        isSelected={isSelected}
        setIsSelected={setIsSelected}
        showReportStatus={false}
        modalOnly
      />
      <div className={`${classes.inner} media__relationship__menu`}>
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
          setIsDialogOpen={setIsDialogOpen}
          isDialogOpen={isDialogOpen}
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
  mainProjectMediaId: PropTypes.string.isRequired,
  mainProjectMediaDemand: PropTypes.number.isRequired,
  mainProjectMediaConfirmedSimilarCount: PropTypes.number.isRequired,
};

export default withSetFlashMessage(MediaRelationship);
