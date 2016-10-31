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
    if (window.Checkdesk.pusher) {
      const that = this;
      window.Checkdesk.pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', function(data) {
        var annotation = JSON.parse(data.message);
        if (parseInt(annotation.context_id) === Checkdesk.context.project.dbid) {
          that.props.relay.forceFetch();
        }
      });
    }
  }

  unsubscribe() {
    if (window.Checkdesk.pusher) {
      window.Checkdesk.pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const media = this.props.media;

    if (this.props.relay.variables.contextId === null) {
      return null;
    }

    return (
      <div className="media" data-id={media.dbid}>
        <article className='media__contents'>

          <MediaDetail media={media} />
          <h3 className='media__notes-heading'>Verification Timeline</h3>
          <Annotations annotations={media.annotations.edges.reverse()} annotated={media} annotatedType="Media" />

        </article>
      </div>
    );
  }
}

export default MediaComponent;
