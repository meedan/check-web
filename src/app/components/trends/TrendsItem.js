import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TrendsItemComponent from './TrendsItemComponent';
import ErrorBoundary from '../error/ErrorBoundary';
import { getListUrlQueryAndIndex } from '../../urlHelpers';

const TrendsItem = ({ routeParams, location }) => {
  const renderQuery = ({ error, props }) => {
    if (!error && props) {
      const newRouteParams = Object.assign({ team: props.root.current_team.slug, objectType: 'trends' }, routeParams);
      const { listIndex, buildSiblingUrl } = getListUrlQueryAndIndex(newRouteParams, location.query);
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
    <ErrorBoundary component="TrendsItem">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query TrendsItemQuery($clusterId: ID!) {
            root {
              current_team {
                slug
              }
              current_user {
                team_users(status: "member", first: 10000) {
                  edges {
                    node {
                      team {
                        name
                        dbid
                        country
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
                    fact_check {
                      title
                      summary
                      url
                    }
                    project_media {
                      id
                      dbid
                      report_status
                      report: dynamic_annotation_report_design {
                        data
                      }
                      last_status
                      last_status_obj {
                        data
                      }
                      tags(first: 10000) {
                        edges {
                          node {
                            id
                            tag_text
                          }
                        }
                      }
                      tasks(first: 10000) {
                        edges {
                          node {
                            slug
                            label
                            options
                            first_response_value
                          }
                        }
                      }
                      team {
                        dbid
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
                      avatar
                      get_language
                      get_report
                      get_tasks_enabled
                      verification_statuses
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
    </ErrorBoundary>
  );
};

TrendsItem.propTypes = {
  routeParams: PropTypes.shape({
    clusterId: PropTypes.string.isRequired,
  }).isRequired,
};

export default TrendsItem;
