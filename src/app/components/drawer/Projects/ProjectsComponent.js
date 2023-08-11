import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory, withRouter } from 'react-router';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ProjectsListItem from './ProjectsListItem';
import NewProject from './NewProject';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import AddCircleIcon from '../../../icons/add_circle.svg';
import CategoryIcon from '../../../icons/category.svg';
import ExpandLessIcon from '../../../icons/expand_less.svg';
import ExpandMoreIcon from '../../../icons/expand_more.svg';
import FeedIcon from '../../../icons/dynamic_feed.svg';
import FileDownloadIcon from '../../../icons/file_download.svg';
import InboxIcon from '../../../icons/inbox.svg';
import LightbulbIcon from '../../../icons/lightbulb.svg';
import UnmatchedIcon from '../../../icons/unmatched.svg';
import Can from '../../Can';
import { withSetFlashMessage } from '../../FlashMessage';
import styles from './Projects.module.css';

const ProjectsComponent = ({
  team,
  savedSearches,
  feeds,
  location,
}) => {
  const [showNewListDialog, setShowNewListDialog] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const getBooleanPref = (key, fallback) => {
    const inStore = window.storage.getValue(key);
    if (inStore === null) return fallback;
    return (inStore === 'true');
  };

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

  const handleCreateFeed = () => {
    browserHistory.push(`/${team.slug}/feed/create`);
  };

  const handleSpecialLists = (listId) => {
    setActiveItem({ type: listId, id: null });
    browserHistory.push(`/${team.slug}/${listId}`);
  };

  const handleClick = (route, id) => {
    if (route !== activeItem.type || id !== activeItem.id) {
      setActiveItem({ type: route, id });
      if (collapsed) {
        setCollapsed(false);
      }
    }
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
              <FormattedMessage tagName="span" id="projectsComponent.tiplineInbox" defaultMessage="Inbox" description="Label for a list displayed on the left sidebar that includes items from is any tip line channel and the item status is unstarted" />
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
              <FormattedMessage tagName="span" id="projectsComponent.importedReports" defaultMessage="Imported" description="Label for a list displayed on the left sidebar that includes items from the 'Imported fact-checks' channel" />
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
              <FormattedMessage tagName="span" id="projectsComponent.suggestedMatches" defaultMessage="Suggestions" description="Label for a list displayed on the left sidebar that includes items that have a number of suggestions is more than 1" />
            </ListItemText>
            <ListItemSecondaryAction className={styles.listItemCount} />
          </ListItem>
        }

        { team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled &&
          <ListItem
            button
            onClick={() => { handleSpecialLists('unmatched-media'); }}
            className={['projects-list__unmatched-media', styles.listItem, styles.listItem_containsCount, (activeItem.type === 'unmatched-media' ? styles.listItem_active : '')].join(' ')}
          >
            <UnmatchedIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.unmatchedMedia" defaultMessage="Unmatched media" description="Label for a list displayed on the left sidebar that includes items that were unmatched from other items (detached or rejected)" />
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
              <Tooltip title={<FormattedMessage id="projectsComponent.newListButton" defaultMessage="New list" description="Tooltip for button that opens list creation dialog" />}>
                <IconButton id="projects-list__add-filtered-list" onClick={(e) => { setShowNewListDialog(true); e.stopPropagation(); }} className={styles.listHeaderLabelButton}>
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
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
                    icon={search.is_part_of_feeds && <FeedIcon className={`${styles.listIcon} ${styles.listIconFeed}`} />}
                    isActive={isActive('list', search.dbid)}
                  />
                ))}
              </>
            }
          </Collapse>
        </React.Fragment>

        {/* Shared feeds */}
        <ListItem onClick={handleToggleFeedsExpand} className={[styles.listHeader, 'project-list__header'].join(' ')}>
          { feedsExpanded ? <ExpandLessIcon className={styles.listChevron} /> : <ExpandMoreIcon className={styles.listChevron} /> }
          <ListItemText disableTypography className={styles.listHeaderLabel}>
            <FormattedMessage tagName="span" id="projectsComponent.sharedFeeds" defaultMessage="Shared feeds" description="Feeds of content shared across workspaces" />
            <Can permissions={team.permissions} permission="create Feed">
              <Tooltip title={<FormattedMessage id="projectsComponent.newSharedFeed" defaultMessage="New shared feed" description="Tooltip for the button that navigates to shared feed creation page" />}>
                <IconButton onClick={(e) => { handleCreateFeed(); e.stopPropagation(); }} className={[styles.listHeaderLabelButton, 'projects-list__add-feed'].join(' ')}>
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
            </Can>
          </ListItemText>
        </ListItem>
        <Collapse in={feedsExpanded} className={styles.listCollapseWrapper}>
          { feeds.length === 0 ?
            <ListItem className={[styles.listItem, styles.listItem_containsCount, styles.listItem_empty].join(' ')}>
              <ListItemText disableTypography className={styles.listLabel}>
                <span>
                  <FormattedMessage tagName="em" id="projectsComponent.noSharedFeeds" defaultMessage="No shared feeds" description="Displayed under the shared feed header when there are no feeds in it" />
                </span>
              </ListItemText>
            </ListItem> :
            <>
              {feeds.sort((a, b) => (a?.title?.localeCompare(b.title))).map(feed => (
                <ProjectsListItem
                  key={feed.id}
                  routePrefix="feed"
                  routeSuffix="/feed"
                  project={feed}
                  teamSlug={team.slug}
                  onClick={handleClick}
                  isActive={isActive('feed', feed.dbid)}
                />
              ))}
            </>
          }
        </Collapse>
      </List>

      {/* Dialog to create list */}

      <NewProject
        team={team}
        open={showNewListDialog}
        onClose={() => { setShowNewListDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newList" defaultMessage="New list" description="Title for a dialog to create a new list displayed on the left sidebar." />}
        buttonLabel={<FormattedMessage id="projectsComponent.createList" defaultMessage="Create list" description="Label for a button to create a new list displayed on the left sidebar." />}
        helpUrl="https://help.checkmedia.org/en/articles/5229474-filtered-lists"
        errorMessage={<FormattedMessage id="projectsComponent.newListErrorMessage" defaultMessage="Could not create list, please try again" description="Error message when creating new list fails" />}
        successMessage={<FormattedMessage id="projectsComponent.newListSuccessMessage" defaultMessage="List created successfully" description="Success message when new list is created" />}
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
