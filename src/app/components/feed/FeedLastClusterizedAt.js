import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedDate, FormattedMessage } from 'react-intl';
import ScheduleSendIcon from '../../icons/schedule.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import styles from './FeedLastClusterizedAt.module.css';

const FeedLastClusterizedAt = ({ feed }) => {
  const message = feed.last_clusterized_at ? (
    <FormattedDate
      day="2-digit"
      hour="2-digit"
      minute="2-digit"
      month="short"
      value={feed.last_clusterized_at}
    />
  ) : (
    <FormattedMessage
      defaultMessage="pending initial update"
      description="Informs that the feed is pending initial update"
      id="feedLastClusterizedAt.feedClusterizedTimePendingInitialUpdate"
    />
  );

  return (
    <div className={styles.feedLastClusterizedAtContainer}>
      <span className={styles.feedLastClusterizedAtIconWrapper} >
        <ScheduleSendIcon />
      </span>
      <Tooltip
        arrow
        title={
          <FormattedMessage
            defaultMessage="Shared Feed data is updated hourly. Data is accurate from the date and time noted"
            description="Tooltip message displayed for letting user know when the feed was last updated"
            id="feedLastClusterizedAt.tooltip"
          />
        }
      >
        <span className={styles.feedLastClusterizedAtDashedBorder}>
          {message}
        </span>
      </Tooltip>
    </div>
  );
};

FeedLastClusterizedAt.propTypes = {
  feed: PropTypes.shape({
    last_clusterized_at: PropTypes.string,
  }),
};

FeedLastClusterizedAt.defaultProps = {
  feed: {
    last_clusterized_at: null,
  },
};

// used in unit tests
// eslint-disable-next-line import/no-unused-modules
export { FeedLastClusterizedAt };

export default createFragmentContainer(FeedLastClusterizedAt, {
  feed: graphql`
    fragment FeedLastClusterizedAt_feed on Feed {
      last_clusterized_at
    }
  `,
});
