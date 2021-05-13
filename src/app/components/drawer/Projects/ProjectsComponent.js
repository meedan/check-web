import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import { browserHistory, withRouter } from 'react-router';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import ListIcon from '@material-ui/icons/List';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { DragDropContext } from 'react-beautiful-dnd';
import ProjectsListItem from './ProjectsListItem';
import NewProject from './NewProject';
import Can from '../../Can';
import { brandSecondary } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';

const useStyles = makeStyles(theme => ({
  projectsComponentList: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto', // take up _all_ remaining vertical space in the <DrawerNavigationComponent>
    overflow: 'hidden',
  },
  projectsComponentPlus: {
    minWidth: 0,
  },
  projectsComponentCollectionExpanded: {
    background: brandSecondary,
  },
  projectsComponentNestedList: {
    paddingLeft: theme.spacing(3),
  },
  projectsComponentScroll: {
    overflow: 'auto',
    flex: '1',
  },
  projectsComponentButton: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  projectsComponentMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    background: 'white',
    opacity: 0.7,
    zIndex: 1,
  },
}));

const ProjectsComponent = ({
  team,
  projects,
  projectGroups,
  savedSearches,
  location,
  setFlashMessage,
}) => {
  const classes = useStyles();

  const [folderMenuAnchor, setFolderMenuAnchor] = React.useState(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = React.useState(false);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = React.useState(false);
  const [showNewListDialog, setShowNewListDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  // Get/set which list item should be highlighted
  const pathParts = window.location.pathname.split('/');
  const [activeItem, setActiveItem] = React.useState({ type: pathParts[2], id: parseInt(pathParts[3], 10) });
  React.useEffect(() => {
    const path = location.pathname.split('/');
    if (activeItem.type !== path[2] || activeItem.id !== path[3]) {
      setActiveItem({ type: path[2], id: parseInt(path[3], 10) });
    }
  }, [location.pathname]);
  const isActive = (type, id) => type === activeItem.type && id === activeItem.id;

  const handleAllItems = () => {
    setActiveItem({ type: 'all-items', id: null });
    browserHistory.push(`/${team.slug}/all-items`);
  };

  const handleClick = (route, id) => {
    if (route === 'collection' && route === activeItem.type && id === activeItem.id) {
      setCollapsed(!collapsed);
    } else if (route !== activeItem.type || id !== activeItem.id) {
      setActiveItem({ type: route, id });
      if (collapsed) {
        setCollapsed(false);
      }
    }
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="projectsComponent.couldNotMove"
        defaultMessage="Could not move folder to collection"
        description="Error message displayed when it's not possible to move folder to a collection"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="projectsComponent.movedSuccessfully"
        defaultMessage="Folder moved successfully"
        description="Message displayed when a folder is moved to or from a collection"
      />
    ), 'success');
  };

  const handleMove = (projectId, projectGroupDbid, previousProjectGroupDbid) => {
    setSaving(true);

    commitMutation(Store, {
      mutation: graphql`
        mutation ProjectsComponentUpdateProjectMutation($input: UpdateProjectInput!) {
          updateProject(input: $input) {
            project {
              id
              dbid
              project_group_id
            }
            project_group {
              id
              medias_count
            }
            project_group_was {
              id
              medias_count
            }
          }
        }
      `,
      variables: {
        input: {
          id: projectId,
          project_group_id: projectGroupDbid,
          previous_project_group_id: previousProjectGroupDbid,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
          if (projectGroupDbid) {
            const destination = `/${team.slug}/collection/${projectGroupDbid}`;
            if (window.location.pathname !== destination) {
              browserHistory.push(destination);
            }
          }
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleDropped = (result) => {
    const source = result.draggableId.split('-');

    // Dropped outside a valid destination: remove from any collection
    if (!result.destination) {
      if (source[3] !== 'null') {
        handleMove(source[2], null, parseInt(source[3], 10));
      }
      return false;
    }
    const target = result.destination.droppableId.split('-');

    // Project (folder) being moved to a project group (collection)
    if (source[1] === 'project' && target[1] === 'collection') {
      setCollapsed(false);
      handleMove(source[2], parseInt(target[2], 10));

    // Project (folder) being moved out from a group (collection)
    } else if (source[1] === 'project' && source[3] !== 'null') {
      handleMove(source[2], null, parseInt(source[3], 10));

    // Anything else is not valid
    } else {
      setFlashMessage((
        <FormattedMessage
          id="projectsComponent.invalidMove"
          defaultMessage="Folders can just be moved to collections"
          description="Message displayed when a folder is moved to something that is not a collection"
        />
      ), 'info');
    }

    return true;
  };

  return (
    <React.Fragment>
      <List className={[classes.projectsComponentList, 'projects-list'].join(' ')}>
        { saving ? <Box className={classes.projectsComponentMask} /> : null }

        {/* All items */}
        <ListItem
          button
          onClick={handleAllItems}
          className={activeItem.type === 'all-items' ? ['projects-list__all-items', classes.projectsComponentCollectionExpanded].join(' ') : 'projects-list__all-items'}
        >
          <ListItemText>
            <FormattedMessage id="projectsComponent.allItems" defaultMessage="All items" />
          </ListItemText>
          <ListItemSecondaryAction>
            {team.medias_count}
          </ListItemSecondaryAction>
        </ListItem>

        <Divider />

        {/* Folders: create new folder or collection */}
        <ListItem>
          <ListItemText>
            <Box display="flex" alignItems="center">
              <FormattedMessage id="projectsComponent.folders" defaultMessage="Folders" />
              <Can permissions={team.permissions} permission="create Project">
                <IconButton onClick={(e) => { setFolderMenuAnchor(e.currentTarget); }} className={[classes.projectsComponentButton, 'projects-list__add-folder-or-collection'].join(' ')}>
                  <AddIcon />
                </IconButton>
              </Can>
              <Menu
                anchorEl={folderMenuAnchor}
                keepMounted
                open={Boolean(folderMenuAnchor)}
                onClose={() => { setFolderMenuAnchor(null); }}
              >
                <MenuItem
                  onClick={() => {
                    setFolderMenuAnchor(null);
                    setShowNewFolderDialog(true);
                  }}
                  className="projects-list__add-folder"
                >
                  <FormattedMessage id="projectsComponent.newFolder" defaultMessage="New folder" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setFolderMenuAnchor(null);
                    setShowNewCollectionDialog(true);
                  }}
                  className="projects-list__add-collection"
                >
                  <FormattedMessage id="projectsComponent.newCollection" defaultMessage="New collection" />
                </MenuItem>
              </Menu>
            </Box>
          </ListItemText>
        </ListItem>

        {/* Collections and their folders */}
        <DragDropContext onDragEnd={handleDropped} key={`${projectGroups.length}-${projects.length}`}>
          <Box className={classes.projectsComponentScroll}>
            {projectGroups.sort((a, b) => (a.title.localeCompare(b.title))).map((projectGroup) => {
              const groupIsActive = isActive('collection', projectGroup.dbid);
              const groupComponent = (
                <ProjectsListItem
                  routePrefix="collection"
                  icon={<FolderSpecialIcon />}
                  project={projectGroup}
                  teamSlug={team.slug}
                  onClick={handleClick}
                  isActive={groupIsActive}
                  isDroppable
                />
              );

              // We can stop here if this group should be collapsed
              if (collapsed) {
                return groupComponent;
              }

              // Expand the project group if a project under it is currently active
              if (groupIsActive ||
                  (activeItem.type === 'project' && projects.find(p => p.dbid === activeItem.id) && projects.find(p => p.dbid === activeItem.id).project_group_id === projectGroup.dbid)) {
                const childProjects = projects.filter(p => p.project_group_id === projectGroup.dbid);
                return (
                  <Box className={groupIsActive ? classes.projectsComponentCollectionExpanded : ''}>
                    {groupComponent}
                    <List>
                      { childProjects.length === 0 ?
                        <ListItem disabled dense>
                          <ListItemText>
                            <FormattedMessage id="projectsComponent.noFolders" defaultMessage="No folders in this collection" description="Displayed under a collection when there are no folders in it" />
                          </ListItemText>
                        </ListItem> :
                        <React.Fragment>
                          {childProjects.sort((a, b) => (a.title.localeCompare(b.title))).map((project, index) => (
                            <ProjectsListItem
                              index={index}
                              routePrefix="project"
                              icon={<FolderOpenIcon />}
                              project={project}
                              teamSlug={team.slug}
                              onClick={handleClick}
                              isActive={isActive('project', project.dbid)}
                              className={classes.projectsComponentNestedList}
                              isDraggable
                            />
                          ))}
                        </React.Fragment>
                      }
                    </List>
                  </Box>
                );
              }

              return groupComponent;
            })}

            {/* Folders that are not inside any collection */}
            {projects.filter(p => !p.project_group_id).sort((a, b) => (a.title.localeCompare(b.title))).map((project, index) => (
              <ProjectsListItem
                index={index}
                routePrefix="project"
                icon={<FolderOpenIcon />}
                project={project}
                teamSlug={team.slug}
                onClick={handleClick}
                isActive={isActive('project', project.dbid)}
                isDraggable
              />
            ))}
          </Box>
        </DragDropContext>

        <Divider />

        {/* Lists: create new list */}
        <ListItem>
          <ListItemText>
            <Box display="flex" alignItems="center">
              <FormattedMessage id="projectsComponent.lists" defaultMessage="Filtered lists" description="List of items with some filters applied" />
              <Can permissions={team.permissions} permission="create Project">
                <IconButton onClick={() => { setShowNewListDialog(true); }} className={classes.projectsComponentButton}>
                  <AddIcon />
                </IconButton>
              </Can>
            </Box>
          </ListItemText>
        </ListItem>

        {/* Lists */}
        <Box className={classes.projectsComponentScroll}>
          {savedSearches.sort((a, b) => (a.title.localeCompare(b.title))).map(search => (
            <ProjectsListItem
              routePrefix="list"
              icon={<ListIcon />}
              project={search}
              teamSlug={team.slug}
              onClick={handleClick}
              isActive={isActive('list', search.dbid)}
            />
          ))}
        </Box>
      </List>

      {/* Dialogs to create new folder, collection or list */}

      <NewProject
        type="folder"
        teamId={team.dbid}
        open={showNewFolderDialog}
        onClose={() => { setShowNewFolderDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newFolder" defaultMessage="New folder" />}
        buttonLabel={<FormattedMessage id="projectsComponent.createFolder" defaultMessage="Create folder" />}
        helpUrl="http://help.checkmedia.org/en/articles/5229479-folders-and-collections"
      />

      <NewProject
        type="collection"
        teamId={team.dbid}
        open={showNewCollectionDialog}
        onClose={() => { setShowNewCollectionDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newCollection" defaultMessage="New collection" />}
        buttonLabel={<FormattedMessage id="projectsComponent.createCollection" defaultMessage="Create collection" />}
        helpUrl="http://help.checkmedia.org/en/articles/5229479-folders-and-collections"
      />

      <NewProject
        type="list"
        teamId={team.dbid}
        open={showNewListDialog}
        onClose={() => { setShowNewListDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newList" defaultMessage="New list" />}
        buttonLabel={<FormattedMessage id="projectsComponent.createList" defaultMessage="Create list" />}
        helpUrl="https://help.checkmedia.org/en/articles/5229474-filtered-lists"
        noDescription
      />
    </React.Fragment>
  );
};

ProjectsComponent.propTypes = {
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"create Media":true}'
  }).isRequired,
  projects: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
  }).isRequired).isRequired,
  projectGroups: PropTypes.arrayOf(PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
  }).isRequired).isRequired,
  savedSearches: PropTypes.arrayOf(PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }).isRequired).isRequired,
};

export default withSetFlashMessage(withRouter(ProjectsComponent));
