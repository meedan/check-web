import React from 'react';
import AspectRatio from '../layout/AspectRatio';

const ImageMediaCard = ({
  currentUserRole,
  imagePath,
  projectMedia,
  superAdminMask,
}) => (
  <article className="image-media-card">
    <AspectRatio
      currentUserRole={currentUserRole}
      downloadUrl={imagePath}
      expandedImage={imagePath}
      projectMedia={projectMedia}
      superAdminMask={superAdminMask}
    >
      <div className="aspect-ratio__overlay">
        <img
          alt=""
          src={imagePath}
        />
      </div>
    </AspectRatio>
  </article>
);

export default ImageMediaCard;
