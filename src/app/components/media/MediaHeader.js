import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MediaRoute from '../../relay/MediaRoute';
import MediaMetadataSummary from './MediaMetadataSummary';
import MediaUtil from './MediaUtil';
import CheckContext from '../../CheckContext';

class MediaHeaderComponent extends Component {
  setCurrentContext() {
    const context = new CheckContext(this).getContextStore();
    this.props.relay.setVariables({ contextId: context.project.dbid });
  }

  componentDidMount() {
    this.setCurrentContext();
  }

  componentDidUpdate() {
    this.setCurrentContext();
  }

  render() {
    const media = this.props.media;
    const data = JSON.parse(media.embed);
    const title = MediaUtil.truncatedTitle(media, data);
    media.url = media.media.url
    media.quote = media.media.quote
    if (this.props.relay.variables.contextId === null) {
      return null;
    }
    return (
      <div className="media-header">
        {/* TODO: assess component for deletion now that we don't display copy here */}
      </div>
    );
  }
}

MediaHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const MediaHeaderContainer = Relay.createContainer(MediaHeaderComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id,
        dbid,
        published,
        url,
        quote,
        embed,
        last_status,
        annotations_count,
        verification_statuses,
        domain,
        media {
          url
          quote
        }
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
        tasks(first: 10000) {
          edges {
            node {
              id,
              dbid,
              label,
              type,
              description,
              permissions,
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
        account {
          source {
            dbid,
            name
          }
        }
      }
    `,
  },
});

class MediaHeader extends Component {
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
    return (<Relay.RootContainer Component={MediaHeaderContainer} route={route} />);
  }
}

MediaHeader.contextTypes = {
  store: React.PropTypes.object,
};

export default MediaHeader;
