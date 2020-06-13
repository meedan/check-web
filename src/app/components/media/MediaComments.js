import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import Annotations from '../annotations/Annotations';

class MediaCommentsComponent extends Component {
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
    const {
      pusher,
      clientSessionId,
      media,
      relay,
    } = this.props;
    if (pusher) {
      pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaComments', (data, run) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
          if (run) {
            relay.forceFetch();
            return true;
          }
          return {
            id: `media-comments-${media.dbid}`,
            callback: relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    if (pusher) {
      pusher.unsubscribe(media.pusher_channel);
    }
  }

  render() {
    const media = Object.assign(this.props.cachedMedia, this.props.media);

    return (
      <div id="media__comments" style={this.props.style}>
        <Annotations
          showAddAnnotation
          style={{
            background: 'transparent',
            border: 0,
            boxShadow: 'none',
          }}
          annotations={media.log.edges}
          annotated={media}
          annotatedType="ProjectMedia"
          noActivityMessage={
            <FormattedMessage
              id="mediaComments.noNote"
              defaultMessage="No note"
            />
          }
        />
      </div>
    );
  }
}

MediaCommentsComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const pageSize = 30;
const eventTypes = ['create_comment'];
const fieldNames = [];
const annotationTypes = [];

const MediaCommentsContainer = Relay.createContainer(withPusher(MediaCommentsComponent), {
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
        archived
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
                      log_count,
                      permissions,
                      verification_statuses,
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

const MediaComments = (props) => {
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaCommentsContainer}
      renderFetched={data =>
        <MediaCommentsContainer cachedMedia={props.media} style={props.style} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaComments;
