import React, { Component } from 'react';

class ImageMediaCard extends Component {
  render() {
    return (
      <article className="image-media-card">
        <img src={this.props.imagePath} alt="" />
      </article>
    );
  }
}

export default ImageMediaCard;
