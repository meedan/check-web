import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import FeedRequestedMedia from './FeedRequestedMedia';
import RequestCards from './RequestCards';
import ErrorBoundary from '../error/ErrorBoundary';

const StyledTwoColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100vw;

  .media__column {
    background-color: var(--brandBackground);
  }

  .requests__column {
    border-left: 1px solid var(--grayBorderMain);
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 340px;
  max-width: ${props => props.maxWidth ? props.maxWidth : '720px'};
  padding: 16px;
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  overflow: ${props => props.overflow ? props.overflow : 'auto'};
`;


const FeedClusterPage = ({ request }) => (
  <div id="feed-cluster-page">
    <StyledTwoColumnLayout>
      <Column className="media__column" maxWidth="50%">
        <FeedRequestedMedia request={request} />
      </Column>
      <Column className="requests__column" maxWidth="50%">
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
