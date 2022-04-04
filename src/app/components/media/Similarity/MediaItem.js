import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from '@material-ui/icons/MoreVert';
import LayersIcon from '@material-ui/icons/Layers';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import SelectProjectDialog from '../SelectProjectDialog';
import TimeBefore from '../../TimeBefore';
import MediaTypeDisplayName from '../MediaTypeDisplayName';
import globalStrings from '../../../globalStrings';
import { parseStringUnixTimestamp, truncateLength } from '../../../helpers';
import { withSetFlashMessage } from '../../FlashMessage';
import { brandSecondary, checkBlue, inProgressYellow, black32 } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    border: `1px solid ${brandSecondary}`,
    borderRadius: 8,
    color: 'black',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  mediaItemCardHeader: {
    padding: theme.spacing(1),
    width: 'calc(100% - 50px)', // Make space for the menu
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'none',
    '&:hover': {
      color: 'black',
    },
    '&:visited': {
      color: 'black',
    },
  },
  image: {
    height: 80,
    width: 80,
    objectFit: 'cover',
    border: `1px solid ${brandSecondary}`,
  },
  sep: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  sub: {
    fontSize: 12,
    flexWrap: 'wrap',
  },
  mediaItemMetadataField: {
    whiteSpace: 'nowrap',
  },
  content: {
    minHeight: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  description: {
    color: 'black',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  reportPublished: {
    color: checkBlue,
  },
  reportPaused: {
    color: inProgressYellow,
  },
  reportUnpublished: {
    color: black32,
  },
  by: {
    color: checkBlue,
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
  showReportStatus,
  onSelect,
  modalOnly,
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

  const handleSwitch = () => {
    setFlashMessage(<FormattedMessage id="mediaItem.pinning" defaultMessage="Pinning…" />, 'info');

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
          setFlashMessage((
            <FormattedMessage
              id="mediaItem.doneRedirecting"
              defaultMessage="Done, redirecting to new main item…"
            />
          ), 'success');
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
        if (onSelect) {
          onSelect(projectMedia.dbid);
        }
        event.stopPropagation();
      }}
      style={onSelect ? { cursor: 'pointer' } : {}}
    >
      <CardHeader
        classes={{ content: classes.content, title: classes.title, root: classes.mediaItemCardHeader }}
        title={
          <Box display="flex" alignItems="center">
            { projectMedia.linked_items_count > 0 && !mainProjectMedia.id ? <LayersIcon /> : null }
            { modalOnly ? <strong>{truncateLength(projectMedia.title, 140)}</strong>
              : (
                <a href={mediaUrl} className={classes.title} target="_blank" rel="noopener noreferrer">
                  <strong>{truncateLength(projectMedia.title, 140)}</strong>
                </a>
              )
            }
          </Box>
        }
        subheader={
          <Box>
            <Box display="flex" className={classes.sub}>
              <div className={classes.mediaItemMetadataField}>
                { projectMedia.linked_items_count && !mainProjectMedia.id ?
                  <FormattedMessage
                    id="mediaItem.similarMedia"
                    defaultMessage="{count, plural, one {# similar media} other {# similar media}}"
                    values={{
                      count: projectMedia.linked_items_count,
                    }}
                  /> :
                  <MediaTypeDisplayName mediaType={projectMedia.type} />
                }
              </div>
              <div className={classes.sep}> - </div>
              { projectMedia.type !== 'Blank' ?
                <React.Fragment>
                  <div className={classes.mediaItemMetadataField}>
                    <FormattedMessage
                      id="mediaItem.lastSubmitted"
                      defaultMessage="Last submitted {timeAgo}"
                      description="Here timeAgo is a relative time, for example, '10 minutes ago' or 'yesterday'"
                      values={{
                        timeAgo: (
                          <TimeBefore
                            date={parseStringUnixTimestamp(projectMedia.last_seen)}
                          />
                        ),
                      }}
                    />
                  </div>
                  <div className={classes.sep}> - </div>
                  <div className={classes.mediaItemMetadataField}>
                    <FormattedMessage
                      id="mediaItem.requests"
                      defaultMessage="{count, plural, one {# request} other {# requests}}"
                      values={{
                        count: projectMedia.requests_count,
                      }}
                    />
                  </div>
                </React.Fragment> : null }
              { showReportStatus ?
                <React.Fragment>
                  <div className={classes.sep}> - </div>
                  <div className={classes.mediaItemMetadataField}>
                    { projectMedia.report_status === 'published' ?
                      <div className={classes.reportPublished}>
                        <FormattedMessage id="mediaItem.reportPublished" defaultMessage="Published" />
                      </div> : null }
                    { projectMedia.report_status === 'unpublished' ?
                      <div className={classes.reportUnpublished}>
                        <FormattedMessage id="mediaItem.reportUnpublished" defaultMessage="Unpublished" />
                      </div> : null }
                    { projectMedia.report_status === 'paused' ?
                      <div className={classes.reportPaused}>
                        <FormattedMessage id="mediaItem.reportPaused" defaultMessage="Paused" />
                      </div> : null }
                  </div>
                </React.Fragment> : null }
              { projectMedia.added_as_similar_by_name && !projectMedia.confirmed_as_similar_by_name ?
                <React.Fragment>
                  <div className={classes.sep}> - </div>
                  <div className={classes.by}>
                    <FormattedMessage id="mediaItem.addedBy" defaultMessage="Added by {name}" values={{ name: projectMedia.added_as_similar_by_name }} />
                  </div>
                </React.Fragment> : null }
              { projectMedia.confirmed_as_similar_by_name ?
                <React.Fragment>
                  <div className={classes.sep}> - </div>
                  <div className={classes.by}>
                    <FormattedMessage id="mediaItem.confirmedBy" defaultMessage="Confirmed by {name}" values={{ name: projectMedia.confirmed_as_similar_by_name }} />
                  </div>
                </React.Fragment> : null }
            </Box>
            <Typography variant="body2" className={classes.description}>
              {truncateLength(projectMedia.description, 140)}
            </Typography>
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
        </Box> : null }
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
    </Box>
  );
};

MediaItem.defaultProps = {
  mainProjectMedia: { id: '' },
  relationship: null,
  canSwitch: false,
  canDelete: false,
  isSelected: false,
  showReportStatus: true,
  onSelect: () => {},
  modalOnly: false,
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
    description: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
    last_seen: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    requests_count: PropTypes.number.isRequired,
    linked_items_count: PropTypes.number.isRequired,
    report_status: PropTypes.string.isRequired,
    added_as_similar_by_name: PropTypes.string.isRequired,
    confirmed_as_similar_by_name: PropTypes.string.isRequired,
  }).isRequired,
  relationship: PropTypes.shape({
    id: PropTypes.string.isRequired,
    source_id: PropTypes.number, // Mandatory if canSwitch is true
    target_id: PropTypes.number, // Mandatory if canSwitch is true
  }),
  canSwitch: PropTypes.bool,
  canDelete: PropTypes.bool,
  isSelected: PropTypes.bool,
  showReportStatus: PropTypes.bool,
  onSelect: PropTypes.func,
  modalOnly: PropTypes.bool,
};

export default createFragmentContainer(withSetFlashMessage(MediaItem), {
  projectMedia: graphql`
    fragment MediaItem_projectMedia on ProjectMedia {
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
      added_as_similar_by_name
      confirmed_as_similar_by_name
    }
  `,
});
