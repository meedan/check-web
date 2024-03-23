import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import TeamAvatar from '../team/TeamAvatar';
import styles from './FeedItem.module.css';

const FeedItemMedia = ({ clusterTeam }) => (
  <div id="feed-item-page-media" className={styles.feedItemColumn}>

    {/* Header */}
    { !clusterTeam ?
      <h5 className={styles.feedContentNotAvailable}>
        <FormattedMessage
          id="feedItemMedia.titleWorkspaceNotSelected"
          defaultMessage="No workspace selected"
          description="Title for the media section on the feed item page when there is no workspace selected."
        />
      </h5> :
      null
    }
    { clusterTeam ?
      <div className={styles.feedItemMediaSectionTitle}>
        <TeamAvatar team={{ avatar: clusterTeam.team.avatar }} size="54px" />
        <div className="typography-subtitle2">
          <FormattedMessage
            id="feedItemMedia.titleWorkspaceSelected"
            defaultMessage="Media [{mediaCount}] from requests [{requestsCount}]"
            description="Title for the media section on the feed item page when there is a workspace selected."
            values={{
              mediaCount: clusterTeam.media_count,
              requestsCount: clusterTeam.requests_count,
            }}
          />
        </div>
      </div> :
      null
    }

    {/* Media list */}
  </div>
);

FeedItemMedia.defaultProps = {
  clusterTeam: null, // Object
};

FeedItemMedia.propTypes = {
  clusterTeam: PropTypes.shape({
    media_count: PropTypes.number,
    requests_count: PropTypes.number,
    team: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
    }).isRequired,
  }),
};

export default createFragmentContainer(FeedItemMedia, graphql`
  fragment FeedItemMedia_clusterTeam on ClusterTeam {
    media_count
    requests_count
    team {
      avatar
    }
  }
`);
