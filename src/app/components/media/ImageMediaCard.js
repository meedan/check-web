import React from 'react';
import cx from 'classnames/bind';
import AspectRatio from '../layout/AspectRatio';
import styles from '../media/MediaCardLarge.module.css';

const ImageMediaCard = ({
  currentUserRole,
  imagePath,
  projectMedia,
  superAdminMask,
}) => (
  <article className={cx('image-media-card', styles['image-media-card'])}>
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
