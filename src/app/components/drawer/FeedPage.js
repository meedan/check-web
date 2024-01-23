import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay';
import ErrorBoundary from '../error/ErrorBoundary';
import FeedPageContent from './FeedPageContent';

const FeedPage = ({ routeParams }) => (
  <>
    <ErrorBoundary component="Feed">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedPageQuery($slug: String!) {
            team(slug: $slug) {
              permissions
            }
          }
        `}
        variables={{
          slug: routeParams.team,
        }}
        render={({ error, props }) => {
          if (!error && props) {
            return <FeedPageContent routeParams={routeParams} {...props} permissions={props.team.permissions} />;
          }
          return null;
        }}
      />
    </ErrorBoundary>
  </>
);

// eslint-disable-next-line import/no-unused-modules
export default FeedPage;
