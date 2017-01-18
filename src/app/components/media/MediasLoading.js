import React, { Component, PropTypes } from 'react';
import ContentColumn from '../layout/ContentColumn';

class MediasLoading extends Component {
  render() {
    return (
      <div className="medias-loading">
        <ContentColumn>
          <div className="medias-loading__medias">
            <div className="medias-loading__media">
              <div></div><div></div><div></div><div></div>
            </div>
            <div className="medias-loading__media">
              <div></div><div></div><div></div><div></div>
            </div>
            <div className="medias-loading__media">
              <div></div><div></div><div></div><div></div>
            </div>
          </div>
        </ContentColumn>
      </div>
    );
  }
}

export default MediasLoading;
