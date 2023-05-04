import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory, withRouter } from 'react-router';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { DragDropContext } from 'react-beautiful-dnd';
import ProjectsListItem from './ProjectsListItem';
import NewProject from './NewProject';
import AddCircleIcon from '../../../icons/add_circle.svg';
import CategoryIcon from '../../../icons/category.svg';
import ExpandLessIcon from '../../../icons/expand_less.svg';
import ExpandMoreIcon from '../../../icons/expand_more.svg';
import FileDownloadIcon from '../../../icons/file_download.svg';
import InboxIcon from '../../../icons/inbox.svg';
import LightbulbIcon from '../../../icons/lightbulb.svg';
import Can from '../../Can';
import { withSetFlashMessage } from '../../FlashMessage';
import styles from './Projects.module.css';

const ProjectsComponent = ({
  team,
  projects,
  projectGroups,
  savedSearches,
  feeds,
  location,
  setFlashMessage,
}) => {
  const [folderMenuAnchor, setFolderMenuAnchor] = React.useState(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = React.useState(false);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = React.useState(false);
  const [showNewListDialog, setShowNewListDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  console.log(team); // eslint-disable-line no-console
  const getBooleanPref = (key, fallback) => {
    const inStore = window.storage.getValue(key);
    if (inStore === null) return fallback;
    return (inStore === 'true');
  };

  const [foldersExpanded, setFoldersExpanded] =
    React.useState(getBooleanPref('drawer.foldersExpanded', true));
  const [listsExpanded, setListsExpanded] =
    React.useState(getBooleanPref('drawer.listsExpanded', true));
  const [feedsExpanded, setFeedsExpanded] =
    React.useState(getBooleanPref('drawer.feedsExpanded', true));

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

  const handleSpecialLists = (listId) => {
    setActiveItem({ type: listId, id: null });
    browserHistory.push(`/${team.slug}/${listId}`);
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

    // Project (folder) being moved to a project (folder) inside a project group (collection), so, assume the collection as destination
    } else if (source[1] === 'project' && target[1] === 'project' && target[3] !== 'null') {
      handleMove(source[2], parseInt(target[3], 10));

    // Anything else is not valid
    } else {
      setFlashMessage((
        <FormattedMessage
          id="projectsComponent.invalidMove"
          defaultMessage="Folders can only be moved to collections"
          description="Message displayed when a folder is moved to something that is not a collection"
        />
      ), 'info');
    }

    return true;
  };

  const handleToggleFoldersExpand = () => {
    setFoldersExpanded(!foldersExpanded);
    window.storage.set('drawer.foldersExpanded', !foldersExpanded);
  };

  const handleToggleListsExpand = () => {
    setListsExpanded(!listsExpanded);
    window.storage.set('drawer.listsExpanded', !listsExpanded);
  };

  const handleToggleFeedsExpand = () => {
    setFeedsExpanded(!feedsExpanded);
    window.storage.set('drawer.feedsExpanded', !feedsExpanded);
  };

  return (
    <React.Fragment>
      <div className={styles.listTitle}>
        Tipline
      </div>
      <List dense disablePadding className={[styles.listWrapper, 'projects-list'].join(' ')}>
        { saving && <div className={styles.listMask} /> }
        {/* All items */}
        <ListItem
          button
          onClick={handleAllItems}
          className={['projects-list__all-items', styles.listItem, styles.listItem_containsCount, (activeItem.type === 'all-items' ? styles.listItem_active : '')].join(' ')}
        >
          <CategoryIcon className={styles.listIcon} />
          <ListItemText disableTypography className={styles.listLabel}>
            <FormattedMessage tagName="span" id="projectsComponent.allItems" defaultMessage="All" description="Label for the 'All items' list displayed on the left sidebar" />
          </ListItemText>
          <ListItemSecondaryAction className={styles.listItemCount}>
            <small>
              {team.medias_count}
            </small>
          </ListItemSecondaryAction>
        </ListItem>

        { team.smooch_bot &&
          <ListItem
            button
            onClick={() => { handleSpecialLists('tipline-inbox'); }}
            className={['projects-list__tipline-inbox', styles.listItem, styles.listItem_containsCount, (activeItem.type === 'tipline-inbox' ? styles.listItem_active : '')].join(' ')}
          >
            <InboxIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.tiplineInbox" defaultMessage="Inbox" description="Label for a list displayed on the left sidebar." />
            </ListItemText>
            <ListItemSecondaryAction className={styles.listItemCount} />
          </ListItem>
        }

        { team.fetch_bot &&
          <ListItem
            button
            onClick={() => { handleSpecialLists('imported-fact-checks'); }}
            className={['projects-list__imported-fact-checks', styles.listItem, styles.listItem_containsCount, (activeItem.type === 'imported-fact-checks' ? styles.listItem_active : '')].join(' ')}
          >
            <FileDownloadIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.importedReports" defaultMessage="Imported" description="Label for a list displayed on the left sidebar." />
            </ListItemText>
            <ListItemSecondaryAction className={styles.listItemCount} />
          </ListItem>
        }

        { team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled &&
          <ListItem
            button
            onClick={() => { handleSpecialLists('suggested-matches'); }}
            className={['projects-list__suggested-matches', styles.listItem, styles.listItem_containsCount, (activeItem.type === 'suggested-matches' ? styles.listItem_active : '')].join(' ')}
          >
            <LightbulbIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.suggestedMatches" defaultMessage="Suggestions" description="Label for a list displayed on the left sidebar." />
            </ListItemText>
            <ListItemSecondaryAction className={styles.listItemCount} />
          </ListItem>
        }

        {/* Lists Header */}
        <ListItem onClick={handleToggleListsExpand} className={[styles.listHeader, 'project-list__header'].join(' ')}>
          { listsExpanded ? <ExpandLessIcon className={styles.listChevron} /> : <ExpandMoreIcon className={styles.listChevron} /> }
          <ListItemText disableTypography className={styles.listHeaderLabel}>
            <FormattedMessage tagName="span" id="projectsComponent.lists" defaultMessage="Custom Lists" description="List of items with some filters applied" />
            <Can permissions={team.permissions} permission="create Project">
              <IconButton onClick={(e) => { setShowNewListDialog(true); e.stopPropagation(); }} className={styles.listHeaderLabelButton}>
                <AddCircleIcon id="projects-list__add-filtered-list" />
              </IconButton>
            </Can>
          </ListItemText>
        </ListItem>

        {/* Lists */}
        <React.Fragment>
          <Collapse in={listsExpanded} className={styles.listCollapseWrapper}>
            { savedSearches.length === 0 ?
              <ListItem className={[styles.listItem, styles.listItem_containsCount, styles.listItem_empty].join(' ')}>
                <ListItemText disableTypography className={styles.listLabel}>
                  <span>
                    <FormattedMessage tagName="em" id="projectsComponent.noCustomLists" defaultMessage="No custom lists" description="Displayed under the custom list header when there are no lists in it" />
                  </span>
                </ListItemText>
              </ListItem> :
              <>
                {savedSearches.sort((a, b) => (a.title.localeCompare(b.title))).map(search => (
                  <ProjectsListItem
                    key={search.id}
                    routePrefix="list"
                    project={search}
                    teamSlug={team.slug}
                    onClick={handleClick}
                    isActive={isActive('list', search.dbid)}
                  />
                ))}
              </>
            }
          </Collapse>
        </React.Fragment>

        {/* Shared feeds */}
        { feeds.length > 0 &&
          <React.Fragment>
            <ListItem onClick={handleToggleFeedsExpand} className={[styles.listHeader, 'project-list__header'].join(' ')}>
              { feedsExpanded ? <ExpandLessIcon className={styles.listChevron} /> : <ExpandMoreIcon className={styles.listChevron} /> }
              <ListItemText disableTypography className={styles.listHeaderLabel}>
                <FormattedMessage tagName="span" id="projectsComponent.sharedFeeds" defaultMessage="Shared feeds" description="Feeds of content shared across workspaces" />
              </ListItemText>
            </ListItem>
            <Collapse in={feedsExpanded} className={styles.listCollapseWrapper}>
              {feeds.sort((a, b) => (a?.title?.localeCompare(b.title))).map(feed => (
                <ProjectsListItem
                  key={feed.id}
                  routePrefix="feed"
                  routeSuffix="/shared"
                  project={feed}
                  teamSlug={team.slug}
                  onClick={handleClick}
                  isActive={isActive('feed', feed.dbid)}
                />
              ))}
            </Collapse>
          </React.Fragment>
        }

        {/* Folders: create new folder or collection */}
        <ListItem onClick={handleToggleFoldersExpand} className={[styles.listHeader, 'project-list__header'].join(' ')}>
          { foldersExpanded ? <ExpandLessIcon className={styles.listChevron} /> : <ExpandMoreIcon className={styles.listChevron} /> }
          <ListItemText disableTypography className={styles.listHeaderLabel}>
            <FormattedMessage tagName="span" id="projectsComponent.folders" defaultMessage="Folders" description="Label for a collapsable panel displayed on the left sidebar." />
            <Can permissions={team.permissions} permission="create Project">
              <IconButton onClick={(e) => { setFolderMenuAnchor(e.currentTarget); e.stopPropagation(); }} className={[styles.listHeaderLabelButton, 'projects-list__add-folder-or-collection'].join(' ')}>
                <AddCircleIcon />
              </IconButton>
            </Can>
            <Menu
              anchorEl={folderMenuAnchor}
              keepMounted
              open={Boolean(folderMenuAnchor)}
              onClose={() => { setFolderMenuAnchor(null); }}
            >
              <MenuItem
                onClick={(e) => {
                  setFolderMenuAnchor(null);
                  setShowNewFolderDialog(true);
                  e.stopPropagation();
                }}
                className="projects-list__add-folder"
              >
                <FormattedMessage id="projectsComponent.newFolderMenu" defaultMessage="New folder" description="Menu item for creating new folder" />
              </MenuItem>
              <MenuItem
                onClick={(e) => {
                  setFolderMenuAnchor(null);
                  setShowNewCollectionDialog(true);
                  e.stopPropagation();
                }}
                className="projects-list__add-collection"
              >
                <FormattedMessage id="projectsComponent.newCollectionMenu" defaultMessage="New collection" description="Menu item for creating new collection" />
              </MenuItem>
            </Menu>
          </ListItemText>
        </ListItem>

        {/* Collections and their folders */}
        <Collapse in={foldersExpanded} className={styles.listCollapseWrapper}>
          <DragDropContext onDragEnd={handleDropped} key={`${projectGroups.length}-${projects.length}`}>
            {projectGroups.sort((a, b) => (a.title.localeCompare(b.title))).map((projectGroup) => {
              const groupIsActive = isActive('collection', projectGroup.dbid);
              const groupProjectActive = (activeItem.type === 'project' && projects.find(p => p.dbid === activeItem.id) && projects.find(p => p.dbid === activeItem.id).project_group_id === projectGroup.dbid);
              const groupIsExpanded = (!collapsed && groupIsActive) || groupProjectActive;

              const groupComponent = (
                <ProjectsListItem
                  key={projectGroup.id}
                  routePrefix="collection"
                  project={projectGroup}
                  teamSlug={team.slug}
                  onClick={handleClick}
                  icon={groupIsExpanded ? <ExpandLessIcon className={styles.listChevron} /> : <ExpandMoreIcon className={styles.listChevron} />}
                  isActive={groupIsActive}
                  className={[
                    styles.listItem_group,
                    groupIsExpanded ? styles.listItem_group_expanded : '',
                    !groupIsActive && groupIsExpanded ? styles.listItem_group_expanded_slim : '',
                  ].join(' ')}
                  isDroppable
                />
              );

              // We can stop here if groups are collapsed, only one group is open at a time
              if (collapsed) {
                return groupComponent;
              }

              // Expand the project group if a project under it is currently active
              if (groupIsActive || groupProjectActive) {
                const childProjects = projects.filter(p => p.project_group_id === projectGroup.dbid);
                return (
                  <>
                    {groupComponent}
                    <List
                      dense
                      disablePadding
                      className={styles.groupList}
                      key={projectGroup.id}
                    >
                      { childProjects.length === 0 ?
                        <ListItem className={[styles.listItem, styles.listItem_empty].join(' ')}>
                          <ListItemText disableTypography className={styles.listLabel}>
                            <span>
                              <FormattedMessage tagName="em" id="projectsComponent.noFolders" defaultMessage="No folders in this collection" description="Displayed under a collection when there are no folders in it" />
                            </span>
                          </ListItemText>
                        </ListItem> :
                        <React.Fragment>
                          {childProjects.sort((a, b) => (a.title.localeCompare(b.title))).map((project, index) => (
                            <ProjectsListItem
                              key={project.id}
                              index={index}
                              routePrefix="project"
                              project={project}
                              teamSlug={team.slug}
                              onClick={handleClick}
                              isActive={isActive('project', project.dbid)}
                              isDraggable
                            />
                          ))}
                        </React.Fragment>
                      }
                    </List>
                  </>
                );
              }

              return groupComponent;
            })}

            {/* Folders that are not inside any collection */}
            {projects.filter(p => !p.project_group_id).sort((a, b) => (a.title.localeCompare(b.title))).map((project, index) => (
              <ProjectsListItem
                key={project.id}
                index={index}
                routePrefix="project"
                project={project}
                teamSlug={team.slug}
                onClick={handleClick}
                isActive={isActive('project', project.dbid)}
                isDraggable
              />
            ))}
          </DragDropContext>
        </Collapse>
      </List>

      {/* Dialogs to create new folder, collection or list */}

      <NewProject
        type="folder"
        team={team}
        open={showNewFolderDialog}
        onClose={() => { setShowNewFolderDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newFolder" defaultMessage="New folder" description="Dialog title for creating new folder" />}
        buttonLabel={<FormattedMessage id="projectsComponent.createFolder" defaultMessage="Create folder" description="Button label for creating new folder" />}
        helpUrl="http://help.checkmedia.org/en/articles/5229479-folders-and-collections"
        errorMessage={<FormattedMessage id="projectsComponent.newFolderErrorMessage" defaultMessage="Could not create folder, please try again" description="Error message when creating new folder fails" />}
        successMessage={<FormattedMessage id="projectsComponent.newFolderSuccessMessage" defaultMessage="Folder created successfully" description="Success message when new folder is created" />}
      />

      <NewProject
        type="collection"
        team={team}
        open={showNewCollectionDialog}
        onClose={() => { setShowNewCollectionDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newCollection" defaultMessage="New collection" description="Dialog title for creating new collection" />}
        buttonLabel={<FormattedMessage id="projectsComponent.createCollection" defaultMessage="Create collection" description="Button label for creating new collection" />}
        helpUrl="http://help.checkmedia.org/en/articles/5229479-folders-and-collections"
        errorMessage={<FormattedMessage id="projectsComponent.newCollectionErrorMessage" defaultMessage="Could not create collection, please try again" description="Error message when creating new collection fails" />}
        successMessage={<FormattedMessage id="projectsComponent.newCollectionSuccessMessage" defaultMessage="Collection created successfully" description="Success message when new collection is created" />}
      />

      <NewProject
        type="list"
        team={team}
        open={showNewListDialog}
        onClose={() => { setShowNewListDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newList" defaultMessage="New list" description="Title for a dialog to create a new list displayed on the left sidebar." />}
        buttonLabel={<FormattedMessage id="projectsComponent.createList" defaultMessage="Create list" description="Label for a button to create a new list displayed on the left sidebar." />}
        helpUrl="https://help.checkmedia.org/en/articles/5229474-filtered-lists"
        errorMessage={<FormattedMessage id="projectsComponent.newListErrorMessage" defaultMessage="Could not create list, please try again" description="Error message when creating new list fails" />}
        successMessage={<FormattedMessage id="projectsComponent.newListSuccessMessage" defaultMessage="List created successfully" description="Success message when new list is created" />}
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
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
  }).isRequired).isRequired,
  savedSearches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  feeds: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired).isRequired,
};

export default withSetFlashMessage(withRouter(ProjectsComponent));
