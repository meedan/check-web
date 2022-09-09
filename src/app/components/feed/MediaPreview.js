import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import MediaPlayerCard from '../media/MediaPlayerCard';
import AspectRatio from '../layout/AspectRatio';

const MediaPreview = ({ media }) => {
  let preview = null;
  if (media.url && media.domain === 'youtube.com') {
    preview = (
      <MediaPlayerCard
        filePath={media.url}
      />
    );
  } else if (media.picture) {
    preview = (
      <AspectRatio>
        <img src={media.picture} alt="" onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} />
      </AspectRatio>
    );
  }

  return (
    <div className="media-preview">
      {preview}
    </div>
  );
};

export default createFragmentContainer(MediaPreview, graphql`
  fragment MediaPreview_media on Media {
    domain
    picture
    url
  }
`);
