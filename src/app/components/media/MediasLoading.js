import React, { Component, PropTypes } from 'react';
import ContentColumn from '../layout/ContentColumn';

class MediasLoading extends Component {
  render() {
    const count = this.props.count || 3;
    var medias = [];

    for (var i = 0; i < count; i++) {
      medias.push(
        <div className="medias-loading__media">
          <div></div><div></div><div></div><div></div>
        </div>
      );
    }

    return (
      <div className="medias-loading">
        <ContentColumn>
          <div className="medias-loading__medias">
            {medias}
          </div>
        </ContentColumn>
      </div>
    );
  }
}

export default MediasLoading;
