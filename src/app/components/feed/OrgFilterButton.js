import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ShareIcon from '../../icons/share.svg';
import TeamAvatar from '../team/TeamAvatar';
import styles from './FeedTopBar.module.css';

const OrgFilterButton = ({
  avatar,
  current,
  customListDbid,
  dbid,
  enabled,
  feed,
  name,
  onClick,
  slug,
}) => {
  let message;
  if (!enabled) {
    message = (
      <FormattedMessage
        defaultMessage="Show items from {orgName}"
        description="Tooltip message displayed on button that the user presses in order to show items from an organization."
        id="feedTopBar.showItems"
        values={{
          orgName: name,
        }}
      />
    );
  } else {
    message = (
      <FormattedMessage
        defaultMessage="Hide items from {orgName}"
        description="Tooltip message displayed on button that the user presses in order to hide items from an organization."
        id="feedTopBar.hideItems"
        values={{
          orgName: name,
        }}
      />
    );
  }

  return (
    <div className={styles.feedTopBarItemWrapper}>
      <Tooltip
        arrow
        placement="top"
        title={message}
      >
        <button
          className={cx(
            'feed-top-bar-item',
            'int-feed-top-bar__button--filter-org',
            styles.feedTopBarItem,
            {
              [styles.feedTopBarButton]: enabled,
              [styles.feedTopBarButtonDisabled]: !enabled,
              [styles.feedTopBarButtonHasList]: current && customListDbid,
            })
          }
          onClick={() => onClick(dbid, enabled)}
        >
          <TeamAvatar className={styles.feedListAvatar} size="24px" team={{ avatar, slug }} />
          {
            current && (
              <div className="typography-body2">
                {
                  customListDbid ?
                    <div className={`${styles.feedTopBarList} feed-top-bar-list`}>
                      <span className={styles.feedListTitle}>{feed.current_feed_team?.saved_search?.title || feed.saved_search.title}</span>
                    </div> :
                    <span className={styles.feedNoListTitle}><FormattedMessage defaultMessage="no list selected" description="Message displayed on feed top bar when there is no list associated with the feed." id="feedTopBar.noListSelected" /></span>
                }
              </div>)
          }
        </button>
      </Tooltip>
      { current && customListDbid && (
        <Tooltip
          arrow
          placement="right"
          title={<FormattedMessage
            defaultMessage="Go to custom list"
            description="Tooltip message displayed on button that the user presses in order to navigate to the custom list page."
            id="feedTopBar.customList"
          />}
        >
          <span className={styles.feedTopBarCustomListButton}>
            <ButtonMain
              className={cx(styles.feedListIcon, 'int-feed-top-bar__icon-button--settings')}
              iconCenter={<ShareIcon />}
              size="small"
              theme="lightText"
              variant="contained"
              onClick={() => browserHistory.push(`/${slug}/list/${customListDbid}`)}
            />
          </span>
        </Tooltip>
      )}
    </div>
  );
};

OrgFilterButton.propTypes = {
  avatar: PropTypes.string.isRequired,
  current: PropTypes.bool.isRequired,
  customListDbid: PropTypes.number.isRequired,
  dbid: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
  feed: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default OrgFilterButton;
