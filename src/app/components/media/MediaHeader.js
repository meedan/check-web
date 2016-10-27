import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MediaRoute from '../../relay/MediaRoute';
import Caret from '../Caret';
import MediaMetadataSummary from './MediaMetadataSummary';
import util from './MediaUtil';

class MediaHeaderComponent extends Component {
  setCurrentContext() {
    this.props.relay.setVariables({ contextId: Checkdesk.context.project.dbid });
  }

  componentDidMount() {
    this.setCurrentContext();
  }

  componentDidUpdate() {
    this.setCurrentContext();
  }

  render() {
    const media = this.props.media;
    const data = JSON.parse(media.jsondata);
    const title = util.title(media, data);

    return (
      <div className='media-header'>
        <div className='media-header__copy'>
          <h1 className='media-header__title'>{title}</h1>
          <MediaMetadataSummary media={media} data={data} />
        </div>
      </div>
    );
  }
}

const MediaHeaderContainer = Relay.createContainer(MediaHeaderComponent, {
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
        verification_statuses,
        domain,
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

class MediaHeader extends Component {
  render() {
    var projectId = 0;
    if (Checkdesk.context.project) {
      projectId = Checkdesk.context.project.dbid;
    }
    var route = new MediaRoute({ ids: this.props.params.mediaId + ',' + projectId });
    return (<Relay.RootContainer Component={MediaHeaderContainer} route={route} />);
  }
}

export default MediaHeader;
