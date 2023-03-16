import React from 'react';
import MediaPlayerCard from '../media/MediaPlayerCard';
import AspectRatio from '../layout/AspectRatio';

const MediaPreview = ({ media }) => {
  let preview = null;
  if (
    media.type === 'UploadedVideo' ||
    media.type === 'UploadedAudio' ||
    (media.url && media.domain === 'youtube.com')) {
    const coverImage = media.thumbnail_path || '/images/player_cover.svg';
    preview = (
      <MediaPlayerCard
        filePath={media.file_path || media.url}
        coverImage={coverImage}
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

export default MediaPreview;
