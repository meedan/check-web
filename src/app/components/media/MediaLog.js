import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import Annotations from '../annotations/Annotations';
import CheckContext from '../../CheckContext';

class MediaLogComponent extends Component {
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
      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', 'MediaLog', (data, run) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === this.props.media.dbid &&
          this.getContext().clientSessionId !== data.actor_session_id
        ) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `media-log-${this.props.media.dbid}`,
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
      <Annotations
        annotations={media.log.edges}
        annotated={media}
        annotatedType="ProjectMedia"
      />
    );
  }
}

MediaLogComponent.contextTypes = {
  store: PropTypes.object,
};

const pageSize = 30;

const eventTypes = [
  'create_tag', 'destroy_comment', 'create_task', 'create_relationship',
  'destroy_relationship', 'create_assignment', 'destroy_assignment', 'create_dynamic',
  'update_dynamic', 'create_dynamicannotationfield', 'update_dynamicannotationfield',
  'create_flag', 'update_embed', 'create_embed', 'update_projectmedia', 'copy_projectmedia',
  'update_task',
];

const fieldNames = [
  'suggestion_free_text', 'suggestion_yes_no', 'suggestion_single_choice',
  'suggestion_multiple_choice', 'suggestion_geolocation', 'suggestion_datetime',
  'response_free_text', 'response_yes_no', 'response_single_choice', 'response_multiple_choice',
  'response_geolocation', 'response_datetime', 'metadata_value', 'verification_status_status',
  'team_bot_response_formatted_data', 'reverse_image_path', 'translation_text', 'mt_translations',
  'translation_status_status', 'translation_published', 'archive_is_response',
  'archive_org_response', 'keep_backup_response', 'memebuster_operation', 'embed_code_copied',
  'pender_archive_response', 'perma_cc_response', 'video_archiver_response',
];

const annotationTypes = ['translation_status', 'verification_status'];

const MediaLogContainer = Relay.createContainer(MediaLogComponent, {
  initialVariables: {
    pageSize,
    eventTypes,
    fieldNames,
    annotationTypes,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        pusher_channel
        log(last: $pageSize, event_types: $eventTypes, field_names: $fieldNames, annotation_types: $annotationTypes) {
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
              teams(first: 2) {
                edges {
                  node {
                    id,
                    dbid,
                    name,
                    slug
                  }
                }
              }
              projects(first: 2) {
                edges {
                  node {
                    id,
                    dbid,
                    title
                    team {
                      slug
                    }
                  }
                }
              }
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
              task {
                id,
                dbid,
                label,
                type
              }
              tag {
                id
                dbid
                tag
                tag_text
              }
              annotation {
                id,
                dbid,
                content,
                annotation_type,
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

const MediaLog = (props) => {
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaLogContainer}
      renderFetched={data => <MediaLogContainer cachedMedia={props.media} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaLog;
