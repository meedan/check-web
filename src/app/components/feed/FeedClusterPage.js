import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import FeedRequestedMedia from './FeedRequestedMedia';
import RequestCards from './RequestCards';
import ErrorBoundary from '../error/ErrorBoundary';
import { Column, backgroundMain, separationGray } from '../../styles/js/shared';

const StyledTwoColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .media__column {
    background-color: ${backgroundMain};
  }

  .requests__column {
    border-left: 1px solid ${separationGray};
  }
`;

const FeedClusterPage = ({ request }) => (
  <div id="feed-cluster-page">
    <StyledTwoColumnLayout>
      <Column className="media__column">
        <FeedRequestedMedia request={request} />
      </Column>
      <Column className="requests__column">
        <RequestCards requestDbid={request.dbid} />
      </Column>
    </StyledTwoColumnLayout>
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
