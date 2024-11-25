import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import BulletSeparator from '../layout/BulletSeparator';
import styles from './media.module.css';

const MediaSlug = ({
  className,
  details,
}) => (
  <div className={cx(styles['media-slug'], { [className]: true })}>
    <BulletSeparator className={styles['media-slug-bullets']} compact details={details} />
  </div>
);

MediaSlug.defaultProps = {
  className: null,
};

MediaSlug.propTypes = {
  className: PropTypes.string,
  details: PropTypes.array.isRequired,
};

export default MediaSlug;
