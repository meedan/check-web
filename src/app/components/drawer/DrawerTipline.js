import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withRouter, Link } from 'react-router';
import cx from 'classnames/bind';
import ProjectsCoreListCounter from './Projects/ProjectsCoreListCounter';
import DrawerCustomLists from './DrawerCustomLists';
import CreateMedia from '../media/CreateMedia';
import BarChartIcon from '../../icons/bar_chart.svg';
import PermMediaIcon from '../../icons/perm_media.svg';
import InboxIcon from '../../icons/inbox.svg';
import LightbulbIcon from '../../icons/lightbulb.svg';
import PersonIcon from '../../icons/person.svg';
import Can from '../Can';
import DeleteIcon from '../../icons/delete.svg';
import ReportIcon from '../../icons/report.svg';
import { withSetFlashMessage } from '../FlashMessage';
import { assignedToMeDefaultQuery } from '../team/AssignedToMe';
import { suggestedMatchesDefaultQuery } from '../team/SuggestedMatches';
import { tiplineInboxDefaultQuery } from '../team/TiplineInbox';
import styles from './Projects/Projects.module.css';

const DrawerTiplineComponent = ({
  currentUser,
  location,
  team,
}) => {
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
          {/* Custom Lists */}
          <DrawerCustomLists
            listType="media"
            routePrefix="list"
            teamSlug={team.slug}
          />
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
    </React.Fragment>
  );
};

DrawerTiplineComponent.propTypes = {
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
            team={props.team}
          />
        );
      }}
      variables={{ teamSlug }}
    />
  );
};


export default withSetFlashMessage(withRouter(injectIntl(DrawerTipline)));
