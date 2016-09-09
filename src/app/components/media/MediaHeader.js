import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MediaRoute from '../../relay/MediaRoute';
import Caret from '../Caret';
import MediaMetadataSummary from './MediaMetadataSummary';

class MediaHeaderComponent extends Component {
  setCurrentContext() {
    this.props.relay.setVariables({ contextId: Checkdesk.currentProject.dbid });
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
    const title = data.title; // TODO: revisit definition of media title

    return (
      <div className='media-header'>
        <Caret left={true} />
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
        jsondata,
        last_status,
        annotations_count,
        domain,
        user {
          name,
          source {
            dbid
          }
        }
        tags(first: 20, context_id: $contextId) {
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
    console.log(this.props.params);
    console.log(this.props);
    var route = new MediaRoute({ mediaId: this.props.params.mediaId });
    return (<Relay.RootContainer Component={MediaHeaderContainer} route={route} />);
  }
}

export default MediaHeader;
