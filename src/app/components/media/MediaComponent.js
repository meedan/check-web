import React, { Component, PropTypes } from 'react';
import MediaDetail from './MediaDetail';
import { Annotations, Tags } from '../source';

class MediaComponent extends Component {
  setCurrentContext() {
    this.props.relay.setVariables({ contextId: Checkdesk.context.project.dbid });
  }

  componentDidMount() {
    this.setCurrentContext();
    this.scrollToAnnotation();
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
