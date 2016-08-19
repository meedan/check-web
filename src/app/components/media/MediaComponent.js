import React, { Component, PropTypes } from 'react';
import MediaHeader from './MediaHeader';
import { Annotations, Tags } from '../source';

class MediaComponent extends Component {
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
