import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import TimeBefore from '../TimeBefore';
import BulletSeparator from '../layout/BulletSeparator';
import { parseStringUnixTimestamp } from '../../helpers';
import RssFeedIcon from '../../icons/rss_feed.svg';
import styles from './SaveFeed.module.css';

const FeedMetadata = ({ feed }) => feed.dbid ? (
  <div className={styles.saveFeedMetadata}>
    <BulletSeparator
      compact
      details={[
        <FormattedMessage
          defaultMessage="Created by {teamName}"
          description="Metadata field displayed on feed edit page."
          id="saveFeed.createdBy"
          values={{ teamName: feed.team?.name }}
        />,
        <span>{feed.user?.email}</span>,
        <FormattedDate day="numeric" month="long" value={parseInt(feed.created_at, 10) * 1000} year="numeric" />,
      ]}
    />
    <div className={styles.saveFeedLastUpdated}>
      <RssFeedIcon />
      <FormattedMessage
        defaultMessage="Settings last updated {timeAgo}"
        description="On feed edit page, show the last time the feed settings were changed. The placeholder 'timeAgo' is something like '10 minutes ago'."
        id="saveFeed.lastUpdated"
        values={{
          timeAgo: <TimeBefore date={parseStringUnixTimestamp(feed.updated_at)} />,
        }}
      />
    </div>
  </div>
) : null;

export default createFragmentContainer(FeedMetadata, graphql`
  fragment FeedMetadata_feed on Feed {
    dbid
    created_at
    updated_at
    team {
      name
    }
    user {
      email
    }
  }
`);
