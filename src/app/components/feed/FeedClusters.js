import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import FeedHeader from './FeedHeader';
import searchResultsStyles from '../search/SearchResults.module.css';

const FeedClusters = ({ feed, feedTeam }) => (
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
      Content here
    </div>
  </React.Fragment>
);

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
    ...FeedHeader_feed
  }
`);
