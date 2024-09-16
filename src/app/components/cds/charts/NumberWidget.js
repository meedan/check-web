import React from 'react';
import PropTypes from 'prop-types';
import styles from './NumberWidget.module.css';

const NumberWidget = ({
  contextText,
  itemCount,
  title,
  unit,
}) => (
  <div className={styles.numberWidgetWrapper}>
    <div className="typography-subtitle2">
      {title}
    </div>
    <div className={styles.numberWidgetItemCount}>
      {itemCount} <span className={styles.numberWidgetUnit}>{!itemCount || itemCount === '-' ? null : unit} </span>
    </div>
    <div className={styles.numberWidgetContextText}>
      {contextText}
    </div>
  </div>
);

NumberWidget.defaultProps = {
  contextText: null,
  itemCount: '-',
  title: null,
  unit: null,
};

NumberWidget.propTypes = {
  contextText: PropTypes.string,
  itemCount: PropTypes.string,
  title: PropTypes.string,
  unit: PropTypes.string,
};

export default NumberWidget;
