import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import NewsletterComponent from './NewsletterComponent';
import createEnvironment from '../../../relay/EnvironmentModern';

const Newsletter = () => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query NewsletterQuery {
        me {
          token
        }
        team {
          slug
          ...NewsletterComponent_team
        }
      }
    `}
    variables={{}}
    render={({ props }) => {
      const environment = createEnvironment(props?.me?.token, props?.team?.slug);

      if (props) {
        return (
          <NewsletterComponent
            team={props.team}
            environment={environment}
          />
        );
      }
      return null;
    }}
  />
);

export default Newsletter;
