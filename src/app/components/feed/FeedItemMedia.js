import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import FeedItemMediaList from './FeedItemMediaList';
import TeamAvatar from '../team/TeamAvatar';
import styles from './FeedItem.module.css';

const FeedItemMedia = ({ clusterTeam }) => (
  <div className={styles.feedItemColumn} id="feed-item-page-media">

    {/* Header */}
    { !clusterTeam &&
      <h5 className={styles.feedContentNotAvailable}>
        <FormattedMessage
          defaultMessage="No workspace selected"
          description="Title for the media section on the feed item page when there is no workspace selected."
          id="feedItemMedia.titleWorkspaceNotSelected"
        />
      </h5>
    }
    { clusterTeam &&
      <div className={styles.feedItemMediaSectionTitle}>
        <TeamAvatar size="54px" team={{ avatar: clusterTeam.team.avatar }} />
        <div className="typography-subtitle2">
          <FormattedMessage
            defaultMessage="Media [{mediaCount}] from requests [{requestsCount}]"
            description="Title for the media section on the feed item page when there is a workspace selected."
            id="feedItemMedia.titleWorkspaceSelected"
            values={{
              mediaCount: clusterTeam.media_count,
              requestsCount: clusterTeam.requests_count,
            }}
          />
        </div>
      </div>
    }

    {/* Media list */}
    { clusterTeam && <FeedItemMediaList teamDbid={clusterTeam.team.dbid} /> }
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
      dbid: PropTypes.number.isRequired,
      avatar: PropTypes.string.isRequired,
    }).isRequired,
  }),
};

export default createFragmentContainer(FeedItemMedia, graphql`
  fragment FeedItemMedia_clusterTeam on ClusterTeam {
    media_count
    requests_count
    team {
      dbid
      avatar
    }
  }
`);
