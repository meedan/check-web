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
            defaultLanguage: get_language
            languages: get_languages
            tipline_newsletters(first: $first) {
              edges {
                node {
                  id
                  number_of_articles
                  introduction
                  header_type
                  header_overlay_text
                  first_article
                  second_article
                  third_article
                  send_every
                  rss_feed_url
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
          return (
            <NewsletterComponent
              team={props.team}
              newsletters={props.team.tipline_newsletters.edges.map(edge => edge.node)}
            />
          );
        }
        return null;
      }}
    />
  );
};

export default Newsletter;
