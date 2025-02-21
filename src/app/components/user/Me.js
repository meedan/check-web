import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import MeComponent from './MeComponent';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';

const Me = ({ params }) => (
  <ErrorBoundary component="Me">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MeQuery {
          me {
            ...MeComponent_user
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          return <MeComponent params={params} user={props.me} />;
        }
        return <Loader size="large" theme="white" variant="page" />;
      }}
    />
  </ErrorBoundary>
);


export default Me;
