import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import FeedHeader from './FeedHeader';
import SharedItemCard from '../search/SearchResultsCards/SharedItemCard';
import searchResultsStyles from '../search/SearchResults.module.css';
import CheckChannels from '../../CheckChannels';

const FeedClusters = ({ feed, feedTeam }) => {
  const clusters = feed.clusters.edges.map(edge => edge.node);

  return (
    <React.Fragment>
      <div className={searchResultsStyles['search-results-header']}>
        <div className="search__list-header-filter-row">
          <div className={cx('project__title', searchResultsStyles.searchResultsTitleWrapper)}>
            <div className={searchResultsStyles.searchHeaderSubtitle}>
              <FormattedMessage id="feedClusters.sharedFeed" defaultMessage="Shared Feed" description="Displayed on top of the feed title on the feed page." />
            </div>
            <div className={cx('project__title-text', searchResultsStyles.searchHeaderTitle)}>
              <h6>
                {feed.name}
              </h6>
              <div className={searchResultsStyles.searchHeaderActions}>
                <FeedHeader feed={feed} feedTeam={feedTeam} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={cx('search__results', 'results', searchResultsStyles['search-results-wrapper'])}>
        {clusters.map((cluster) => {
          const { media } = cluster.center;
          const channels = cluster.channels.filter(channel => Object.values(CheckChannels.TIPLINE).includes(channel.toString()));

          return (
            <div>
              <SharedItemCard
                title={cluster.center.title}
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

FeedClusters.defaultProps = {};

FeedClusters.propTypes = {
  feedTeam: PropTypes.shape({
    team_id: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"update FeedTeam":true}'
  }).isRequired,
  feed: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    licenses: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"update Feed":true}'
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
    clusters: PropTypes.arrayOf(PropTypes.shape({
      edges: PropTypes.shape({
        node: PropTypes.shape({
          center: PropTypes.shape({
            title: PropTypes.string.isRequired,
          }).isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired).isRequired,
  }).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedClusters };

export default createFragmentContainer(FeedClusters, graphql`
  fragment FeedClusters_feedTeam on FeedTeam {
    ...FeedHeader_feedTeam
  }
  fragment FeedClusters_feed on Feed {
    name
    data_points
    clusters(first: 50) {
      edges {
        node {
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
`);
