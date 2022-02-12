import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TrendsItemComponent from './TrendsItemComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <TrendsItemComponent projectMedia={props.project_media} teams={props.root.current_user.team_users.edges.map(e => e.node.team)} />;
  }
  return null;
};

const TrendsItem = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TrendsItemQuery($ids_0: String!) {
        root {
          current_user {
            team_users(status: "member", first: 10000) {
              edges {
                node {
                  team {
                    name
                    dbid
                  }
                }
              }
            }
          }
        }
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
          dbid
          project_id
          full_url
          domain
          media_id
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
            claim_descriptions(first: 1000) {
              edges {
                node {
                  id
                  description
                  project_media {
                    id
                    dbid
                    last_status
                    report_status
                    report: dynamic_annotation_report_design {
                      data
                    }
                    team {
                      name
                      avatar
                      verification_statuses
                    }
                  }
                }
              }
            }
            items(first: 1000) {
              edges {
                node {
                  id
                  dbid
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
