import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TrendsItemComponent from './TrendsItemComponent';
import { getListUrlQueryAndIndexForTrends } from '../../urlHelpers';

const TrendsItem = ({ routeParams, location }) => {
  const {
    listUrl,
    listQuery,
    listIndex,
    buildSiblingUrl,
  } = getListUrlQueryAndIndexForTrends(routeParams, location.query);

  console.log('listUrl', listUrl);
  console.log('listQuery', listQuery);
  console.log('listIndex', listIndex);
  console.log('buildSiblingUrl', buildSiblingUrl);

  const renderQuery = ({ error, props }) => {
    if (!error && props) {
      return (
        <TrendsItemComponent
          cluster={props.cluster}
          teams={props.root.current_user.team_users.edges.map(e => e.node.team)}
          listIndex={listIndex}
          buildSiblingUrl={buildSiblingUrl}
        />
      );
    }
    return null;
  };

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TrendsItemQuery($clusterId: ID!) {
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
          cluster(id: $clusterId) {
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
                  media_id
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
                    dbid
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
      `}
      variables={{
        clusterId: `${routeParams.clusterId}`,
      }}
      render={renderQuery}
    />
  );
};

TrendsItem.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    clusterId: PropTypes.number.isRequired,
  }).isRequired,
};

export default TrendsItem;
