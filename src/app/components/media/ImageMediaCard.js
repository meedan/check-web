import React from 'react';
import AspectRatio from '../layout/AspectRatio';

const ImageMediaCard = ({
  imagePath,
  projectMedia,
}) => (
  <article className="image-media-card">
    <AspectRatio
      expandedImage={imagePath}
      downloadUrl={imagePath}
      projectMedia={projectMedia}
    >
      <div className="aspect-ratio__overlay">
        <img
          src={imagePath}
          alt=""
        />
      </div>
    </AspectRatio>
  </article>
);

export default ImageMediaCard;
