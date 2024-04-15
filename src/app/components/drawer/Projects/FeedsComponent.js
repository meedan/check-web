import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, defineMessages } from 'react-intl';
import { browserHistory, withRouter } from 'react-router';
import cx from 'classnames/bind';
import ProjectsListItem from './ProjectsListItem';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../../icons/add.svg';
import Can from '../../Can';
import ScheduleSendIcon from '../../../icons/schedule_send.svg';
import { withSetFlashMessage } from '../../FlashMessage';
import styles from './Projects.module.css';

const messages = defineMessages({
  pendingInvitationFeedTooltip: {
    id: 'projectsComponent.pendingInvitationFeedTitle',
    defaultMessage: 'Pending invitation: {feedTitle}',
    description: 'Tooltip for a navigation item that has a status of a pending invitation',
  },
});

const FeedsComponent = ({
  team,
  feeds,
  location,
  intl,
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
          id="projectsComponent.sharedFeedNavHeader"
          defaultMessage="Shared Feeds [{feedsLength}] <sup>BETA</sup>"
          description="The navigation name of the shared feeds section with included Beta messaging"
          values={{ feedsLength: feeds.length }}
        />
      </div>
      <Can permissions={team.permissions} permission="create Feed">
        <div className={styles.listMainAction}>
          <ButtonMain
            className="projects-list__add-feed"
            label={
              <FormattedHTMLMessage
                id="projectsComponent.newSharedFeed"
                defaultMessage="New Shared Feed"
                description="Label for the button that navigates to shared feed creation page"
              />
            }
            iconLeft={<AddIcon />}
            variant="contained"
            size="default"
            theme="text"
            onClick={(e) => { handleCreateFeed(); e.stopPropagation(); }}
          />
        </div>
      </Can>
      <div className={styles.listWrapperScrollWrapper}>
        <ul className={styles.listWrapper}>
          { feeds.length === 0 ?
            <li className={cx(styles.listItem, styles.listItem_empty)}>
              <div className={styles.listLabel}>
                <FormattedMessage tagName="em" id="projectsComponent.noSharedFeeds" defaultMessage="No shared feeds" description="Displayed under the shared feed header when there are no feeds in it" />
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
                    key={feed.id}
                    project={feed}
                    teamSlug={team.slug}
                    onClick={handleClick}
                    isActive={isActive('feed', feed.dbid)}
                    icon={itemIcon}
                    tooltip={feed.type === 'FeedInvitation' ? intl.formatMessage(messages.pendingInvitationFeedTooltip, { feedTitle: feed.title }) : feed.title}
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

FeedsComponent.propTypes = {
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"create Media":true}'
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
  feeds: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired).isRequired,
};

export default withSetFlashMessage(withRouter(injectIntl(FeedsComponent)));
