import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import NewsletterComponent from './NewsletterComponent';

const Newsletter = () => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query NewsletterQuery {
        team {
          ...NewsletterComponent_team
        }
      }
    `}
    variables={{}}
    render={({ props }) => {
      if (props) {
        return (
          <NewsletterComponent
            team={props.team}
          />
        );
      }
      return null;
    }}
  />
);

export default Newsletter;
