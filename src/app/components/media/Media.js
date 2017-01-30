import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CheckContext from '../../CheckContext';
import MediaRoute from '../../relay/MediaRoute';
import MediaComponent from './MediaComponent';
import MediasLoading from './MediasLoading';

const MediaContainer = Relay.createContainer(MediaComponent, {
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
        annotations_count,
        domain,
        permissions,
        pusher_channel,
        verification_statuses,
        media {
          url,
          quote,
          embed_path,
          thumbnail_path
        }
        user {
          name,
          source {
            dbid
          }
        }
        last_status_obj {
          id
          dbid
        }
        tags(first: 10000) {
          edges {
            node {
              tag,
              id
            }
          }
        }
        annotations(first: 10000) {
          edges {
            node {
              id,
              dbid,
              content,
              annotation_type,
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
                    annotations_count,
                    permissions,
                    verification_statuses,
                    domain,
                    media {
                      embed_path,
                      thumbnail_path
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
        account {
          source {
            dbid,
            name
          }
        }
        team {
          get_suggested_tags
        }
      }
    `,
  },
});

class ProjectMedia extends Component {
  render() {
    let projectId = 0;
    const context = new CheckContext(this);
    context.setContext();
    const store = context.getContextStore();
    if (store.project) {
      projectId = store.project.dbid;
    }
    const ids = `${this.props.params.mediaId},${projectId}`;
    const route = new MediaRoute({ ids });

    return (
      <Relay.RootContainer
        Component={MediaContainer}
        route={route}
        renderLoading={function() {
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
