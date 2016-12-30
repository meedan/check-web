import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CheckContext from '../../CheckContext';
import MediaRoute from '../../relay/MediaRoute';
import MediaComponent from './MediaComponent';

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
        jsondata,
        last_status,
        annotations_count,
        domain,
        permissions,
        pusher_channel,
        verification_statuses,
        user {
          name,
          source {
            dbid
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
                    published,
                    url,
                    jsondata,
                    project_id,
                    last_status,
                    annotations_count,
                    permissions,
                    verification_statuses,
                    domain,
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

class Media extends Component {
  render() {
    let projectId = 0;
    const context = new CheckContext(this);
    context.setContext();
    const store = context.getContextStore();
    if (store.project) {
      projectId = store.project.dbid;
    }
    const ids = this.props.params.mediaId;
    const route = new MediaRoute({ ids: ids });
    return (<Relay.RootContainer Component={MediaContainer} route={route} />);
  }
}

Media.contextTypes = {
  store: React.PropTypes.object,
};

export default Media;
