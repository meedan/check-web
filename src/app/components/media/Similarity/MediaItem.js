import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { Link } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from '@material-ui/icons/MoreVert';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import DetachDialog from './DetachDialog';
import TimeBefore from '../../TimeBefore';
import MediaTypeDisplayName from '../MediaTypeDisplayName';
import { parseStringUnixTimestamp, truncateLength } from '../../../helpers';
import { withSetFlashMessage } from '../../FlashMessage';
import { brandSecondary } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    border: `1px solid ${brandSecondary}`,
    borderRadius: 8,
    color: 'black',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  notSelected: {
    background: 'white',
  },
  selected: {
    background: brandSecondary,
  },
  title: {
    fontSize: 14,
    lineHeight: '1.5em',
    color: 'black',
    '&:visited': {
      color: 'black',
    },
  },
  image: {
    height: 100,
    width: 100,
    objectFit: 'cover',
  },
  sep: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  sub: {
    fontSize: 14,
  },
  content: {
    height: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

const MediaItem = ({
  projectMedia,
  mainProjectMedia,
  relationship,
  canDelete,
  canSwitch,
  setFlashMessage,
  isSelected,
  onSelect,
}) => {
  if (!projectMedia || !projectMedia.dbid) {
    return null;
  }

  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const mediaUrl = `/${teamSlug}/media/${projectMedia.dbid}`;
  const defaultImage = '/images/image_placeholder.svg';
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(false), [setIsDialogOpen]);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleError = () => {
    setFlashMessage(<FormattedMessage id="mediaItem.error" defaultMessage="Error, please try again" />);
  };

  const handleDelete = (project) => {
    setIsDialogOpen(false);
    const mutation = graphql`
      mutation MediaItemDestroyRelationshipMutation($input: DestroyRelationshipInput!) {
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
        deletedId: relationship.id,
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
          id: relationship.id,
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
                  <Link to={`/${teamSlug}/project/${projectId}`}>
                    {projectTitle}
                  </Link>
                ),
              }}
            />
          );
          setFlashMessage(message);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleSwitch = () => {
    setFlashMessage(<FormattedMessage id="mediaItem.pinning" defaultMessage="Pinning…" />);

    const mutation = graphql`
      mutation MediaItemUpdateRelationshipMutation($input: UpdateRelationshipInput!) {
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
          id: relationship.id,
          source_id: relationship.target_id,
          target_id: relationship.source_id,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          setFlashMessage(<FormattedMessage id="mediaItem.doneRedirecting" defaultMessage="Done, redirecting to new main item…" />);
          window.location.assign(`/${teamSlug}/media/${relationship.target_id}/similar-media`);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <Box
      className={
        isSelected ?
          [classes.root, classes.selected].join(' ') :
          [classes.root, classes.notSelected].join(' ')
      }
      display="flex"
      width={1}
      onClick={(event) => {
        onSelect(projectMedia.dbid);
        event.stopPropagation();
      }}
    >
      <CardHeader
        classes={{ content: classes.content, title: classes.title }}
        title={
          <Link to={mediaUrl} className={classes.title}>
            {truncateLength(projectMedia.title, 140)}
          </Link>
        }
        subheader={
          <Box display="flex" className={classes.sub}>
            <MediaTypeDisplayName mediaType={projectMedia.type} />
            <div className={classes.sep}> - </div>
            <TimeBefore date={parseStringUnixTimestamp(projectMedia.created_at)} />
            <div className={classes.sep}> - </div>
            <FormattedMessage
              id="mediaItem.requests"
              defaultMessage="{count, plural, one {1 request} other {# requests}}"
              values={{
                count: projectMedia.requests_count,
              }}
            />
          </Box>
        }
        avatar={
          projectMedia.picture ?
            <img
              alt=""
              className={classes.image}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              src={projectMedia.picture}
            /> : null
        }
      />
      { canDelete && canSwitch ?
        <Box>
          <IconButton onClick={handleOpenMenu}>
            <IconMoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleSwitch}>
              <ListItemText
                primary={
                  <FormattedMessage id="mediaItem.pinAsMain" defaultMessage="Pin as main" />
                }
              />
            </MenuItem>
            <MenuItem onClick={openDialog}>
              <ListItemText
                primary={
                  <FormattedMessage id="mediaItem.detach" defaultMessage="Detach" />
                }
              />
            </MenuItem>
          </Menu>
        </Box> : null }
      { canDelete && !canSwitch ?
        <Box>
          <IconButton onClick={openDialog}>
            <RemoveCircleOutlineIcon />
          </IconButton>
        </Box> : null }
      { isDialogOpen ?
        <DetachDialog
          closeDialog={closeDialog}
          handleDelete={handleDelete}
        /> : null
      }
    </Box>
  );
};

MediaItem.defaultProps = {
  mainProjectMedia: { id: '' },
  relationship: null,
  canSwitch: false,
  canDelete: false,
  isSelected: false,
  onSelect: () => {},
};

MediaItem.propTypes = {
  mainProjectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    confirmedSimilarCount: PropTypes.number,
    demand: PropTypes.number,
  }),
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    requests_count: PropTypes.number.isRequired,
  }).isRequired,
  relationship: PropTypes.shape({
    id: PropTypes.string.isRequired,
    source_id: PropTypes.number, // Mandatory if canSwitch is true
    target_id: PropTypes.number, // Mandatory if canSwitch is true
  }),
  canSwitch: PropTypes.bool,
  canDelete: PropTypes.bool,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default createFragmentContainer(withSetFlashMessage(MediaItem), graphql`
  fragment MediaItem_projectMedia on ProjectMedia {
    id
    dbid
    title
    picture
    created_at
    type
    requests_count
  }
`);
