import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ChevronRightIcon from '../../icons/chevron_right.svg';
import CalendarIcon from '../../icons/calendar_month.svg';
import ItemThumbnail from '../search/SearchResultsTable/ItemThumbnail';
import searchResultsStyles from '../search/SearchResults.module.css';
import styles from './FeedItem.module.css';

const FeedItemHeader = ({ teamSlug, feed, cluster }) => {
  const { title, center } = cluster;

  const handleViewFeed = () => {
    browserHistory.push(`/${teamSlug}/feed/${feed.dbid}`);
  };

  return (
    <div id="feed-item-page-header">
      <div className={cx(searchResultsStyles['search-results-header'], styles.feedItemHeader)}>
        <div className={cx(searchResultsStyles.searchResultsTitleWrapper, styles.feedItemHeaderMetadata)}>
          <ItemThumbnail picture={center.media?.picture} maskContent={false} type={center.media?.type} url={center.media?.url} />
          <div>
            <div className={searchResultsStyles.searchHeaderSubtitle}>
              <div className={styles.feedItemHeaderMetadataRow}>
                <FormattedMessage id="feedItemHeader.sharedFeed" defaultMessage="Shared Feed" description="Displayed on top of the feed title on the feed item page." component="div" />
                <ChevronRightIcon />
                <span className={styles.feedItemHeaderLabel}>{feed.name}</span>
              </div>
            </div>
            <div className={searchResultsStyles.searchHeaderTitle}>
              <h6 title={title}>
                {title}
              </h6>
            </div>
            <div className={searchResultsStyles.searchHeaderSubtitle}>
              { cluster.last_request_date ?
                <span className={styles.feedItemHeaderMetadataRow}>
                  <CalendarIcon />
                  <FormattedDate value={new Date(parseInt(cluster.last_request_date, 10) * 1000)} year="numeric" month="long" day="numeric" />
                </span>
                : null
              }
            </div>
          </div>
        </div>
        <div>
          <ButtonMain
            variant="outlined"
            size="default"
            theme="brand"
            onClick={handleViewFeed}
            label={
              <FormattedMessage
                id="feedItemHeader.viewSharedFeed"
                defaultMessage="View Shared Feed"
                description="Label of a button displayed on the feed item page that when clicked takes the user to the shared feed page."
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

FeedItemHeader.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  feed: PropTypes.exact({
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  cluster: PropTypes.exact({
    title: PropTypes.string.isRequired,
    last_request_date: PropTypes.number,
    center: PropTypes.exact({
      title: PropTypes.string,
      media: PropTypes.exact({
        picture: PropTypes.string,
        type: PropTypes.string,
        url: PropTypes.string,
      }),
    }).isRequired,
  }).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedItemHeader };

export default createFragmentContainer(FeedItemHeader, graphql`
  fragment FeedItemHeader_cluster on Cluster {
    title
    last_request_date
    center {
      title
      media {
        url
        type
        picture
      }
    }
  }
  fragment FeedItemHeader_feed on Feed {
    dbid
    name
  }
`);
