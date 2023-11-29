import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import styles from './SaveFeed.module.css';
import TimeBefore from '../TimeBefore';
import BulletSeparator from '../layout/BulletSeparator';
import { parseStringUnixTimestamp } from '../../helpers';
import RssFeedIcon from '../../icons/rss_feed.svg';

const FeedMetadata = ({ feed }) => feed.dbid ? (
  <div className={styles.saveFeedMetadata}>
    <BulletSeparator
      compact
      details={[
        <FormattedMessage
          id="saveFeed.createdBy"
          defaultMessage="Created by {teamName}"
          values={{ teamName: feed.team?.name }}
          description="Metadata field displayed on feed edit page."
        />,
        <span>{feed.user?.email}</span>,
        <FormattedDate value={parseInt(feed.created_at, 10) * 1000} year="numeric" month="long" day="numeric" />,
      ]}
    />
    <div className={styles.saveFeedLastUpdated}>
      <RssFeedIcon />
      <FormattedMessage
        id="saveFeed.lastUpdated"
        defaultMessage="Last updated {timeAgo}"
        values={{
          timeAgo: <TimeBefore date={parseStringUnixTimestamp(feed.updated_at)} />,
        }}
        description="On feed edit page, show the last time the feed was changed. The placeholder 'timeAgo' is something like '10 minutes ago'."
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
