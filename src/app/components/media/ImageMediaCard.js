import React from 'react';

const ImageMediaCard = props => (
  <article className="image-media-card" style={{ textAlign: 'center' }}>
    <img
      style={{
        width: 'auto',
        maxWidth: '100%',
      }}
      src={props.imagePath}
      alt=""
    />
  </article>);

export default ImageMediaCard;
