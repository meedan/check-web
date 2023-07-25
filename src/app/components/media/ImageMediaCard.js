import React from 'react';
import AspectRatio from '../layout/AspectRatio';

const ImageMediaCard = ({
  imagePath,
  projectMedia,
  currentUserRole,
  superAdminMask,
}) => (
  <article className="image-media-card">
    <AspectRatio
      expandedImage={imagePath}
      downloadUrl={imagePath}
      projectMedia={projectMedia}
      currentUserRole={currentUserRole}
      superAdminMask={superAdminMask}
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
