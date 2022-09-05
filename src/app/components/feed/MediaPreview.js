import React from 'react';
import AspectRatio from '../layout/AspectRatio';

const MediaPreview = ({ media }) => (
  <div className="media-preview">
    { media.picture ?
      <AspectRatio>
        <img src={media.picture} alt="" onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} />
      </AspectRatio> : null
    }
  </div>
);

export default MediaPreview;
