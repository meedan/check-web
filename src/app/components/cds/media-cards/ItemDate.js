/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedDate } from 'react-intl';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import styles from './Card.module.css';

const ItemDate = ({
  className,
  date,
  tooltipLabel,
}) => {
  if (!date) return null;

  const formatTooltip = () => (
    <>
      <span>{tooltipLabel}:</span>
      <ul>
        <li>{Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)}</li>
        <li>{Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(date)}</li>
      </ul>
    </>
  );

  return (
    <Tooltip
      arrow
      placement="top"
      title={formatTooltip(date)}
    >
      <div className={cx('typography-body2', styles.cardDate, className)}>
        <FormattedDate day="numeric" month="long" value={date} year="numeric" />
      </div>
    </Tooltip>
  );
};

ItemDate.defaultProps = {
  className: null,
  tooltipLabel: '',
};

ItemDate.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired, // Timestamp
  className: PropTypes.string,
  tooltipLabel: PropTypes.object,
};

export default ItemDate;
