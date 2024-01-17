import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedDate } from 'react-intl';
import styles from './Card.module.css';

const ItemDate = ({
  date,
  className,
}) => (
  <div className={cx('typography-body2', styles.cardDate, className)}>
    <FormattedDate value={date * 1000} year="numeric" month="long" day="numeric" />
  </div>
);

ItemDate.defaultProps = {
  className: null,
};

ItemDate.propTypes = {
  date: PropTypes.number.isRequired, // Timestamp
  className: PropTypes.string,
};

export default ItemDate;
