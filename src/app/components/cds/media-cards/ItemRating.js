/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import EllipseIcon from '../../../icons/ellipse.svg';
import styles from './Card.module.css';

const ItemRating = ({
  className,
  rating,
  ratingColor,
  size,
}) => rating ? (
  <div className={cx(styles.cardTag, className)} title={rating}>
    <ButtonMain
      customStyle={{
        borderColor: ratingColor,
        color: 'var(--color-gray-15)',
      }}
      disabled
      iconLeft={<EllipseIcon style={{ color: ratingColor }} />}
      label={rating}
      size={size}
      theme="text"
      variant="outlined"
    />
  </div>
) : null;

ItemRating.defaultProps = {
  rating: '',
  ratingColor: '',
  className: null,
  size: 'default',
};

ItemRating.propTypes = {
  rating: PropTypes.string,
  ratingColor: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string,
};

export default ItemRating;
