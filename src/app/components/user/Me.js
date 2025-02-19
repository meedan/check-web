/* eslint-disable relay/unused-fields */
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
            id
            dbid
            name
            email
            providers
            two_factor
            is_active
            confirmed
            unconfirmed_email
            permissions
            profile_image
            number_of_teams
            get_send_email_notifications
            get_send_successful_login_notifications
            get_send_failed_login_notifications
            source {
              id
              dbid
              created_at
              updated_at
              name
              image
              user_id
              description
              permissions
              accounts(first: 10000) {
                edges {
                  node {
                    url
                    provider
                  }
                }
              }
              account_sources(first: 10000) {
                edges {
                  node {
                    id
                    account {
                      id
                      created_at
                      updated_at
                      metadata
                      url
                      uid
                      user_id
                    }
                  }
                }
              }
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          return <MeComponent me={props.me} params={params} />;
        }
        return <Loader size="large" theme="white" variant="page" />;
      }}
    />
  </ErrorBoundary>
);


export default Me;
