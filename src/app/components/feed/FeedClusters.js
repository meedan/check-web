/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import FeedHeader from './FeedHeader';
import FeedLastClusterizedAt from './FeedLastClusterizedAt';
import FeedTopBar from './FeedTopBar';
import FeedBlankState from './FeedBlankState';
import FeedFilters from './FeedFilters';
import ClusterCard from '../search/SearchResultsCards/ClusterCard';
import ExportList from '../ExportList';
import Paginator from '../cds/inputs/Paginator';
import SharedFeedIcon from '../../icons/dynamic_feed.svg';
import NextIcon from '../../icons/chevron_right.svg';
import CheckChannels from '../../CheckChannels';
import Loader from '../cds/loading/Loader';
import searchStyles from '../search/search.module.css';
import searchResultsStyles from '../search/SearchResults.module.css';

const pageSize = 50;

const setFiltersForQuery = (otherFilters) => {
  const filters = {};
  if (otherFilters.channels) {
    filters.channels = otherFilters.channels.map(channel => parseInt(channel, 10));
  }
  if (otherFilters.show) {
    filters.media_type = otherFilters.show;
  }
  if (otherFilters.range?.request_created_at) {
    filters.last_request_date = JSON.stringify(otherFilters.range.request_created_at);
  }
  if (otherFilters.linked_items_count) {
    filters.medias_count_min = otherFilters.linked_items_count.min;
    filters.medias_count_max = otherFilters.linked_items_count.max;
  }
  if (otherFilters.demand) {
    filters.requests_count_min = otherFilters.demand.min;
    filters.requests_count_max = otherFilters.demand.max;
  }
  return filters;
};

const FeedClustersComponent = ({
  feed,
  feedTeam,
  onChangeSearchParams,
  otherFilters,
  page,
  sort,
  sortType,
  team,
  teamFilters,
}) => {
  const clusters = feed.clusters.edges.map(edge => edge.node);

  const handleChangeSort = ({ sort: newSort, sortType: newSortType }) => {
    onChangeSearchParams({
      page: 1,
      sort: newSort,
      sortType: newSortType,
    });
  };

  const handleChangePage = (newPage) => {
    onChangeSearchParams({ page: newPage });
  };

  const handleChangeTeamFilters = (newTeamFilters) => {
    onChangeSearchParams({
      page: 1,
      teamFilters: newTeamFilters,
    });
  };

  const handleChangeFilters = (newFilters) => {
    onChangeSearchParams({
      otherFilters: newFilters,
      page: 1,
    });
  };

  return (
    <React.Fragment>
      <div className={searchResultsStyles['search-results-header']}>
        <div className={searchResultsStyles.searchResultsTitleWrapper}>
          <div className={searchResultsStyles.searchHeaderSubtitle}>
            <FormattedMessage defaultMessage="Shared Feed" description="Generic Label for the shared feed feature which is a collection of check work spaces contributing content to one place" id="global.sharedFeed" />
            <NextIcon />
            <FeedLastClusterizedAt feed={feed} />
          </div>
          <div className={searchResultsStyles.searchHeaderTitle}>
            <h6>
              <SharedFeedIcon />
              {feed.name}
            </h6>
            <div className={searchResultsStyles.searchHeaderActions}>
              <FeedHeader feed={feed} feedTeam={feedTeam} />
            </div>
          </div>
        </div>
      </div>
      <div className={searchResultsStyles['search-results-top']}>
        <FeedTopBar
          feed={feed}
          setTeamFilters={handleChangeTeamFilters}
          team={team}
          teamFilters={teamFilters}
        />
        <FeedFilters
          className={searchStyles['filters-wrapper']}
          currentFilters={otherFilters}
          disableSave
          feed={feed}
          feedTeam={{ id: feedTeam.id }}
          filterOptions={['channels', 'range', 'linked_items_count', 'show', 'demand']}
          sort={sort}
          sortType={sortType}
          onChangeSort={handleChangeSort}
          onSubmit={handleChangeFilters}
        />
      </div>
      <div className={searchResultsStyles['search-results-wrapper']}>
        { clusters.length > 0 ?
          <div className={searchResultsStyles['search-results-toolbar']}>
            <div />
            <div className={searchResultsStyles['search-actions']}>
              <Paginator
                numberOfPageResults={clusters.length}
                numberOfTotalResults={feed.clusters_count}
                page={page}
                pageSize={pageSize}
                onChangePage={handleChangePage}
              />
              <ExportList filters={{ feed_id: feed.dbid, team_ids: teamFilters, ...setFiltersForQuery(otherFilters) }} type="feed" />
            </div>
          </div>
          : null
        }

        { clusters.length === 0 ?
          <FeedBlankState
            feedDbid={feed.dbid}
            listDbid={feedTeam.saved_search_id || feed.saved_search_id}
            teamSlug={team.slug}
          />
          : null
        }

        <div className={searchResultsStyles['search-results-scroller']}>
          {clusters.map((cluster) => {
            const { media } = cluster.center;
            const channels = cluster.channels.filter(channel => Object.values(CheckChannels.TIPLINE).includes(channel.toString()));

            return (
              <div className="feed-clusters__card" key={cluster.id}>
                <ClusterCard
                  cardUrl={`/${team.slug}/feed/${feed.dbid}/item/${cluster.center.dbid}`}
                  channels={channels.length > 0 && { main: channels[0], others: channels }}
                  dataPoints={feed.data_points}
                  date={cluster.last_fact_check_date && new Date(parseInt(cluster.last_fact_check_date, 10) * 1000)}
                  description={cluster.center.description}
                  factCheckCount={cluster.fact_checks_count}
                  lastRequestDate={cluster.last_request_date && new Date(parseInt(cluster.last_request_date, 10) * 1000)}
                  mediaCount={cluster.media_count}
                  mediaThumbnail={{ media: { url: media.url, picture: media.picture, type: media.type } }}
                  requestsCount={cluster.requests_count}
                  title={
                    cluster.title ||
                    cluster.center.title ||
                    cluster.center.media_slug ||
                    <FormattedMessage defaultMessage="(no title)" description="No title available" id="feedClusters.noTitle" />
                  }
                  workspaces={cluster.teams.edges.map(edge => ({ name: edge.node.name, url: edge.node.avatar }))}
                />
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

FeedClustersComponent.defaultProps = {
  page: 1,
  sort: 'requests_count',
  sortType: 'DESC',
  otherFilters: {},
};

FeedClustersComponent.propTypes = {
  page: PropTypes.number,
  sort: PropTypes.oneOf(['title', 'media_count', 'requests_count', 'fact_checks_count', 'last_request_date']),
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  teamFilters: PropTypes.arrayOf(PropTypes.number).isRequired, // Array of team DBIDs
  otherFilters: PropTypes.object,
  onChangeSearchParams: PropTypes.func.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
  }).isRequired,
  feedTeam: PropTypes.shape({
    team_id: PropTypes.number.isRequired,
    saved_search_id: PropTypes.number,
    permissions: PropTypes.string.isRequired, // e.g., '{"update FeedTeam":true}'
  }).isRequired,
  feed: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    licenses: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"update Feed":true}'
    data_points: PropTypes.arrayOf(PropTypes.number).isRequired,
    saved_search_id: PropTypes.number,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
    clusters: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          id: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
          channels: PropTypes.arrayOf(PropTypes.number),
          last_request_date: PropTypes.number,
          last_fact_check_date: PropTypes.number,
          media_count: PropTypes.number.isRequired,
          requests_count: PropTypes.number.isRequired,
          fact_checks_count: PropTypes.number.isRequired,
          center: PropTypes.shape({
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            media: PropTypes.shape({
              url: PropTypes.string,
              type: PropTypes.string.isRequired,
              picture: PropTypes.string,
            }),
          }).isRequired,
          teams: PropTypes.shape({
            edges: PropTypes.arrayOf(PropTypes.shape({
              node: PropTypes.shape({
                name: PropTypes.string.isRequired,
                avatar: PropTypes.string.isRequired,
              }).isRequired,
            })).isRequired,
          }).isRequired,
        }).isRequired,
      })).isRequired,
    }),
  }).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedClustersComponent };

const FeedClusters = ({ feedId, teamSlug }) => {
  const [searchParams, setSearchParams] = React.useState({
    page: 1,
    sort: 'requests_count',
    sortType: 'DESC',
    teamFilters: null,
    otherFilters: {},
  });
  const {
    otherFilters,
    page,
    sort,
    sortType,
    teamFilters,
  } = searchParams;

  const handleChangeSearchParams = (newSearchParams) => { // { page, sort, sortType, teamFilters, ...otherFilters } - a single state for a single query/render
    setSearchParams(Object.assign({}, searchParams, newSearchParams));
  };

  // Set filters for the query
  const filters = setFiltersForQuery(otherFilters);

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedClustersQuery($slug: String!, $feedId: Int!, $pageSize: Int!, $offset: Int!, $sort: String, $sortType: String, $teamFilters: [Int], $channels: [Int],
                                $media_type: [String], $last_request_date: String, $medias_count_min: Int, $medias_count_max: Int, $requests_count_min: Int, $requests_count_max: Int) {
          team(slug: $slug) {
            slug
            ...FeedTopBar_team
            feed(dbid: $feedId) {
              dbid
              name
              data_points
              saved_search_id
              current_feed_team {
                id
                saved_search_id
                ...FeedHeader_feedTeam
              }
              teams(first: 1000) {
                edges {
                  node {
                    dbid
                  }
                }
              }
              clusters_count(team_ids: $teamFilters, channels: $channels, media_type: $media_type, last_request_date: $last_request_date,
                             medias_count_min: $medias_count_min, medias_count_max: $medias_count_max, requests_count_min: $requests_count_min, requests_count_max: $requests_count_max)
              clusters(first: $pageSize, offset: $offset, sort: $sort, sort_type: $sortType, team_ids: $teamFilters, channels: $channels, media_type: $media_type, last_request_date: $last_request_date,
                       medias_count_min: $medias_count_min, medias_count_max: $medias_count_max, requests_count_min: $requests_count_min, requests_count_max: $requests_count_max) {
                edges {
                  node {
                    id
                    title
                    channels
                    last_request_date
                    last_fact_check_date
                    media_count
                    requests_count
                    fact_checks_count
                    center {
                      dbid
                      title
                      description
                      media_slug
                      media {
                        url
                        type
                        picture
                      }
                    }
                    teams(first: 100) {
                      edges {
                        node {
                          name
                          avatar
                        }
                      }
                    }
                  }
                }
              }
              ...FeedHeader_feed
              ...FeedLastClusterizedAt_feed
              ...FeedTopBar_feed
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <FeedClustersComponent
              feed={props.team.feed}
              feedTeam={props.team.feed.current_feed_team}
              otherFilters={otherFilters}
              page={page}
              sort={sort}
              sortType={sortType}
              team={props.team}
              teamFilters={teamFilters || props.team.feed.teams.edges.map(team => team.node.dbid)}
              onChangeSearchParams={handleChangeSearchParams}
            />
          );
        }
        return <Loader size="large" theme="white" variant="page" />;
      }}
      variables={{
        slug: teamSlug,
        feedId,
        pageSize,
        sort,
        sortType,
        offset: pageSize * (page - 1),
        teamFilters,
        ...filters,
      }}
    />
  );
};

FeedClusters.defaultProps = {};

FeedClusters.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  feedId: PropTypes.number.isRequired,
};

export default FeedClusters;
