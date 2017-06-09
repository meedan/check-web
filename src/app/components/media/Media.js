import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CheckContext from '../../CheckContext';
import MediaRoute from '../../relay/MediaRoute';
import MediaParentComponent from './MediaParentComponent';
import MediasLoading from './MediasLoading';

const MediaContainer = Relay.createContainer(MediaParentComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id,
        dbid,
        quote,
        published,
        url,
        embed,
        last_status,
        field_value(annotation_type_field_name: "translation_status:translation_status_status"),
        log_count,
        domain,
        permissions,
        project {
          id,
          dbid,
          title,
          get_languages
        },
        project_id,
        pusher_channel,
        verification_statuses,
        translation_statuses,
        overridden,
        language,
        language_code,
        media {
          url,
          quote,
          embed_path,
          thumbnail_path
        }
        user {
          name,
          email,
          source {
            dbid,
            accounts(first: 10000) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
        last_status_obj {
          id
          dbid
        }
        translation_status: annotation(annotation_type: "translation_status") {
          id
          dbid
        }
        translations: annotations(annotation_type: "translation", first: 10000) {
          edges {
            node {
              id,
              dbid,
              annotation_type,
              annotated_type,
              annotated_id,
              annotator,
              content,
              created_at,
              updated_at
            }
          }
        }
        tags(first: 10000) {
          edges {
            node {
              tag,
              id
            }
          }
        }
        tasks(first: 10000) {
          edges {
            node {
              id,
              dbid,
              label,
              type,
              description,
              permissions,
              jsonoptions,
              first_response {
                id,
                dbid,
                permissions,
                content,
                annotator {
                  name
                }
              }
            }
          }
        }
        log(first: 10000) {
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
              projects(first: 2) {
                edges {
                  node {
                    id,
                    dbid,
                    title
                  }
                }
              }
              user {
                name,
                profile_image,
                email,
                source {
                  dbid,
                  accounts(first: 10000) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                }
              }
              task {
                id,
                dbid,
                label,
                type
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
                      embed,
                      project_id,
                      last_status,
                      field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                      log_count,
                      permissions,
                      verification_statuses,
                      translation_statuses,
                      domain,
                      team {
                        slug
                      }
                      media {
                        embed_path,
                        thumbnail_path,
                        url,
                        quote
                      }
                      user {
                        name,
                        source {
                          dbid
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
        account {
          source {
            dbid,
            name
          }
        }
        team {
          get_suggested_tags,
          slug
        }
      }
`,
  },
});

class ProjectMedia extends Component {
  render() {
    let projectId = this.props.params.projectId || 0;
    const context = new CheckContext(this);
    context.setContext();
    if (projectId === 0) {
      const store = context.getContextStore();
      if (store.project) {
        projectId = store.project.dbid;
      }
    }
    const ids = `${this.props.params.mediaId},${projectId}`;
    const route = new MediaRoute({ ids });

    return (
      <Relay.RootContainer
        Component={MediaContainer}
        route={route}
        renderLoading={function () {
          return <MediasLoading count={1} />;
        }}
      />
    );
  }
}

ProjectMedia.contextTypes = {
  store: React.PropTypes.object,
};

export default ProjectMedia;
