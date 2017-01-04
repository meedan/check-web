import React, { Component, PropTypes } from 'react';
import Pusher from 'pusher-js';
import DocumentTitle from 'react-document-title';
import MediaDetail from './MediaDetail';
import MediaUtil from './MediaUtil';
import { Annotations, Tags } from '../source';
import config from 'config';
import { pageTitle } from '../../helpers';
import CheckContext from '../../CheckContext';

class MediaComponent extends Component {
  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  setCurrentContext() {
    this.props.relay.setVariables({ contextId: this.getContext().project.dbid });
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
      let id = window.location.hash.replace(/^#/, ''),
        element = document.getElementById(id);
      if (element.scrollIntoView != undefined) {
        element.scrollIntoView();
      }
    }
  }

  subscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', (data) => {
        const annotation = JSON.parse(data.message);
        if (parseInt(annotation.context_id) === that.getContext().project.dbid) {
          that.props.relay.forceFetch();
        }
      });
    }
  }

  unsubscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const media = this.props.media;
    const data = JSON.parse(media.jsondata);

    if (this.props.relay.variables.contextId === null) {
      return null;
    }

    return (
      <DocumentTitle title={pageTitle(MediaUtil.title(media, data), false, this.getContext().team)}>
        <div className="media" data-id={media.dbid}>
          <article className="media__contents">
            <MediaDetail media={media} />
            <h3 className="media__notes-heading">Verification Timeline</h3>
            <Annotations annotations={media.annotations.edges.reverse()} annotated={media} annotatedType="ProjectMedia" />
          </article>
        </div>
      </DocumentTitle>
    );
  }
}

MediaComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default MediaComponent;
