/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import MediaTypeDisplayIcon from './MediaTypeDisplayIcon';
import BulletSeparator from '../layout/BulletSeparator';
import styles from './media.module.css';

const MediaSlug = ({
  className,
  details,
  mediaType,
  slug,
}) => (
  <div className={cx(styles['media-slug'], { [className]: true })}>
    <div className={styles['media-slug-title']}>
      <MediaTypeDisplayIcon mediaType={mediaType} />
      <h6>{slug}</h6>
    </div>
    <BulletSeparator className={styles['media-slug-bullets']} compact details={details} />
  </div>
);

MediaSlug.defaultProps = {
  className: null,
};

MediaSlug.propTypes = {
  className: PropTypes.string,
  mediaType: PropTypes.string.isRequired,
  slug: PropTypes.any.isRequired,
  details: PropTypes.array.isRequired,
};

export default MediaSlug;
