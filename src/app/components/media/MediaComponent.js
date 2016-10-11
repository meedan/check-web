import React, { Component, PropTypes } from 'react';
import Pusher from 'pusher-js';
import MediaDetail from './MediaDetail';
import { Annotations, Tags } from '../source';
import config from 'config';

class MediaComponent extends Component {
  setCurrentContext() {
    this.props.relay.setVariables({ contextId: Checkdesk.context.project.dbid });
  }

  componentDidMount() {
    this.setCurrentContext();
    this.scrollToAnnotation();
    this.subscribe();
  }

  componentDidUpdate() {
    this.setCurrentContext();
    this.scrollToAnnotation();
  }

  scrollToAnnotation() {
    if (window.location.hash != '') {
      var id = window.location.hash.replace(/^#/, ''),
          element = document.getElementById(id);
      if (element.scrollIntoView != undefined) {
        element.scrollIntoView();
      }
    }
  }

  subscribe() {
    if (config.pusherKey) {
      const that = this;
      Pusher.logToConsole = !!config.pusherDebug;
      const pusher = new Pusher(config.pusherKey, { encrypted: true });
      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', function(data) {
        var annotation = JSON.parse(data.message);
        if (parseInt(annotation.context_id) === Checkdesk.context.project.dbid) {
          that.props.relay.forceFetch();
        }
      });
    }
  }

  render() {
    const media = this.props.media;

    return (
      <div className="media" data-id={media.dbid}>
        <article className='media__contents'>

          <MediaDetail media={media} />
          <Tags tags={media.tags.edges} annotated={media} annotatedType="Media" />
          <h3 className='media__notes-heading'>Verification Timeline</h3>
          <Annotations annotations={media.annotations.edges.reverse()} annotated={media} annotatedType="Media" />

        </article>
      </div>
    );
  }
}

export default MediaComponent;
