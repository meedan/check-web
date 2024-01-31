import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { browserHistory, withRouter, Link } from 'react-router';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import cx from 'classnames/bind';
import ProjectsListItem from './ProjectsListItem';
import NewProject from './NewProject';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import AddCircleIcon from '../../../icons/add_circle.svg';
import CategoryIcon from '../../../icons/category.svg';
import ExpandLessIcon from '../../../icons/expand_less.svg';
import ExpandMoreIcon from '../../../icons/expand_more.svg';
import FeedIcon from '../../../icons/dynamic_feed.svg';
import FileDownloadIcon from '../../../icons/file_download.svg';
import InboxIcon from '../../../icons/inbox.svg';
import LightbulbIcon from '../../../icons/lightbulb.svg';
import PersonIcon from '../../../icons/person.svg';
import PublishedIcon from '../../../icons/fact_check.svg';
import UnmatchedIcon from '../../../icons/unmatched.svg';
import Can from '../../Can';
import DeleteIcon from '../../../icons/delete.svg';
import ReportIcon from '../../../icons/report.svg';
import ScheduleSendIcon from '../../../icons/schedule_send.svg';
import { withSetFlashMessage } from '../../FlashMessage';
import { assignedToMeDefaultQuery } from '../../team/AssignedToMe';
import { suggestedMatchesDefaultQuery } from '../../team/SuggestedMatches';
import { importedReportsDefaultQuery } from '../../team/ImportedReports';
import { unmatchedMediaDefaultQuery } from '../../team/UnmatchedMedia';
import { publishedDefaultQuery } from '../../team/Published';
import { tiplineInboxDefaultQuery } from '../../team/TiplineInbox';
import ProjectsCoreListCounter from './ProjectsCoreListCounter';
import styles from './Projects.module.css';

const messages = defineMessages({
  pendingInvitationFeedTooltip: {
    id: 'projectsComponent.pendingInvitationFeedTitle',
    defaultMessage: 'Pending invitation: {feedTitle}',
    description: 'Tooltip for a navigation item that has a status of a pending invitation',
  },
});

const ProjectsComponent = ({
  currentUser,
  team,
  savedSearches,
  feeds,
  location,
  intl,
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
  };

  const handleCreateFeed = () => {
    browserHistory.push(`/${team.slug}/feed/create`);
  };

  const handleSpecialLists = (listId) => {
    setActiveItem({ type: listId, id: null });
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

  const handleTrash = () => {
    setActiveItem({ type: 'trash', id: null });
  };

  const handleSpam = () => {
    setActiveItem({ type: 'spam', id: null });
  };

  return (
    <React.Fragment>
      <div className={styles.listTitle}>
        Tipline
      </div>
      <List dense disablePadding className={[styles.listWrapper, 'projects-list'].join(' ')}>
        {/* All items */}
        <Link
          onClick={handleAllItems}
          to={`/${team.slug}/all-items`}
          className={styles.linkList}
        >
          <ListItem
            className={[
              'projects-list__all-items',
              styles.listItem,
              styles.listItem_containsCount,
              activeItem.type === 'all-items'
                ? styles.listItem_active
                : '',
            ].join(' ')}
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
        </Link>
        { /* Assigned to me */}
        <Link
          onClick={() => { handleSpecialLists('assigned-to-me'); }}
          to={`/${team.slug}/assigned-to-me`}
          className={styles.linkList}
        >
          <ListItem
            className={[
              'projects-list__assigned-to-me',
              styles.listItem,
              styles.listItem_containsCount,
              activeItem.type === 'assigned-to-me' ? styles.listItem_active : '',
            ].join(' ')}
          >
            <PersonIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.assignedToMe" defaultMessage="Assigned to me" description="Label for a list displayed on the left sidebar that includes items that are assigned to the current user" />
            </ListItemText>
            <ProjectsCoreListCounter query={{ ...assignedToMeDefaultQuery, assigned_to: [currentUser.dbid] }} />
          </ListItem>
        </Link>
        { team.smooch_bot &&
          <Link
            onClick={() => { handleSpecialLists('tipline-inbox'); }}
            to={`/${team.slug}/tipline-inbox`}
            className={styles.linkList}
          >
            <ListItem
              className={[
                'projects-list__tipline-inbox',
                styles.listItem,
                styles.listItem_containsCount,
                activeItem.type === 'tipline-inbox' ? styles.listItem_active : '',
              ].join(' ')}
            >
              <InboxIcon className={styles.listIcon} />
              <ListItemText disableTypography className={styles.listLabel}>
                <FormattedMessage tagName="span" id="projectsComponent.tiplineInbox" defaultMessage="Inbox" description="Label for a list displayed on the left sidebar that includes items from is any tip line channel and the item status is unstarted" />
              </ListItemText>
              <ProjectsCoreListCounter query={{ ...tiplineInboxDefaultQuery, verification_status: [team.verification_statuses.default] }} />
            </ListItem>
          </Link>
        }
        <Link
          onClick={() => { handleSpecialLists('imported-fact-checks'); }}
          to={`/${team.slug}/imported-fact-checks`}
          className={styles.linkList}
        >
          <ListItem
            className={[
              'projects-list__imported-fact-checks',
              styles.listItem,
              styles.listItem_containsCount,
              activeItem.type === 'imported-fact-checks'
                ? styles.listItem_active
                : '',
            ].join(' ')}
          >
            <FileDownloadIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.importedReports" defaultMessage="Imported" description="Label for a list displayed on the left sidebar that includes items from the 'Imported fact-checks' channel" />
            </ListItemText>
            <ProjectsCoreListCounter query={importedReportsDefaultQuery} />
          </ListItem>
        </Link>

        { team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled &&
          <Link
            onClick={() => { handleSpecialLists('suggested-matches'); }}
            to={`/${team.slug}/suggested-matches`}
            className={styles.linkList}
          >
            <ListItem
              className={[
                'projects-list__suggested-matches',
                styles.listItem,
                styles.listItem_containsCount,
                activeItem.type === 'suggested-matches'
                  ? styles.listItem_active
                  : '',
              ].join(' ')}
            >
              <LightbulbIcon className={styles.listIcon} />
              <ListItemText disableTypography className={styles.listLabel}>
                <FormattedMessage tagName="span" id="projectsComponent.suggestedMatches" defaultMessage="Suggestions" description="Label for a list displayed on the left sidebar that includes items that have a number of suggestions is more than 1" />
              </ListItemText>
              <ProjectsCoreListCounter query={suggestedMatchesDefaultQuery} />
            </ListItem>
          </Link>
        }

        { team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled &&
          <Link
            onClick={() => { handleSpecialLists('unmatched-media'); }}
            to={`/${team.slug}/unmatched-media`}
            className={styles.linkList}
          >
            <ListItem
              className={[
                'projects-list__unmatched-media',
                styles.listItem,
                styles.listItem_containsCount,
                activeItem.type === 'unmatched-media' ? styles.listItem_active : '',
              ].join(' ')}
            >
              <UnmatchedIcon className={styles.listIcon} />
              <ListItemText disableTypography className={styles.listLabel}>
                <FormattedMessage tagName="span" id="projectsComponent.unmatchedMedia" defaultMessage="Unmatched media" description="Label for a list displayed on the left sidebar that includes items that were unmatched from other items (detached or rejected)" />
              </ListItemText>
              <ProjectsCoreListCounter query={unmatchedMediaDefaultQuery} />
            </ListItem>
          </Link>
        }
        <Link
          onClick={() => { handleSpecialLists('published'); }}
          to={`/${team.slug}/published`}
          className={styles.linkList}
        >
          <ListItem
            className={[
              'projects-list__published',
              styles.listItem,
              styles.listItem_containsCount,
              activeItem.type === 'published' ? styles.listItem_active : '',
            ].join(' ')}
          >
            <PublishedIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.published" defaultMessage="Published" description="Label for a list displayed on the left sidebar that includes items that have published reports" />
            </ListItemText>
            <ProjectsCoreListCounter query={publishedDefaultQuery} />
          </ListItem>
        </Link>

        {/* Lists Header */}
        <ListItem onClick={handleToggleListsExpand} className={[styles.listHeader, 'project-list__header'].join(' ')}>
          { listsExpanded ? <ExpandLessIcon className={styles.listChevron} /> : <ExpandMoreIcon className={styles.listChevron} /> }
          <ListItemText disableTypography className={styles.listHeaderLabel}>
            <FormattedMessage tagName="span" id="projectsComponent.lists" defaultMessage="Custom Lists" description="List of items with some filters applied" />
            <Can permissions={team.permissions} permission="create Project">
              <Tooltip arrow title={<FormattedMessage id="projectsComponent.newListButton" defaultMessage="New list" description="Tooltip for button that opens list creation dialog" />}>
                <span className={styles.listHeaderLabelButton}>
                  <ButtonMain
                    iconCenter={<AddCircleIcon />}
                    variant="contained"
                    size="small"
                    theme="text"
                    onClick={(e) => { setShowNewListDialog(true); e.stopPropagation(); }}
                    buttonProps={{
                      id: 'projects-list__add-filtered-list',
                    }}
                  />
                </span>
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
                    tooltip={search.title}
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
              <Tooltip arrow title={<FormattedMessage id="projectsComponent.newSharedFeed" defaultMessage="New shared feed" description="Tooltip for the button that navigates to shared feed creation page" />}>
                <span className={styles.listHeaderLabelButton}>
                  <ButtonMain
                    className="projects-list__add-feed"
                    iconCenter={<AddCircleIcon />}
                    variant="contained"
                    size="small"
                    theme="text"
                    onClick={(e) => { handleCreateFeed(); e.stopPropagation(); }}
                  />
                </span>
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
              {feeds.sort((a, b) => (a?.title?.localeCompare(b.title))).map((feed) => {
                let itemProps = {};
                let itemType = null;
                let itemIcon = null;
                switch (feed.type) {
                // Feeds created by the workspace
                case 'Feed':
                  itemProps = { routePrefix: 'feed' };
                  itemType = 'feed';
                  break;
                // Feeds not created by the workspace, but joined upon invitation
                case 'FeedTeam':
                  itemProps = { routePrefix: 'feed' };
                  itemType = 'feed-team';
                  break;
                // Feed invitations received but not processed yet
                case 'FeedInvitation':
                  itemProps = { routePrefix: 'feed', routeSuffix: '/invitation' };
                  itemType = 'feed-invitation';
                  itemIcon = <ScheduleSendIcon className={cx(styles.listIcon, styles.listIconInvitedFeed)} />;
                  break;
                default:
                  break;
                }
                return (
                  <ProjectsListItem
                    className={cx(
                      {
                        [styles.listItemInvited]: feed.type === 'FeedInvitation',
                      })
                    }
                    key={feed.id}
                    project={feed}
                    teamSlug={team.slug}
                    onClick={handleClick}
                    isActive={isActive(itemType, feed.dbid)}
                    icon={itemIcon}
                    tooltip={feed.type === 'FeedInvitation' ? intl.formatMessage(messages.pendingInvitationFeedTooltip, { feedTitle: feed.title }) : feed.title}
                    {...itemProps}
                  />
                );
              })}
            </>
          }
        </Collapse>
      </List>

      <List dense disablePadding className={[styles.listWrapper, styles.listFooter].join(' ')}>
        {/* Spam */}
        <Link
          onClick={handleSpam}
          to={`/${team.slug}/spam`}
          className={styles.linkList}
        >
          <ListItem
            className={['project-list__link-spam', 'project-list__item-spam', styles.listItem, styles.listItem_containsCount, activeItem.type === 'spam' ? styles.listItem_active : ''].join(' ')}
          >
            <ReportIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.spam" defaultMessage="Spam" description="Label for a list displayed on the left sidebar that includes items that have been trashed" />
            </ListItemText>
            <ListItemSecondaryAction title={team.medias_count} className={styles.listItemCount}>
              <small>{String(team.spam_count)}</small>
            </ListItemSecondaryAction>
          </ListItem>
        </Link>

        {/* Trash */}
        <Link
          onClick={handleTrash}
          to={`/${team.slug}/trash`}
          className={styles.linkList}
        >
          <ListItem
            className={[
              'project-list__link-trash',
              'project-list__item-trash',
              styles.listItem,
              styles.listItem_containsCount,
              activeItem.type === 'trash'
                ? styles.listItem_active
                : '',
            ].join(' ')}
          >
            <DeleteIcon className={styles.listIcon} />
            <ListItemText disableTypography className={styles.listLabel}>
              <FormattedMessage tagName="span" id="projectsComponent.trash" defaultMessage="Trash" description="Label for a list displayed on the left sidebar that includes items marked as spam" />
            </ListItemText>
            <ListItemSecondaryAction title={team.trash_count} className={styles.listItemCount}>
              <small>{String(team.trash_count)}</small>
            </ListItemSecondaryAction>
          </ListItem>
        </Link>
      </List>

      {/* Dialog to create list */}

      <NewProject
        team={team}
        open={showNewListDialog}
        onClose={() => { setShowNewListDialog(false); }}
        title={<FormattedMessage id="projectsComponent.newList" defaultMessage="New list" description="Title for a dialog to create a new list displayed on the left sidebar." />}
        buttonLabel={<FormattedMessage id="projectsComponent.createList" defaultMessage="Create list" description="Label for a button to create a new list displayed on the left sidebar." />}
        helpUrl="https://help.checkmedia.org/en/articles/8720927-custom-lists"
        errorMessage={<FormattedMessage id="projectsComponent.newListErrorMessage" defaultMessage="Could not create list, please try again" description="Error message when creating new list fails" />}
        successMessage={<FormattedMessage id="projectsComponent.newListSuccessMessage" defaultMessage="List created successfully" description="Success message when new list is created" />}
      />
    </React.Fragment>
  );
};

ProjectsComponent.propTypes = {
  currentUser: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"create Media":true}'
    verification_statuses: PropTypes.object.isRequired,
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

export default withSetFlashMessage(withRouter(injectIntl(ProjectsComponent)));
