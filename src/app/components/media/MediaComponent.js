import React, { Component, PropTypes } from 'react';
import MediaHeader from './MediaHeader';
import { Annotations, Tags } from '../source';

class MediaComponent extends Component {
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

    return (
      <div className="media" data-id={media.dbid}>
        <MediaHeader media={media} />

        <Tags tags={media.tags.edges} annotated={media} annotatedType="Media" />

        <Annotations annotations={media.annotations.edges} annotated={media} annotatedType="Media" />
      </div>
    );
  }
}

export default MediaComponent;
