import React from 'react';
import PropTypes from 'prop-types';
import styles from './NumberWidget.module.css';

const NumberWidget = ({
  color,
  contextText,
  itemCount,
  title,
  unit,
}) => (
  <div className={styles.numberWidgetWrapper} style={{ backgroundColor: color }}>
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
  color: 'var(--color-blue-90)',
  contextText: null,
  itemCount: '-',
  unit: null,
};

NumberWidget.propTypes = {
  color: PropTypes.string,
  contextText: PropTypes.node,
  itemCount: PropTypes.string,
  title: PropTypes.node.isRequired,
  unit: PropTypes.node,
};

export default NumberWidget;
