/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import NewsletterComponent from './NewsletterComponent';

const Newsletter = () => {
  const first = 10000;
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query NewsletterQuery($first: Int!) {
          team {
            permissions
            id
            tipline_newsletters(first: $first) {
              edges {
                node {
                  id
                  number_of_articles
                  introduction
                  header_overlay_text
                  first_article
                  second_article
                  third_article
                  send_every
                  timezone
                  time
                  language
                  enabled
                  footer
                }
              }
            }
          }
        }
      `}
      variables={{
        first,
      }}
      render={({ props }) => {
        if (props) {
          return (<NewsletterComponent
            newsletters={props.team.tipline_newsletters.edges}
            language="en"
          />);
        }
        return null;
      }}
    />
  );
};

export default Newsletter;
