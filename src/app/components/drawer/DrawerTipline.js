import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withRouter, Link } from 'react-router';
import Collapse from '@material-ui/core/Collapse';
import cx from 'classnames/bind';
import ProjectsListItem from './Projects/ProjectsListItem';
import NewProject from './Projects/NewProject';
import ProjectsCoreListCounter from './Projects/ProjectsCoreListCounter';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CreateMedia from '../media/CreateMedia';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import AddIcon from '../../icons/add_filled.svg';
import BarChartIcon from '../../icons/bar_chart.svg';
import PermMediaIcon from '../../icons/perm_media.svg';
import ExpandLessIcon from '../../icons/chevron_down.svg';
import ExpandMoreIcon from '../../icons/chevron_right.svg';
import SharedFeedIcon from '../../icons/dynamic_feed.svg';
import InboxIcon from '../../icons/inbox.svg';
import LightbulbIcon from '../../icons/lightbulb.svg';
import ListIcon from '../../icons/list.svg';
import PersonIcon from '../../icons/person.svg';
import UnmatchedIcon from '../../icons/unmatched.svg';
import Can from '../Can';
import DeleteIcon from '../../icons/delete.svg';
import ReportIcon from '../../icons/report.svg';
import { withSetFlashMessage } from '../FlashMessage';
import { assignedToMeDefaultQuery } from '../team/AssignedToMe';
import { suggestedMatchesDefaultQuery } from '../team/SuggestedMatches';
import { unmatchedMediaDefaultQuery } from '../team/UnmatchedMedia';
import { tiplineInboxDefaultQuery } from '../team/TiplineInbox';
import styles from './Projects/Projects.module.css';

const DrawerTiplineComponent = ({
  currentUser,
  location,
  savedSearches,
  team,
}) => {
  const [showNewListDialog, setShowNewListDialog] = React.useState(false);
  const getBooleanPref = (key, fallback) => {
    const inStore = window.storage.getValue(key);
    if (inStore === null) return fallback;
    return (inStore === 'true');
  };


  const [listsExpanded, setListsExpanded] =
    React.useState(getBooleanPref('drawer.listsExpanded', true));

  // Get/set which list item should be highlighted
  const pathParts = window.location.pathname.split('/');
  const [activeItem, setActiveItem] = React.useState({ type: pathParts[2], id: parseInt(pathParts[3], 10) });
  React.useEffect(() => {
    const path = location.pathname.split('/');
    if (activeItem.type !== path[2] || activeItem.id !== path[3]) {
      setActiveItem({ type: path[2], id: parseInt(path[3], 10) });
    }
  }, [location.pathname]);

  const handleAllItems = () => {
    setActiveItem({ type: 'all-items', id: null });
  };

  const handleSpecialLists = (listId) => {
    setActiveItem({ type: listId, id: null });
  };

  const handleToggleListsExpand = () => {
    setListsExpanded(!listsExpanded);
    window.storage.set('drawer.listsExpanded', !listsExpanded);
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
        <FormattedMessage
          defaultMessage="Tipline"
          description="The navigation name of the tipline section"
          id="projectsComponent.tiplineNavHeader"
        />
      </div>
      <Can permission="create ProjectMedia" permissions={team.permissions}>
        <div className={styles.listMainAction}>
          <CreateMedia />
        </div>
      </Can>
      <div className={styles.listWrapperScrollWrapper}>
        <ul className={cx(styles.listWrapper, 'projects-list')}>
          {/* Dashboard */}
          <Link
            className={styles.linkList}
            to={`/${team.slug}/dashboard`}
            onClick={() => { handleSpecialLists('dashboard'); }}
          >
            <li
              className={cx(
                'projects-list__dashboard',
                styles.listItem,
                styles.listItem_containsCount,
                {
                  [styles.listItem_active]: activeItem.type === 'dashboard',
                })
              }
            >
              <BarChartIcon className={styles.listIcon} />
              <div className={styles.listLabel}>
                <FormattedMessage defaultMessage="Dashboard" description="Label for the dashboard displayed on the left sidebar" id="articlesComponent.dashboard" tagName="span" />
              </div>
            </li>
          </Link>
          {/* All items */}
          <Link
            className={styles.linkList}
            to={`/${team.slug}/all-items`}
            onClick={handleAllItems}
          >
            <li
              className={cx(
                'projects-list__all-items',
                styles.listItem,
                styles.listItem_containsCount,
                {
                  [styles.listItem_active]: activeItem.type === 'all-items',
                })
              }
            >
              <PermMediaIcon className={styles.listIcon} />
              <div className={styles.listLabel}>
                <FormattedMessage defaultMessage="All Media Clusters" description="Label for the 'All media cluster' list displayed on the left sidebar which lists all the clusters of media in the system without applying a filter" id="projectsComponent.allItems" tagName="span" />
              </div>
              <div className={styles.listItemCount} title={team.medias_count}>
                <small>
                  {team.medias_count}
                </small>
              </div>
            </li>
          </Link>
          { /* Assigned to me */}
          <Link
            className={styles.linkList}
            to={`/${team.slug}/assigned-to-me`}
            onClick={() => { handleSpecialLists('assigned-to-me'); }}
          >
            <li
              className={cx(
                'projects-list__assigned-to-me',
                styles.listItem,
                styles.listItem_containsCount,
                {
                  [styles.listItem_active]: activeItem.type === 'assigned-to-me',
                })
              }
            >
              <PersonIcon className={styles.listIcon} />
              <div className={styles.listLabel}>
                <FormattedMessage defaultMessage="Assigned to Me" description="Label for a list displayed on the left sidebar that includes items that are assigned to the current user" id="projectsComponent.assignedToMe" tagName="span" />
              </div>
              <ProjectsCoreListCounter query={{ ...assignedToMeDefaultQuery, assigned_to: [currentUser.dbid] }} />
            </li>
          </Link>
          { team.smooch_bot?.id &&
            <Link
              className={styles.linkList}
              to={`/${team.slug}/tipline-inbox`}
              onClick={() => { handleSpecialLists('tipline-inbox'); }}
            >
              <li
                className={cx(
                  'projects-list__tipline-inbox',
                  styles.listItem,
                  styles.listItem_containsCount,
                  {
                    [styles.listItem_active]: activeItem.type === 'tipline-inbox',
                  })
                }
              >
                <InboxIcon className={styles.listIcon} />
                <div className={styles.listLabel}>
                  <FormattedMessage defaultMessage="Inbox" description="Label for a list displayed on the left sidebar that includes items from is any tip line channel and the item status is unstarted" id="projectsComponent.tiplineInbox" tagName="span" />
                </div>
                <ProjectsCoreListCounter query={{ ...tiplineInboxDefaultQuery, verification_status: [team.verification_statuses.default] }} />
              </li>
            </Link>
          }
          { team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled &&
            <Link
              className={styles.linkList}
              to={`/${team.slug}/suggested-matches`}
              onClick={() => { handleSpecialLists('suggested-matches'); }}
            >
              <li
                className={cx(
                  'projects-list__suggested-matches',
                  styles.listItem,
                  styles.listItem_containsCount,
                  {
                    [styles.listItem_active]: activeItem.type === 'suggested-matches',
                  })
                }
              >
                <LightbulbIcon className={styles.listIcon} />
                <div className={styles.listLabel}>
                  <FormattedMessage defaultMessage="Suggestions" description="Label for a list displayed on the left sidebar that includes items that have a number of suggestions is more than 1" id="projectsComponent.suggestedMatches" tagName="span" />
                </div>
                <ProjectsCoreListCounter query={suggestedMatchesDefaultQuery} />
              </li>
            </Link>
          }

          { team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled &&
            <Link
              className={styles.linkList}
              to={`/${team.slug}/unmatched-media`}
              onClick={() => { handleSpecialLists('unmatched-media'); }}
            >
              <li
                className={cx(
                  'projects-list__unmatched-media',
                  styles.listItem,
                  styles.listItem_containsCount,
                  {
                    [styles.listItem_active]: activeItem.type === 'unmatched-media',
                  })
                }
              >
                <UnmatchedIcon className={styles.listIcon} />
                <div className={styles.listLabel}>
                  <FormattedMessage defaultMessage="Unmatched" description="Label for a list displayed on the left sidebar that includes items that were unmatched from other items (detached or rejected)" id="projectsComponent.unmatchedMedia" tagName="span" />
                </div>
                <ProjectsCoreListCounter query={unmatchedMediaDefaultQuery} />
              </li>
            </Link>
          }

          {/* Lists Header */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
          <li className={cx(styles.listItem, styles.listHeader, styles.listItem_containsCount, 'project-list__header')} onClick={handleToggleListsExpand}>
            { listsExpanded ? <ExpandLessIcon className={styles.listIcon} /> : <ExpandMoreIcon className={styles.listIcon} /> }
            <div className={styles.listLabel}>
              <FormattedMessage defaultMessage="Custom Filtered Lists" description="List of items with some filters applied" id="projectsComponent.lists" tagName="span" />
            </div>
            <Can permission="create Project" permissions={team.permissions}>
              <Tooltip arrow title={<FormattedMessage defaultMessage="New Custom Filtered List" description="Tooltip for button that opens list creation dialog" id="projectsComponent.newListButton" />}>
                <div className={cx(styles.listItemCount, styles.listAddListButton)}>
                  <ButtonMain
                    buttonProps={{
                      id: 'projects-list__add-filtered-list',
                    }}
                    iconCenter={<AddIcon />}
                    size="default"
                    theme="text"
                    variant="text"
                    onClick={(e) => { setShowNewListDialog(true); e.stopPropagation(); }}
                  />
                </div>
              </Tooltip>
            </Can>
          </li>

          {/* Lists */}
          <React.Fragment>
            <Collapse className={styles.listCollapseWrapper} in={listsExpanded}>
              { savedSearches.length === 0 ?
                <li className={cx(styles.listItem, styles.listItem_containsCount, styles.listItem_empty)}>
                  <div className={styles.listLabel}>
                    <span>
                      <FormattedMessage defaultMessage="No custom lists" description="Displayed under the custom list header when there are no lists in it" id="projectsComponent.noCustomLists" tagName="em" />
                    </span>
                  </div>
                </li> :
                <>
                  {savedSearches.sort((a, b) => (a.title.localeCompare(b.title))).map(search => (
                    <ProjectsListItem
                      icon={search.is_part_of_feeds ? <SharedFeedIcon className={`${styles.listIcon} ${styles.listIconFeed}`} /> : <ListIcon className={styles.listIcon} />}
                      isActive={activeItem.type === 'list' && activeItem.id === search.dbid}
                      key={search.id}
                      project={search}
                      routePrefix="list"
                      teamSlug={team.slug}
                      tooltip={search.title}
                    />
                  ))}
                </>
              }
            </Collapse>
          </React.Fragment>
        </ul>
      </div>
      <ul className={cx(styles.listWrapper, styles.listFooter)}>
        {/* Spam */}
        <Link
          className={styles.linkList}
          to={`/${team.slug}/spam`}
          onClick={handleSpam}
        >
          <li
            className={cx(
              'project-list__link-spam',
              'project-list__item-spam',
              styles.listItem,
              styles.listItem_containsCount,
              {
                [styles.listItem_active]: activeItem.type === 'spam',
              })
            }
          >
            <ReportIcon className={styles.listIcon} />
            <div className={styles.listLabel}>
              <FormattedMessage defaultMessage="Spam" description="Label for a list displayed on the left sidebar that includes items that have been trashed" id="projectsComponent.spam" tagName="span" />
            </div>
            <div className={styles.listItemCount} title={team.spam_count}>
              <small>{String(team.spam_count)}</small>
            </div>
          </li>
        </Link>

        {/* Trash */}
        <Link
          className={styles.linkList}
          to={`/${team.slug}/trash`}
          onClick={handleTrash}
        >
          <li
            className={cx(
              'project-list__link-trash',
              'project-list__item-trash',
              styles.listItem,
              styles.listItem_containsCount,
              {
                [styles.listItem_active]: activeItem.type === 'trash',
              })
            }
          >
            <DeleteIcon className={styles.listIcon} />
            <div className={styles.listLabel}>
              <FormattedMessage defaultMessage="Trash" description="Label for a list displayed on the left sidebar that includes items marked as spam" id="projectsComponent.trash" tagName="span" />
            </div>
            <div className={styles.listItemCount} title={team.trash_count}>
              <small>{String(team.trash_count)}</small>
            </div>
          </li>
        </Link>
      </ul>

      {/* Dialog to create list */}

      <NewProject
        buttonLabel={<FormattedMessage defaultMessage="Create List" description="Label for a button to create a new list displayed on the left sidebar." id="projectsComponent.createList" />}
        errorMessage={<FormattedMessage defaultMessage="Could not create list, please try again" description="Error message when creating new list fails" id="projectsComponent.newListErrorMessage" />}
        open={showNewListDialog}
        successMessage={<FormattedMessage defaultMessage="Filtered List created successfully" description="Success message when new list is created" id="projectsComponent.newListSuccessMessage" />}
        team={team}
        title={<FormattedMessage defaultMessage="New Custom Filtered List" description="Title for a dialog to create a new list displayed on the left sidebar." id="projectsComponent.newList" />}
        onClose={() => { setShowNewListDialog(false); }}
      />
    </React.Fragment>
  );
};

DrawerTiplineComponent.propTypes = {
  currentUser: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  savedSearches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"create Media":true}'
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
};


const DrawerTipline = () => {
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query DrawerTiplineQuery($teamSlug: String!) {
          me {
            id
            dbid
          }
          team(slug: $teamSlug) {
            dbid
            slug
            permissions
            medias_count
            verification_statuses
            alegre_bot: team_bot_installation(bot_identifier: "alegre") {
              id
              alegre_settings
            }
            smooch_bot: team_bot_installation(bot_identifier: "smooch") {
              id
            }
            saved_searches(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  is_part_of_feeds
                  medias_count: items_count
                }
              }
            }
            trash_count
            spam_count
          }
        }
      `}
      render={({ error, props }) => {
        if (!props || error) return null;

        const { location } = window;

        return (
          <DrawerTiplineComponent
            currentUser={props.me}
            location={location}
            savedSearches={props.team.saved_searches.edges.map(ss => ss.node)}
            team={props.team}
          />
        );
      }}
      variables={{ teamSlug }}
    />
  );
};


export default withSetFlashMessage(withRouter(injectIntl(DrawerTipline)));
