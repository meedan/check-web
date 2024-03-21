import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styles from './FeedItem.module.css';

const FeedItemMedia = ({ selectedTeam }) => (
  <div id="feed-item-page-media" className={styles.feedItemColumn}>
    { !selectedTeam ?
      <h5 className={styles.feedContentNotAvailable}>
        <FormattedMessage
          id="feedItemMedia.workspaceNotSelected"
          defaultMessage="No workspace selected"
          description="Title for the media section on the feed item page when there is no workspace selected."
        />
      </h5> :
      null
    }
    { selectedTeam ?
      <p>{selectedTeam}</p> :
      null
    }
  </div>
);

FeedItemMedia.defaultProps = {
  selectedTeam: null, // Slug
};

FeedItemMedia.propTypes = {
  selectedTeam: PropTypes.string, // Slug
};

export default FeedItemMedia;
