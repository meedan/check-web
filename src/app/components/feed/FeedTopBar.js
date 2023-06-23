import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import IconButton from '@material-ui/core/IconButton';
import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined';
import TeamAvatar from '../team/TeamAvatar';
import Can from '../Can';
import styles from './FeedTopBar.module.css';

const FeedTopBar = ({ team, feed }) => {
  const hasList = Boolean(feed.saved_search);

  const handleClick = () => {
    browserHistory.push(`/${team.slug}/list/${feed.saved_search.dbid}`);
  };

  if (!feed.published) {
    return null;
  }

  return (
    <div className={styles.feedTopBar}>
      <TeamAvatar team={{ avatar: team.avatar, slug: team.slug }} size="24px" />
      <div className="typography-body2">
        {
          hasList ?
            <div>
              <span className={styles.feedListTitle}>{feed.saved_search.title}</span>
              <Can permissions={feed.permissions} permission="update Feed">
                <IconButton size="small" onClick={handleClick} className={styles.feedListIcon}><ShareOutlinedIcon style={{ fontSize: 12 }} /></IconButton>
              </Can>
            </div> :
            <span className={styles.feedNoListTitle}><FormattedMessage id="feedTopBar.noListSelected" defaultMessage="no list selected" description="Message displayed on feed top bar when there is no list associated with the feed." /></span>
        }
      </div>
    </div>
  );
};

FeedTopBar.defaultProps = {};

FeedTopBar.propTypes = {
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  }).isRequired,
  feed: PropTypes.shape({
    permissions: PropTypes.string.isRequired, // e.g., '{"update Feed":true}'
    saved_search: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default createFragmentContainer(FeedTopBar, graphql`
  fragment FeedTopBar_team on Team {
    slug
    avatar
  }
  fragment FeedTopBar_feed on Feed {
    published
    permissions
    saved_search {
      dbid
      title
    }
  }
`);
