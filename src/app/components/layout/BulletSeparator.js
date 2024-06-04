import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import EllipseIcon from '../../icons/ellipse.svg';
import styles from './BulletSeparator.module.css';

const BulletSeparator = ({
  icon,
  details,
  compact,
  caption,
  className,
}) => {
  const subtitleDetails = details.filter(d => !!d).map((d, index) => (
    <span key={`${d}-${Math.random()}`} className={styles.detailSpan}>
      { index > 0 ? <EllipseIcon className={styles.bullet} /> : null }
      {d}
    </span>
  ));

  return (
    <div
      className={cx(
        [styles.bulletSeparator],
        {
          [className]: true,
          [styles.compactBulletSeparator]: compact,
          [styles.captionTypography]: caption,
        })
      }
    >
      { icon ? <div className={styles.icon}>{icon}</div> : null }
      {subtitleDetails}
    </div>
  );
};

BulletSeparator.propTypes = {
  details: PropTypes.array.isRequired,
  icon: PropTypes.node,
  compact: PropTypes.bool,
  caption: PropTypes.bool,
};

BulletSeparator.defaultProps = {
  icon: null,
  compact: false,
  caption: false,
};

export default BulletSeparator;
