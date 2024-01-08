import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import EllipseIcon from '../../../icons/ellipse.svg';
import styles from './Card.module.css';

const ItemRating = ({
  rating,
  ratingColor,
  className,
}) => (
  <div title={rating} className={cx(styles.cardTag, className)}>
    <ButtonMain
      disabled
      variant="outlined"
      size="default"
      theme="text"
      label={<span className={styles.cardTagLabel}><EllipseIcon className={styles.cardTagIcon} style={{ color: ratingColor }} />{rating}</span>}
      customStyle={{
        borderColor: ratingColor,
        color: 'var(--textPrimary)',
      }}
    />
  </div>
);

ItemRating.defaultProps = {
  className: null,
};

ItemRating.propTypes = {
  rating: PropTypes.string.isRequired,
  ratingColor: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ItemRating;
