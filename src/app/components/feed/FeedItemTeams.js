import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import FeedTeamCard from './FeedTeamCard';
import styles from './FeedItem.module.css';

const FeedItemTeams = ({ cluster }) => (
  <div id="feed-item-page-teams" className={styles.feedItemTeams}>
    {cluster.cluster_teams.edges.map(clusterTeam => clusterTeam.node).sort((a, b) => (a.media_count < b.media_count) ? 1 : -1).map(clusterTeam => (
      <div key={clusterTeam.team.name}>
        <FeedTeamCard
          teamName={clusterTeam.team.name}
          teamAvatar={clusterTeam.team.avatar}
          mediaCount={clusterTeam.media_count}
          requestsCount={clusterTeam.requests_count}
          lastRequestDate={clusterTeam.last_request_date && new Date(parseInt(clusterTeam.last_request_date, 10) * 1000)}
        />
      </div>
    ))}
  </div>
);

FeedItemTeams.propTypes = {
  cluster: PropTypes.shape({
    cluster_teams: PropTypes.exact({
      edges: PropTypes.arrayOf(PropTypes.exact({
        node: PropTypes.exact({
          team: PropTypes.exact({
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string.isRequired,
          }).isRequired,
          last_request_date: PropTypes.number,
          media_count: PropTypes.number,
          requests_count: PropTypes.number,
        }),
      }).isRequired).isRequired,
    }).isRequired,
  }).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedItemTeams };

export default createFragmentContainer(FeedItemTeams, graphql`
  fragment FeedItemTeams_cluster on Cluster {
    cluster_teams(first: 100) {
      edges {
        node {
          team {
            name
            avatar
          }
          last_request_date
          media_count
          requests_count
        }
      }
    }
  }
`);
