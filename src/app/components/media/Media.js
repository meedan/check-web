import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MediaRoute from '../../relay/MediaRoute';
import MediaComponent from './MediaComponent';

const MediaContainer = Relay.createContainer(MediaComponent, {
  initialVariables: {
    contextId: null
  },
  fragments: {
    media: () => Relay.QL`
      fragment on Media {
        id,
        dbid,
        published,
        url,
        jsondata(context_id: $contextId),
        last_status(context_id: $contextId),
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
        tags(first: 10000, context_id: $contextId) {
          edges {
            node {
              tag,
              id
            }
          }
        }
        annotations(first: 10000, context_id: $contextId) {
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
      }
    `
  }
});

class Media extends Component {
  render() {
    var projectId = 0;
    if (Checkdesk.context.project) {
      projectId = Checkdesk.context.project.dbid;
    }
    var route = new MediaRoute({ ids: this.props.params.mediaId + ',' + projectId });
    return (<Relay.RootContainer Component={MediaContainer} route={route} />);
  }
}

export default Media;
