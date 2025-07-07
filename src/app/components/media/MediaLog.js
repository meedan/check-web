/* eslint-disable react/sort-prop-types */
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import Loader from '../cds/loading/Loader';
import { withPusher } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import Annotations from '../annotations/Annotations';

class MediaLogComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const media = Object.assign(this.props.cachedMedia, this.props.media);

    return (
      <Annotations
        annotated={media}
        annotatedType="ProjectMedia"
        annotations={media.log.edges}
        team={this.props.team}
      />
    );
  }
}

const pageSize = 30;

const eventTypes = [
  'create_projectmedia', 'update_projectmedia', 'create_relationship', 'update_relationship', 'destroy_relationship', 'create_dynamicannotationfield',
  'update_dynamicannotationfield', 'create_tag', 'create_dynamic', 'update_dynamic', 'create_claimdescription', 'update_claimdescription',
  'create_factcheck', 'update_factcheck', 'create_assignment', 'destroy_assignment', 'create_explaineritem', 'destroy_explaineritem', 'replace_projectmedia',
];

const MediaLogContainer = Relay.createContainer(withPusher(MediaLogComponent), {
  initialVariables: {
    pageSize,
    eventTypes,
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
        log(last: $pageSize, event_types: $eventTypes) {
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
  const route = new MediaRoute({ ids: props.media.dbid.toString() });

  return (
    <Relay.RootContainer
      Component={MediaLogContainer}
      forceFetch
      renderFetched={data => (
        <MediaLogContainer
          cachedMedia={props.media}
          {...data}
          team={props.team}
        />
      )}
      renderLoading={() => <Loader size="medium" theme="grey" variant="inline" />}
      route={route}
    />
  );
};

export default MediaLog;
