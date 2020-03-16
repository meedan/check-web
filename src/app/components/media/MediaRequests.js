import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import Annotations from '../annotations/Annotations';
import CheckContext from '../../CheckContext';

class MediaRequestsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUpdate(nextProps) {
    if (this.props.media.dbid !== nextProps.media.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.media.dbid !== prevProps.media.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', 'MediaRequests', (data, run) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === this.props.media.dbid &&
          this.getContext().clientSessionId !== data.actor_session_id
        ) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `media-requests-${this.props.media.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  render() {
    const media = Object.assign(this.props.cachedMedia, this.props.media);

    return (
      <div id="media__requests" style={this.props.style}>
        <Annotations
          style={{
            background: 'transparent',
            border: 0,
            boxShadow: 'none',
          }}
          annotations={media.requests.edges}
          annotated={media}
          annotatedType="ProjectMedia"
          noActivityMessage={
            <FormattedMessage
              id="MediaRequests.noRequest"
              defaultMessage="No requests"
            />
          }
        />
      </div>
    );
  }
}

MediaRequestsComponent.contextTypes = {
  store: PropTypes.object,
};

const pageSize = 30;
const eventTypes = ['create_dynamicannotationfield'];
const fieldNames = ['smooch_data'];
const annotationTypes = [];
const whoDunnit = ['smooch'];

const MediaRequestsContainer = Relay.createContainer(MediaRequestsComponent, {
  initialVariables: {
    pageSize,
    eventTypes,
    fieldNames,
    annotationTypes,
    whoDunnit,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        pusher_channel
        requests: log(last: $pageSize, event_types: $eventTypes, field_names: $fieldNames, annotation_types: $annotationTypes, who_dunnit: $whoDunnit, include_related: true) {
          edges {
            node {
              id,
              dbid,
              item_type,
              item_id,
              event,
              event_type,
              created_at,
              object_after,
              object_changes_json,
              meta,
              user {
                id,
                dbid,
                name,
                is_active,
                source {
                  id,
                  dbid,
                  image,
                }
              }
              annotation {
                id,
                dbid,
                content,
                annotation_type,
                smooch_slack_url,
                updated_at,
                created_at,
                permissions,
                medias(first: 10000) {
                  edges {
                    node {
                      id,
                      dbid,
                      quote,
                      published,
                      url,
                      metadata,
                      project_id,
                      last_status,
                      last_status_obj {
                        id
                        dbid
                        content
                        assignments(first: 10000) {
                          edges {
                            node {
                              id
                              dbid
                              name
                              source {
                                id
                                dbid
                                image
                              }
                            }
                          }
                        }
                      }
                      field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                      log_count,
                      permissions,
                      verification_statuses,
                      translation_statuses,
                      domain,
                      team {
                        slug,
                        get_embed_whitelist
                      }
                      media {
                        type,
                        metadata
                        embed_path,
                        thumbnail_path,
                        file_path,
                        url,
                        quote
                      }
                      user {
                        dbid
                        name
                        is_active
                        source {
                          dbid
                          image
                        }
                      }
                    }
                  }
                }
                annotator {
                  name,
                  profile_image
                }
                version {
                  id
                  item_id
                  item_type
                }
              }
            }
          }
        }
      }
    `,
  },
});

const MediaRequests = (props) => {
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaRequestsContainer}
      renderFetched={data =>
        <MediaRequestsContainer cachedMedia={props.media} style={props.style} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaRequests;
