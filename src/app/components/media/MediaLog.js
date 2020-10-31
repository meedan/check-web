import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import Annotations from '../annotations/Annotations';
import UserTooltip from '../user/UserTooltip';
import ProfileLink from '../layout/ProfileLink';
import { getCurrentProjectId } from '../../helpers';

class MediaLogComponent extends Component {
  static propTypes = {
    pusher: pusherShape.isRequired,
    clientSessionId: PropTypes.string.isRequired,
  };

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

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaLog', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-log-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    pusher.unsubscribe(media.pusher_channel);
  }

  render() {
    const media = Object.assign(this.props.cachedMedia, this.props.media);

    return (
      <Annotations
        annotations={media.log.edges}
        annotated={media}
        annotatedType="ProjectMedia"
        team={this.props.team}
      />
    );
  }
}

const pageSize = 30;

const eventTypes = [
  'create_tag', 'destroy_comment', 'create_task', 'create_relationship',
  'destroy_relationship', 'create_assignment', 'destroy_assignment', 'create_dynamic',
  'update_dynamic', 'create_dynamicannotationfield', 'update_dynamicannotationfield',
  'create_flag', 'update_embed', 'create_embed', 'update_projectmedia', 'copy_projectmedia',
  'update_task', 'update_projectmediaproject',
];

const fieldNames = [
  'suggestion_free_text', 'suggestion_yes_no', 'suggestion_single_choice',
  'suggestion_multiple_choice', 'suggestion_geolocation', 'suggestion_datetime',
  'response_free_text', 'response_yes_no', 'response_single_choice', 'response_multiple_choice',
  'response_geolocation', 'response_datetime', 'metadata_value', 'verification_status_status',
  'team_bot_response_formatted_data', 'reverse_image_path', 'archive_is_response',
  'archive_org_response', 'keep_backup_response', 'embed_code_copied',
  'pender_archive_response', 'perma_cc_response', 'video_archiver_response',
  'suggestion_image_upload', 'response_image_upload',
];

const annotationTypes = ['verification_status', 'flag'];

const MediaLogContainer = Relay.createContainer(withPusher(MediaLogComponent), {
  initialVariables: {
    pageSize,
    eventTypes,
    fieldNames,
    annotationTypes,
    teamSlug: null,
  },
  prepareVariables: vars => ({
    ...vars,
    teamSlug: /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null,
  }),
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
                team_user(team_slug: $teamSlug) {
                  ${ProfileLink.getFragment('teamUser')}, # FIXME: Make Annotation a container
                  ${UserTooltip.getFragment('teamUser')}, # FIXME: Make Annotation a container
                },
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
                type,
                fieldset,
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
                      log_count,
                      permissions,
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
  const projectId = getCurrentProjectId(props.media.project_ids);
  const ids = `${props.media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaLogContainer}
      renderFetched={data => (
        <MediaLogContainer
          cachedMedia={props.media}
          {...data}
          team={props.team}
        />
      )}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaLog;
