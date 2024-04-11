import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, defineMessages } from 'react-intl';
import { browserHistory, withRouter } from 'react-router';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import cx from 'classnames/bind';
import ProjectsListItem from './ProjectsListItem';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import AddCircleIcon from '../../../icons/add_circle.svg';
import ExpandLessIcon from '../../../icons/expand_less.svg';
import ExpandMoreIcon from '../../../icons/expand_more.svg';
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
  const [collapsed, setCollapsed] = React.useState(false);
  const getBooleanPref = (key, fallback) => {
    const inStore = window.storage.getValue(key);
    if (inStore === null) return fallback;
    return (inStore === 'true');
  };

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


  const handleCreateFeed = () => {
    browserHistory.push(`/${team.slug}/feed/create`);
  };

  const handleClick = (route, id) => {
    if (route !== activeItem.type || id !== activeItem.id) {
      setActiveItem({ type: route, id });
      if (collapsed) {
        setCollapsed(false);
      }
    }
  };

  const handleToggleFeedsExpand = () => {
    setFeedsExpanded(!feedsExpanded);
    window.storage.set('drawer.feedsExpanded', !feedsExpanded);
  };

  const filteredFeeds = feeds.filter((feed, index, self) => {
    // If there are two feeds with the same dbid, it removes the feed with the FeedInvitation from the displayed list.
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
          defaultMessage="Shared Feeds <sup>BETA</sup>"
          description="The navigation name of the shared feeds section with included Beta messaging"
        />
      </div>
      <div className={styles.listWrapperScrollWrapper}>
        <List dense disablePadding className={styles.listWrapper}>
          {/* Shared feeds */}
          <ListItem onClick={handleToggleFeedsExpand} className={[styles.listHeader, 'project-list__header'].join(' ')}>
            { feedsExpanded ? <ExpandLessIcon className={styles.listChevron} /> : <ExpandMoreIcon className={styles.listChevron} /> }
            <ListItemText disableTypography className={styles.listHeaderLabel}>
              <FormattedMessage
                tagName="span"
                id="projectsComponent.sharedFeeds"
                defaultMessage="Collaborating [{feedsLength}]"
                description="Collaborating is a label to describe the type of shared feeds listed. In this case it means that they are groups of workspaces working together."
                values={{ feedsLength: feeds.length }}
              />
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
          </Collapse>
        </List>
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
