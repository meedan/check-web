import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, defineMessages } from 'react-intl';
import { browserHistory, withRouter } from 'react-router';
import cx from 'classnames/bind';
import ProjectsListItem from './Projects/ProjectsListItem';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../icons/add.svg';
import Can from '../Can';
import ScheduleSendIcon from '../../icons/schedule_send.svg';
import { withSetFlashMessage } from '../FlashMessage';
import styles from './Projects/Projects.module.css';

const messages = defineMessages({
  pendingInvitationFeedTooltip: {
    id: 'projectsComponent.pendingInvitationFeedTitle',
    defaultMessage: 'Pending invitation: {feedTitle}',
    description: 'Tooltip for a navigation item that has a status of a pending invitation',
  },
});

const DrawerFeedsComponent = ({
  feeds,
  intl,
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
  const isActive = (type, id) => type === activeItem.type && id === activeItem.id;


  const handleCreateFeed = () => {
    browserHistory.push(`/${team.slug}/feed/create`);
  };

  const handleClick = (route, id) => {
    if (route !== activeItem.type || id !== activeItem.id) {
      setActiveItem({ type: route, id });
    }
  };

  const filteredFeeds = feeds.filter((feed, index, self) => {
    // If there are two feeds with the same dbid, it removes the feed with the "FeedInvitation" type from the displayed list.
    if (feed.type === 'FeedInvitation') {
      return !self.some((otherFeed, otherIndex) =>
        otherFeed.dbid === feed.dbid && otherIndex !== index,
      );
    }
    return true;
  });

  return (
    <React.Fragment>
      <div className={styles.listTitle}>
        <FormattedHTMLMessage
          defaultMessage="Shared Feeds [{feedsLength}] <sup>BETA</sup>"
          description="The navigation name of the shared feeds section with included Beta messaging and the total count of items in the list below"
          id="projectsComponent.sharedFeedNavHeader"
          values={{ feedsLength: feeds.length }}
        />
      </div>
      <Can permission="create Feed" permissions={team.permissions}>
        <div className={styles.listMainAction}>
          <ButtonMain
            className="projects-list__add-feed"
            iconLeft={<AddIcon />}
            label={
              <FormattedMessage
                defaultMessage="New Shared Feed"
                description="Label for the button that navigates to shared feed creation page"
                id="projectsComponent.newSharedFeed"
              />
            }
            size="default"
            theme="lightBeige"
            variant="contained"
            onClick={(e) => { handleCreateFeed(); e.stopPropagation(); }}
          />
        </div>
      </Can>
      <div className={styles.listWrapperScrollWrapper}>
        <ul className={styles.listWrapper}>
          { feeds.length === 0 ?
            <li className={cx(styles.listItem, styles.listItem_empty)}>
              <div className={styles.listLabel}>
                <FormattedMessage defaultMessage="No shared feeds" description="Displayed under the shared feed header when there are no feeds in it" id="projectsComponent.noSharedFeeds" tagName="em" />
              </div>
            </li> :
            <>
              {filteredFeeds.sort((a, b) => (a?.title?.localeCompare(b.title))).map((feed) => {
                let itemProps = {};
                let itemIcon = null;
                switch (feed.type) {
                // Feeds created by the workspace
                case 'Feed':
                  itemProps = { routePrefix: 'feed' };
                  break;
                // Feeds not created by the workspace, but joined upon invitation
                case 'FeedTeam':
                  itemProps = { routePrefix: 'feed' };
                  break;
                // Feed invitations received but not processed yet
                case 'FeedInvitation':
                  itemProps = { routePrefix: 'feed', routeSuffix: '/invitation' };
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
                    icon={itemIcon}
                    isActive={isActive('feed', feed.dbid)}
                    key={feed.id}
                    project={feed}
                    teamSlug={team.slug}
                    tooltip={feed.type === 'FeedInvitation' ? intl.formatMessage(messages.pendingInvitationFeedTooltip, { feedTitle: feed.title }) : feed.title}
                    onClick={handleClick}
                    {...itemProps}
                  />
                );
              })}
            </>
          }
        </ul>
      </div>
    </React.Fragment>
  );
};

DrawerFeedsComponent.propTypes = {
  feeds: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  location: PropTypes.object.isRequired,
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"create Media":true}'
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
};

const DrawerFeeds = ({ intl, params }) => {
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query DrawerFeedsQuery($teamSlug: String!) {
          me {
              id
              dbid
              feed_invitations(first: 10000) {
                edges {
                  node {
                    id
                    dbid
                    state
                    feed_id
                    feed {
                      name
                    }
                    type: __typename
                  }
                }
              }
            }
          team(slug: $teamSlug) {
              dbid
              slug
              permissions
              feeds(first: 10000) {
                edges {
                  node {
                    id
                    dbid
                    name
                    team_id
                    type: __typename
                  }
                }
              }
              feed_teams(first: 10000) {
                edges {
                  node {
                    id
                    dbid
                    feed_id
                    feed {
                      name
                    }
                    type: __typename
                  }
                }
              }
            }
          }
      `}
      render={({ error, props }) => {
        if (!props || error) return null;

        const feedsCreated = props.team.feeds?.edges.map(f => f.node).filter(f => f.team_id === props.team.dbid);
        const feedsJoined = props.team.feed_teams?.edges.map(ft => ft.node).filter(ft => !feedsCreated?.find(f => f.dbid === ft.feed_id));
        const feedsInvited = props.me.feed_invitations?.edges.map(f => f.node).filter(fi => fi.state === 'invited');
        const feeds = [].concat(feedsCreated, feedsJoined, feedsInvited);
        const { location } = window;

        return (<DrawerFeedsComponent
          feeds={feeds.map(f => ({ ...f, title: (f.name || f.feed?.name), dbid: (f.feed_id || f.dbid) }))}
          intl={intl}
          location={location}
          params={params}
          team={props.team}
        />);
      }}
      variables={{ teamSlug }}
    />
  );
};

export default withSetFlashMessage(withRouter(injectIntl(DrawerFeeds)));
