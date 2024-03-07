import React from 'react';
import PropTypes from 'prop-types';
import MediaTypeDisplayIcon from './MediaTypeDisplayIcon';
import BulletSeparator from '../layout/BulletSeparator';
import styles from './media.module.css';

const MediaSlug = ({
  mediaType,
  slug,
  details,
}) => (
  <div className={styles['media-slug']}>
    <div className={styles['media-slug-title']}>
      <MediaTypeDisplayIcon mediaType={mediaType} />
      <h6>{slug}</h6>
    </div>
    <BulletSeparator compact details={details} />
  </div>
);

MediaSlug.propTypes = {
  mediaType: PropTypes.string.isRequired,
  slug: PropTypes.any.isRequired,
  details: PropTypes.array.isRequired,
};

export default MediaSlug;
