import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ShareIcon from '../../icons/share.svg';
import TeamAvatar from '../team/TeamAvatar';
import styles from './FeedTopBar.module.css';

const OrgFilterButton = ({
  current,
  enabled,
  onClick,
  savedSearch,
  team,
}) => {
  const {
    avatar, dbid, name, slug,
  } = team;

  const message = enabled ? (
    <FormattedMessage
      defaultMessage="Hide items from {orgName}"
      description="Tooltip message displayed on button that the user presses in order to hide items from an organization."
      id="feedTopBar.hideItems"
      values={{ orgName: name }}
    />
  ) : (
    <FormattedMessage
      defaultMessage="Show items from {orgName}"
      description="Tooltip message displayed on button that the user presses in order to show items from an organization."
      id="feedTopBar.showItems"
      values={{ orgName: name }}
    />
  );

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
              [styles.feedTopBarButtonHasList]: current && savedSearch?.dbid,
            })
          }
          onClick={() => onClick(dbid, enabled)}
        >
          <TeamAvatar className={styles.feedListAvatar} size="24px" team={{ avatar, slug }} />
          {
            current && (
              <div className="typography-body2">
                {
                  savedSearch?.dbid ?
                    <div className={`${styles.feedTopBarList} feed-top-bar-list`}>
                      <span className={styles.feedListTitle}>{savedSearch?.title}</span>
                    </div> :
                    <span className={styles.feedNoListTitle}><FormattedMessage defaultMessage="no list selected" description="Message displayed on feed top bar when there is no list associated with the feed." id="feedTopBar.noListSelected" /></span>
                }
              </div>)
          }
        </button>
      </Tooltip>
      { current && savedSearch?.dbid && (
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
              onClick={() => browserHistory.push(`/${slug}/list/${savedSearch.dbid}`)}
            />
          </span>
        </Tooltip>
      )}
    </div>
  );
};

OrgFilterButton.defaultProps = {
  savedSearch: null,
};

OrgFilterButton.propTypes = {
  current: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  savedSearch: PropTypes.shape({
    dbid: PropTypes.number,
    title: PropTypes.string,
  }),
  onClick: PropTypes.func.isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { OrgFilterButton };

export default createFragmentContainer(OrgFilterButton, graphql`
  fragment OrgFilterButton_team on PublicTeam {
    avatar
    dbid
    name
    slug
  }
  fragment OrgFilterButton_savedSearch on SavedSearch {
    dbid
    title
  }
`);
