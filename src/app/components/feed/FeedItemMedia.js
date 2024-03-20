import React from 'react';
import { FormattedMessage } from 'react-intl';
import styles from './FeedItem.module.css';

const FeedItemMedia = () => (
  <div id="feed-item-page-media" className={styles.feedItemColumn}>
    <h5 className={styles.feedContentNotAvailable}>
      <FormattedMessage
        id="feedItemMedia.workspaceNotSelected"
        defaultMessage="No workspace selected"
        description="Title for the media section on the feed item page when there is no workspace selected."
      />
    </h5>
  </div>
);

FeedItemMedia.propTypes = {
};

export default FeedItemMedia;
