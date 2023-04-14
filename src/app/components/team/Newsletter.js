/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import NewsletterComponent from './NewsletterComponent';

const Newsletter = () => {
  // eslint-disable-next-line
  console.log('~~~',);
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query NewsletterQuery {
          root {
            current_team {
              id
            }
          }
        }
      `}
      variables={{}}
      render={({ props }) => {
        if (props) {
          return (<NewsletterComponent />);
        }
        return null;
      }}
    />
  );
};

export default Newsletter;
