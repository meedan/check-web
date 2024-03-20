import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import SharedItemCard from '../search/SearchResultsCards/SharedItemCard';
import searchResultsStyles from '../search/SearchResults.module.css';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ListSort from '../cds/inputs/ListSort';
import NextIcon from '../../icons/chevron_right.svg';
import PrevIcon from '../../icons/chevron_left.svg';
import CheckChannels from '../../CheckChannels';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import FeedHeader from './FeedHeader';
import FeedLastClusterizedAt from './FeedLastClusterizedAt';
import FeedTopBar from './FeedTopBar';
import FeedBlankState from './FeedBlankState';
import FeedFilters from './FeedFilters';
import styles from './FeedClusters.module.css';
import MediasLoading from '../media/MediasLoading';

const pageSize = 50;

const messages = defineMessages({
  sortTitle: {
    id: 'searchResults.sortTitle',
    defaultMessage: 'Title',
    description: 'Label for sort criteria option displayed in a drop-down in the feed page.',
  },
  sortFactChecksCount: {
    id: 'searchResults.sortFactChecksCount',
    defaultMessage: 'Fact-checks (count)',
    description: 'Label for sort criteria option displayed in a drop-down in the feed page.',
  },
  sortRequestsCount: {
    id: 'searchResults.sortRequestsCount',
    defaultMessage: 'Requests (count)',
    description: 'Label for sort criteria option displayed in a drop-down in the feed page.',
  },
  sortMediaCount: {
    id: 'searchResults.sortMediaCount',
    defaultMessage: 'Media (count)',
    description: 'Label for sort criteria option displayed in a drop-down in the feed page.',
  },
  sortLastRequestDate: {
    id: 'searchResults.sortLastRequestDate',
    defaultMessage: 'Date updated',
    description: 'Label for sort criteria option displayed in a drop-down in the feed page.',
  },
});

const FeedClustersComponent = ({
  team,
  feed,
  feedTeam,
  page,
  sort,
  sortType,
  teamFilters,
  otherFilters,
  onChangeSearchParams,
  intl,
}) => {
  const clusters = feed.clusters.edges.map(edge => edge.node);
  const startingIndex = (page - 1) * pageSize;
  const endingIndex = startingIndex + (clusters.length - 1);

  const handleChangeSort = ({ sort: newSort, sortType: newSortType }) => {
    onChangeSearchParams({
      page: 1,
      sort: newSort,
      sortType: newSortType,
    });
  };

  const handleGoToPreviousPage = () => {
    if (page > 1) {
      onChangeSearchParams({
        page: (page - 1),
      });
    }
  };

  const handleGoToNextPage = () => {
    if (endingIndex + 1 < feed.clusters_count) {
      onChangeSearchParams({
        page: (page + 1),
      });
    }
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

  const sortOptions = [
    { value: 'requests_count', label: intl.formatMessage(messages.sortRequestsCount) },
    { value: 'title', label: intl.formatMessage(messages.sortTitle) },
    { value: 'media_count', label: intl.formatMessage(messages.sortMediaCount) },
    { value: 'last_request_date', label: intl.formatMessage(messages.sortLastRequestDate) },
  ];
  if (feed.data_points?.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS)) {
    sortOptions.push({ value: 'fact_checks_count', label: intl.formatMessage(messages.sortFactChecksCount) });
  }

  return (
    <React.Fragment>
      <div className={cx(searchResultsStyles['search-results-header'], styles.feedClustersHeader)}>
        <div className={searchResultsStyles.searchResultsTitleWrapper}>
          <div className={searchResultsStyles.searchHeaderSubtitle}>
            <FormattedMessage id="feedClusters.sharedFeed" defaultMessage="Shared Feed" description="Displayed on top of the feed title on the feed page." />
            <NextIcon />
            <FeedLastClusterizedAt feed={feed} />
          </div>
          <div className={searchResultsStyles.searchHeaderTitle}>
            <h6>
              {feed.name}
            </h6>
            <div className={searchResultsStyles.searchHeaderActions}>
              <FeedHeader feed={feed} feedTeam={feedTeam} />
            </div>
          </div>
        </div>
      </div>
      <div className={cx(searchResultsStyles['search-results-wrapper'], styles.feedClustersFilters)}>
        <FeedTopBar
          team={team}
          feed={feed}
          teamFilters={teamFilters}
          setTeamFilters={handleChangeTeamFilters}
          hideQuickFilterMenu
        />
        <FeedFilters
          onSubmit={handleChangeFilters}
          filterOptions={['channels', 'range', 'linked_items_count', 'show', 'demand']}
          currentFilters={otherFilters}
          feedTeam={{ id: feedTeam.id }}
          className={styles.feedClustersFilterBar}
          disableSave
        />
      </div>
      <div className={cx(searchResultsStyles['search-results-wrapper'], styles.feedClusters)}>
        { clusters.length > 0 ?
          <div className={styles.feedClustersToolbar}>
            <ListSort
              sort={sort}
              sortType={sortType}
              options={sortOptions}
              onChange={handleChangeSort}
            />
            <div className={styles.feedClustersPagination}>
              <Tooltip title={<FormattedMessage id="feedClusters.previousPage" defaultMessage="Previous page" description="Pagination button to go to previous page" />}>
                <ButtonMain
                  onClick={handleGoToPreviousPage}
                  iconCenter={<PrevIcon />}
                  disabled={page === 1}
                  theme="text"
                  variant="text"
                />
              </Tooltip>
              <span className="typography-button">
                <FormattedMessage
                  id="feedClusters.itemsCount"
                  defaultMessage="{count, plural, one {1 / 1} other {{from} - {to} / #}}"
                  description="Pagination count of items returned"
                  values={{
                    from: startingIndex + 1,
                    to: endingIndex + 1,
                    count: feed.clusters_count,
                  }}
                />
              </span>
              <Tooltip title={<FormattedMessage id="feedClusters.nextPage" defaultMessage="Next page" description="Pagination button to go to next page" />}>
                <ButtonMain
                  onClick={handleGoToNextPage}
                  iconCenter={<NextIcon />}
                  disabled={endingIndex + 1 === feed.clusters_count}
                  theme="text"
                  variant="text"
                />
              </Tooltip>
            </div>
          </div>
          : null
        }

        { clusters.length === 0 ?
          <FeedBlankState
            teamSlug={team.slug}
            feedDbid={feed.dbid}
            listDbid={feedTeam.saved_search_id || feed.saved_search_id}
          />
          : null
        }

        <div className={styles.feedClustersList}>
          {clusters.map((cluster) => {
            const { media } = cluster.center;
            const channels = cluster.channels.filter(channel => Object.values(CheckChannels.TIPLINE).includes(channel.toString()));

            return (
              <div key={cluster.id} className={cx('feed-clusters__card', styles.feedClusterCard)}>
                <SharedItemCard
                  title={
                    cluster.title ||
                    cluster.center.title ||
                    cluster.center.media_slug ||
                    <FormattedMessage id="feedClusters.noTitle" description="No title available" defaultMessage="(no title)" />
                  }
                  description={cluster.center.description}
                  mediaThumbnail={{ media: { url: media.url, picture: media.picture, type: media.type } }}
                  workspaces={cluster.teams.edges.map(edge => ({ name: edge.node.name, url: edge.node.avatar }))}
                  date={cluster.last_fact_check_date && new Date(parseInt(cluster.last_fact_check_date, 10) * 1000)}
                  dataPoints={feed.data_points}
                  mediaCount={cluster.media_count}
                  requestsCount={cluster.requests_count}
                  lastRequestDate={cluster.last_request_date && new Date(parseInt(cluster.last_request_date, 10) * 1000)}
                  factCheckCount={cluster.fact_checks_count}
                  channels={channels.length > 0 && { main: channels[0], others: channels }}
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
  intl: intlShape.isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedClustersComponent };

const ConnectedFeedClustersComponent = injectIntl(FeedClustersComponent); // FIXME: Upgrade react-intl so we can use useIntl()

const FeedClusters = ({ teamSlug, feedId }) => {
  const [searchParams, setSearchParams] = React.useState({
    page: 1,
    sort: 'requests_count',
    sortType: 'DESC',
    teamFilters: null,
    otherFilters: {},
  });
  const {
    page,
    sort,
    sortType,
    teamFilters,
    otherFilters,
  } = searchParams;

  const handleChangeSearchParams = (newSearchParams) => { // { page, sort, sortType, teamFilters, ...otherFilters } - a single state for a single query/render
    setSearchParams(Object.assign({}, searchParams, newSearchParams));
  };

  // Set filters for the query
  const filters = {};
  if (otherFilters.channels) {
    filters.channels = otherFilters.channels.map(channel => parseInt(channel, 10));
  }
  if (otherFilters.show) {
    filters.mediaType = otherFilters.show;
  }
  if (otherFilters.range?.request_created_at) {
    filters.date = JSON.stringify(otherFilters.range.request_created_at);
  }
  if (otherFilters.linked_items_count) {
    filters.mediasCountMin = otherFilters.linked_items_count.min;
    filters.mediasCountMax = otherFilters.linked_items_count.max;
  }
  if (otherFilters.demand) {
    filters.requestsCountMin = otherFilters.demand.min;
    filters.requestsCountMax = otherFilters.demand.max;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedClustersQuery($slug: String!, $feedId: Int!, $pageSize: Int!, $offset: Int!, $sort: String, $sortType: String, $teamFilters: [Int], $channels: [Int],
                                $mediaType: [String], $date: String, $mediasCountMin: Int, $mediasCountMax: Int, $requestsCountMin: Int, $requestsCountMax: Int) {
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
              clusters_count(team_ids: $teamFilters, channels: $channels, media_type: $mediaType, last_request_date: $date,
                             medias_count_min: $mediasCountMin, medias_count_max: $mediasCountMax, requests_count_min: $requestsCountMin, requests_count_max: $requestsCountMax)
              clusters(first: $pageSize, offset: $offset, sort: $sort, sort_type: $sortType, team_ids: $teamFilters, channels: $channels, media_type: $mediaType, last_request_date: $date,
                       medias_count_min: $mediasCountMin, medias_count_max: $mediasCountMax, requests_count_min: $requestsCountMin, requests_count_max: $requestsCountMax) {
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
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <ConnectedFeedClustersComponent
              team={props.team}
              feed={props.team.feed}
              feedTeam={props.team.feed.current_feed_team}
              page={page}
              sort={sort}
              sortType={sortType}
              teamFilters={teamFilters || props.team.feed.teams.edges.map(team => team.node.dbid)}
              otherFilters={otherFilters}
              onChangeSearchParams={handleChangeSearchParams}
            />
          );
        }
        return <MediasLoading theme="grey" variant="page" size="large" />;
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
