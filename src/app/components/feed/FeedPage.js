import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay';
import FeedPageContent from './FeedPageContent';
import ErrorBoundary from '../error/ErrorBoundary';

const FeedPage = ({ routeParams }) => (
  <>
    <ErrorBoundary component="Feed">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedPageQuery($slug: String!) {
            team(slug: $slug) {
              permissions,
              name,
              slug
            }
          }
        `}
        render={({ error, props }) => {
          if (!error && props) {
            return <FeedPageContent name={props.team.name} permissions={props.team.permissions} routeParams={routeParams} slug={props.team.slug} />;
          }
          return null;
        }}
        variables={{
          slug: routeParams.team,
        }}
      />
    </ErrorBoundary>
  </>
);

// eslint-disable-next-line import/no-unused-modules
export default FeedPage;
