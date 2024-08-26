/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import FeedTeamCard from './FeedTeamCard';
import FeedItemMedia from './FeedItemMedia';
import styles from './FeedItem.module.css';

const findTeamInCluster = (cluster, teamDbid) => (cluster.cluster_teams?.edges.map(edge => edge.node).find(clusterTeam => clusterTeam.team.dbid === teamDbid));

const FeedItemTeams = ({
  cluster,
  feed,
  team,
}) => {
  const currentClusterTeam = findTeamInCluster(cluster, team.dbid) || {};
  const [selectedTeamDbid, selectTeam] = React.useState(null); // Slug
  const selectedClusterTeam = findTeamInCluster(cluster, selectedTeamDbid);

  return (
    <div className={styles.feedItemColumns}>
      <div className={styles.feedItemColumn} id="feed-item-page-teams">
        <div className={cx('typography-subtitle2', styles.feedItemTeamsTitle)}>
          <FormattedMessage
            defaultMessage="Workspaces [{count}]"
            description="Title of the workspaces box on feed item page"
            id="feedItemTeams.title"
            values={{ count: cluster.cluster_teams?.edges?.length }}
          />
        </div>

        {/* Current Workspace */}
        <div className={styles.feedItemCurrentTeam}>
          <div className={cx('typography-subtitle2', styles.feedItemTeamsSubtitle)}>
            <FormattedMessage
              defaultMessage="Your Workspace"
              description="Title of the Your Workspace box on feed item page"
              id="feedItemTeams.yourWorkspace"
            />
          </div>
          <FeedTeamCard
            clusterTeam={currentClusterTeam}
            feed={feed}
            selected={team.dbid === selectedTeamDbid}
            team={team}
            onClick={selectTeam}
          />
        </div>

        {/* Workspaces part of the cluster (except current one), sorted by number of media items, descending */}
        {cluster.cluster_teams?.edges?.map(edge => edge.node).filter(clusterTeam => clusterTeam?.team.dbid !== team.dbid).sort((a, b) => (a.media_count < b.media_count) ? 1 : -1).map(clusterTeam => (
          <FeedTeamCard
            clusterTeam={clusterTeam}
            feed={feed}
            key={clusterTeam.team.dbid}
            selected={clusterTeam.team.dbid === selectedTeamDbid}
            team={clusterTeam.team}
            onClick={selectTeam}
          />
        ))}
      </div>

      {/* Media from the selected team */}
      <FeedItemMedia clusterTeam={selectedClusterTeam} />
    </div>
  );
};

FeedItemTeams.propTypes = {
  feed: PropTypes.object.isRequired,
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  cluster: PropTypes.shape({
    cluster_teams: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          team: PropTypes.shape({
            dbid: PropTypes.number.isRequired,
          }).isRequired,
          media_count: PropTypes.number,
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
    ...FeedTeamCard_team
  }
  fragment FeedItemTeams_feed on Feed {
    ...FeedTeamCard_feed
  }
  fragment FeedItemTeams_cluster on Cluster {
    cluster_teams(first: 100) {
      edges {
        node {
          team {
            dbid
            ...FeedTeamCard_team
          }
          media_count
          ...FeedTeamCard_clusterTeam
          ...FeedItemMedia_clusterTeam
        }
      }
    }
  }
`);
