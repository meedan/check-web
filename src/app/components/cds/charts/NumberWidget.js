import React from 'react';
import PropTypes from 'prop-types';
import styles from './NumberWidget.module.css';

const getDisplayValue = (itemCount) => {
  const stringValue = String(itemCount);

  if (stringValue === 'null') {
    return '-';
  }

  return stringValue;
};

const NumberWidget = ({
  color,
  contextText,
  itemCount,
  title,
  unit,
}) => {
  const displayValue = getDisplayValue(itemCount);

  return (
    <div className={styles.numberWidgetWrapper} style={{ backgroundColor: color }}>
      <div className={styles.numberWidgetTitle}>
        {title}
      </div>
      <div className={styles.numberWidgetItemCount}>
        { displayValue } { unit && displayValue !== '-' && <span className={styles.numberWidgetUnit}>{unit}</span> }
      </div>
      { contextText &&
      <div className={styles.numberWidgetContextText}>
        {contextText}
      </div>
      }
    </div>
  );
};

NumberWidget.defaultProps = {
  color: 'var(--color-blue-90)',
  contextText: null,
  itemCount: null,
  unit: null,
};

NumberWidget.propTypes = {
  color: PropTypes.string,
  contextText: PropTypes.node,
  itemCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.node.isRequired,
  unit: PropTypes.node,
};

export { getDisplayValue };
export default NumberWidget;
