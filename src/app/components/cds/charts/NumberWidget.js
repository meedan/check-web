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
    <div className={styles.numberWidgetTitle}>
      {title}
    </div>
    <div className={styles.numberWidgetItemCount}>
      { itemCount || '-' } { unit && itemCount !== '-' && itemCount !== null && <span className={styles.numberWidgetUnit}>{unit}</span> }
    </div>
    { contextText &&
      <div className={styles.numberWidgetContextText}>
        {contextText}
      </div>
    }
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
