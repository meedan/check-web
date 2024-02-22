import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import EllipseIcon from '../../../icons/ellipse.svg';
import styles from './Card.module.css';

const ItemRating = ({
  rating,
  ratingColor,
  size,
  className,
}) => (rating ? (
  <div title={rating} className={cx(styles.cardTag, className)}>
    <ButtonMain
      disabled
      variant="outlined"
      size={size}
      theme="text"
      label={<span className={styles.cardTagLabel}><EllipseIcon className={styles.cardTagIcon} style={{ color: ratingColor }} />{rating}</span>}
      customStyle={{
        borderColor: ratingColor,
        color: 'var(--textPrimary)',
      }}
    />
  </div>)
  : (
    <div title={rating} className={cx(styles.cardTag, className)}>
      <ButtonMain size="small" variant="text" disabled label={<FormattedMessage id="itemRating.noFactCheck" defaultMessage="no fact-check" description="A label that appears when no fact-check is present to display." />} />
    </div>
  )
);

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
