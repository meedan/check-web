import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import FeedTeamCard from './FeedTeamCard';
import styles from './FeedItem.module.css';

const FeedItemTeams = ({ team, cluster }) => {
  // Create an object that contains the data of the current team and its cluster
  const currentTeamClusterData = cluster.cluster_teams.edges.map(edge => edge.node).find(clusterTeam => clusterTeam.team.dbid === team.dbid) || {};
  const currentTeamCluster = { ...currentTeamClusterData, team };

  return (
    <div id="feed-item-page-teams" className={styles.feedItemTeams}>
      <div className={cx('typography-subtitle2', styles.feedItemTeamsTitle)}>
        <FormattedMessage
          id="feedItemTeams.title"
          defaultMessage="Workspaces [{count}]"
          values={{ count: cluster.cluster_teams.edges.length }}
          description="Title of the workspaces box on feed item page"
        />
      </div>

      {/* Current Workspace */}
      <div className={styles.feedItemCurrentTeam}>
        <div className={cx('typography-subtitle2', styles.feedItemTeamsSubtitle)}>
          <FormattedMessage
            id="feedItemTeams.yourWorkspace"
            defaultMessage="Your Workspace"
            description="Title of the Your Workspace box on feed item page"
          />
        </div>
        <FeedTeamCard
          teamName={currentTeamCluster.team.name}
          teamAvatar={currentTeamCluster.team.avatar}
          mediaCount={currentTeamCluster.media_count}
          requestsCount={currentTeamCluster.requests_count}
          lastRequestDate={currentTeamCluster.last_request_date && new Date(parseInt(currentTeamCluster.last_request_date, 10) * 1000)}
        />
      </div>

      {/* Workspaces part of the cluster (except current one), sorted by number of media items, descending */}
      {cluster.cluster_teams.edges.map(edge => edge.node).filter(clusterTeam => clusterTeam.team.dbid !== team.dbid).sort((a, b) => (a.media_count < b.media_count) ? 1 : -1).map(clusterTeam => (
        <div key={clusterTeam.team.dbid}>
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
};

FeedItemTeams.propTypes = {
  team: PropTypes.exact({
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
  }).isRequired,
  cluster: PropTypes.shape({
    cluster_teams: PropTypes.exact({
      edges: PropTypes.arrayOf(PropTypes.exact({
        node: PropTypes.exact({
          team: PropTypes.exact({
            dbid: PropTypes.number.isRequired,
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
  fragment FeedItemTeams_team on Team {
    dbid
    name
    avatar
  }
  fragment FeedItemTeams_cluster on Cluster {
    cluster_teams(first: 100) {
      edges {
        node {
          team {
            dbid
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
