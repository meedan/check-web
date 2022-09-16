/* eslint-disable @calm/react-intl/missing-attribute, relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import FeedItemComponent from './FeedItemComponent';
import ErrorBoundary from '../error/ErrorBoundary';
import { getListUrlQueryAndIndex } from '../../urlHelpers';

const FeedItem = ({ routeParams, location }) => {
  const renderQuery = ({ error, props }) => {
    if (!error && props) {
      const newRouteParams = Object.assign({ team: props.root.current_team.slug, objectType: 'feed' }, routeParams);
      const { listIndex, buildSiblingUrl } = getListUrlQueryAndIndex(newRouteParams, location.query);
      return (
        <FeedItemComponent
          feedId={routeParams.feedId}
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
    <ErrorBoundary component="FeedItem">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedItemQuery($feedId: Int!, $clusterId: ID!) {
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
                      }
                    }
                  }
                }
              }
            }
            cluster(id: $clusterId) {
              requests_count
              claim_descriptions(first: 1000, feed_id: $feedId) {
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
              items(first: 1000, feed_id: $feedId) {
                edges {
                  node {
                    id
                    dbid
                    title
                    type
                    media_id
                    description
                    requests_count
                    created_at
                    updated_at
                    last_seen
                    picture
                    dbid
                    team {
                      id
                      dbid
                      slug
                      name
                      avatar
                      verification_statuses
                    }
                    media {
                      dbid
                      url
                      quote
                      metadata
                      type
                      picture
                      file_path
                      embed_path
                    }
                  }
                }
              }
            }
          }
        `}
        variables={{
          feedId: parseInt(routeParams.feedId, 10),
          clusterId: `${routeParams.clusterId}`,
        }}
        render={renderQuery}
      />
    </ErrorBoundary>
  );
};

FeedItem.propTypes = {
  routeParams: PropTypes.shape({
    feedId: PropTypes.string.isRequired,
    clusterId: PropTypes.string.isRequired,
  }).isRequired,
};

export default FeedItem;
