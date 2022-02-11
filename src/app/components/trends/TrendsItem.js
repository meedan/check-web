import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TrendsItemComponent from './TrendsItemComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <TrendsItemComponent {...props} />;
  }
  return null;
};

const TrendsItem = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TrendsItemQuery($ids_0: String!) {
        project_media(ids: $ids_0) {
          id
          title
          type
          description
          requests_count
          updated_at
          last_seen
          created_at
          picture
          language_code
          pusher_channel
          dbid
          project_id
          full_url
          domain
          team {
            id
            dbid
            slug
            name
            get_language
            get_report
            get_tasks_enabled
            team_bots(first: 10000) {
              edges {
                node {
                  login
                }
              }
            }
          }
          media {
            url
            quote
            embed_path
            metadata
            type
            picture
            file_path
            thumbnail_path
          }
          cluster {
            size
            first_item_at
            last_item_at
            requests_count
            items(first: 1000) {
              edges {
                node {
                  id
                  title
                  type
                  description
                  requests_count
                  updated_at
                  last_seen
                  created_at
                  picture
                  language_code
                  pusher_channel
                  dbid
                  project_id
                  full_url
                  domain
                  team {
                    id
                    dbid
                    slug
                    name
                    get_language
                    get_report
                    get_tasks_enabled
                    team_bots(first: 10000) {
                      edges {
                        node {
                          login
                        }
                      }
                    }
                  }
                  media {
                    url
                    quote
                    embed_path
                    metadata
                    type
                    picture
                    file_path
                    thumbnail_path
                  }
                }
              }
            }
          }
        }
      }
    `}
    variables={{
      ids_0: props.routeParams.mediaId,
    }}
    render={renderQuery}
  />
);

TrendsItem.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    mediaId: PropTypes.string,
  }).isRequired,
};

export default TrendsItem;
