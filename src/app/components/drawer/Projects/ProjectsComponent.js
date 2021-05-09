import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
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
import ProjectsListItem from './ProjectsListItem';
import NewProject from './NewProject';
import Can from '../../Can';
import { brandSecondary } from '../../../styles/js/shared';

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
}));

const ProjectsComponent = ({
  team,
  projects,
  projectGroups,
  savedSearches,
}) => {
  const pathParts = window.location.pathname.split('/');

  const classes = useStyles();

  const [folderMenuAnchor, setFolderMenuAnchor] = React.useState(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = React.useState(false);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = React.useState(false);
  const [showNewListDialog, setShowNewListDialog] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState({ type: pathParts[2], id: parseInt(pathParts[3], 10) });

  const isActive = (type, id) => type === activeItem.type && id === activeItem.id;

  const handleAllItems = () => {
    browserHistory.push(`/${team.slug}/all-items`);
  };

  const handleClick = (route, id) => {
    setActiveItem({ type: route, id });
  };

  // Projects that are not under a group
  const rootProjects = projects.filter(p => !p.project_group_id);

  return (
    <React.Fragment>
      <List className={classes.projectsComponentList}>
        <ListItem button onClick={handleAllItems}>
          <ListItemText>
            <FormattedMessage id="projectsComponent.allItems" defaultMessage="All items" />
          </ListItemText>
          <ListItemSecondaryAction>
            {team.medias_count}
          </ListItemSecondaryAction>
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemText>
            <Box display="flex" alignItems="center">
              <FormattedMessage id="projectsComponent.folders" defaultMessage="Folders" />
              <Can permissions={team.permissions} permission="create Project">
                <IconButton onClick={(e) => { setFolderMenuAnchor(e.currentTarget); }} className={classes.projectsComponentButton}>
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
                >
                  <FormattedMessage id="projectsComponent.newFolder" defaultMessage="New folder" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setFolderMenuAnchor(null);
                    setShowNewCollectionDialog(true);
                  }}
                >
                  <FormattedMessage id="projectsComponent.newCollection" defaultMessage="New collection" />
                </MenuItem>
              </Menu>
            </Box>
          </ListItemText>
        </ListItem>

        <Divider />

        <Box className={classes.projectsComponentScroll}>
          {projectGroups.map((projectGroup) => {
            const groupIsActive = isActive('collection', projectGroup.dbid);
            const groupComponent = <ProjectsListItem routePrefix="collection" icon={<FolderSpecialIcon />} project={projectGroup} teamSlug={team.slug} onClick={handleClick} isActive={groupIsActive} />;
            // Expand the project group if a project under it is currently active
            if (groupIsActive ||
                (activeItem.type === 'project' && projects.find(p => p.dbid === activeItem.id).project_group_id === projectGroup.dbid)) {
              const childProjects = projects.filter(p => p.project_group_id === projectGroup.dbid);
              if (childProjects.length === 0) {
                return groupComponent;
              }
              return (
                <Box className={groupIsActive ? classes.projectsComponentCollectionExpanded : ''}>
                  {groupComponent}
                  <List>
                    {childProjects.map(project => (
                      <ProjectsListItem routePrefix="project" icon={<FolderOpenIcon />} project={project} teamSlug={team.slug} onClick={handleClick} isActive={isActive('project', project.dbid)} className={classes.projectsComponentNestedList} />
                    ))}
                  </List>
                </Box>
              );
            }
            return groupComponent;
          })}

          {rootProjects.map(project => <ProjectsListItem routePrefix="project" icon={<FolderOpenIcon />} project={project} teamSlug={team.slug} onClick={handleClick} isActive={isActive('project', project.dbid)} />)}
        </Box>

        <Divider />
        <ListItem>
          <ListItemText>
            <Box display="flex" alignItems="center">
              <FormattedMessage id="projectsComponent.lists" defaultMessage="Lists" />
              <Can permissions={team.permissions} permission="create Project">
                <IconButton onClick={() => { setShowNewListDialog(true); }} className={classes.projectsComponentButton}>
                  <AddIcon />
                </IconButton>
              </Can>
            </Box>
          </ListItemText>
        </ListItem>
        <Divider />

        <Box className={classes.projectsComponentScroll}>
          {savedSearches.map(search => <ProjectsListItem routePrefix="list" icon={<ListIcon />} project={search} teamSlug={team.slug} onClick={handleClick} isActive={isActive('list', search.dbid)} />)}
        </Box>
      </List>

      <NewProject
        type="folder"
        teamId={team.dbid}
        open={showNewFolderDialog}
        onClose={() => { setShowNewFolderDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newFolder" defaultMessage="New folder" />}
        buttonLabel={<FormattedMessage id="projectsComponent.createFolder" defaultMessage="Create folder" />}
      />

      <NewProject
        type="collection"
        teamId={team.dbid}
        open={showNewCollectionDialog}
        onClose={() => { setShowNewCollectionDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newCollection" defaultMessage="New collection" />}
        buttonLabel={<FormattedMessage id="projectsComponent.createCollection" defaultMessage="Create collection" />}
      />

      <NewProject
        type="list"
        teamId={team.dbid}
        open={showNewListDialog}
        onClose={() => { setShowNewListDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newList" defaultMessage="New list" />}
        buttonLabel={<FormattedMessage id="projectsComponent.createList" defaultMessage="Create list" />}
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

export default ProjectsComponent;
