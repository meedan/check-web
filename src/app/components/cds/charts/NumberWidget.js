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
  contextText: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  itemCount: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  unit: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

export default NumberWidget;
