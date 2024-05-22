import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import FeedRequestedMedia from './FeedRequestedMedia';
import RequestCards from './RequestCards';
import ErrorBoundary from '../error/ErrorBoundary';
import styles from './FeedClusters.module.css';

const FeedClusterPage = ({ request }) => (
  <div id="feed-cluster-page">
    <div className={styles['feed-cluster-page-twocolumns']}>
      <div className={cx(styles['media-column'], styles['max-width-column'])}>
        <FeedRequestedMedia request={request} />
      </div>
      <div className={cx(styles['requests-column'], styles['max-width-column'])}>
        <RequestCards requestDbid={request.dbid} />
      </div>
    </div>
  </div>
);

const FeedClusterPageQuery = ({ routeParams }) => (
  <ErrorBoundary component="FeedClusterPage">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedClusterPageQuery($requestId: ID!) {
          request(id: $requestId) {
            ...FeedRequestedMedia_request
            dbid
          }
        }
      `}
      variables={{
        requestId: parseInt(routeParams.requestId, 10),
      }}
      render={({ props, error }) => {
        if (props && !error) {
          return (<FeedClusterPage request={props.request} />);
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

export default FeedClusterPageQuery;
// export { FeedClusterPage }; TODO write unit test
