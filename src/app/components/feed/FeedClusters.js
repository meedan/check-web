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
import FeedBlankState from './FeedBlankState';
import styles from './FeedClusters.module.css';

const pageSize = 10;

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
  teamSlug,
  feed,
  feedTeam,
  page,
  sort,
  sortType,
  onChangeSearchParams,
  intl,
}) => {
  const clusters = feed.clusters.edges.map(edge => edge.node);
  const startingIndex = (page - 1) * pageSize;
  const endingIndex = startingIndex + (clusters.length - 1);

  const handleChangeSort = ({ sort: newSort, sortType: newSortType }) => {
    onChangeSearchParams({ page: 1, sort: newSort, sortType: newSortType });
  };

  const handleGoToPreviousPage = () => {
    if (page > 1) {
      onChangeSearchParams({ page: (page - 1), sort, sortType });
    }
  };

  const handleGoToNextPage = () => {
    if (endingIndex + 1 < feed.clusters_count) {
      onChangeSearchParams({ page: (page + 1), sort, sortType });
    }
  };

  const sortOptions = [
    { value: 'title', label: intl.formatMessage(messages.sortTitle) },
    { value: 'requests_count', label: intl.formatMessage(messages.sortRequestsCount) },
    { value: 'media_count', label: intl.formatMessage(messages.sortMediaCount) },
    { value: 'last_request_date', label: intl.formatMessage(messages.sortLastRequestDate) },
  ];
  if (feed.data_points?.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS)) {
    sortOptions.push({ value: 'fact_checks_count', label: intl.formatMessage(messages.sortFactChecksCount) });
  }

  return (
    <React.Fragment>
      <div className={searchResultsStyles['search-results-header']}>
        <div className={searchResultsStyles.searchResultsTitleWrapper}>
          <div className={searchResultsStyles.searchHeaderSubtitle}>
            <FormattedMessage id="feedClusters.sharedFeed" defaultMessage="Shared Feed" description="Displayed on top of the feed title on the feed page." />
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
            teamSlug={teamSlug}
            feedDbid={feed.dbid}
            listDbid={feedTeam.saved_search_id || feed.saved_search_id}
          />
          : null
        }

        {clusters.map((cluster) => {
          const { media } = cluster.center;
          const channels = cluster.channels.filter(channel => Object.values(CheckChannels.TIPLINE).includes(channel.toString()));

          return (
            <div key={cluster.id} className={cx('feed-clusters__card', styles.feedClusterCard)}>
              <SharedItemCard
                title={cluster.title || cluster.center.title}
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
    </React.Fragment>
  );
};

FeedClustersComponent.defaultProps = {
  page: 1,
  sort: 'title',
  sortType: 'ASC',
};

FeedClustersComponent.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  page: PropTypes.number,
  sort: PropTypes.oneOf(['title', 'media_count', 'requests_count', 'fact_checks_count', 'last_request_date']),
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  onChangeSearchParams: PropTypes.func.isRequired,
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
  const [searchParams, setSearchParams] = React.useState({ page: 1, sort: 'title', sortType: 'ASC' });
  const { page, sort, sortType } = searchParams;

  const handleChangeSearchParams = (newSearchParams) => { // { page, sort, sortType }
    setSearchParams(newSearchParams);
  };

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedClustersQuery($slug: String!, $feedId: Int!, $pageSize: Int!, $offset: Int!, $sort: String, $sortType: String) {
          team(slug: $slug) {
            feed(dbid: $feedId) {
              dbid
              name
              data_points
              saved_search_id
              current_feed_team {
                saved_search_id
                ...FeedHeader_feedTeam
              }
              clusters_count
              clusters(first: $pageSize, offset: $offset, sort: $sort, sort_type: $sortType) {
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
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <ConnectedFeedClustersComponent
              teamSlug={teamSlug}
              feed={props.team.feed}
              feedTeam={props.team.feed.current_feed_team}
              page={page}
              sort={sort}
              sortType={sortType}
              onChangeSearchParams={handleChangeSearchParams}
            />
          );
        }
        return null;
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
