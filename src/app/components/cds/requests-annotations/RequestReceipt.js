import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './RequestReceipt.module.css';

const RequestReceipt = ({
  icon,
  label,
}) => {
  if (!icon || !label) {
    return null;
  }

  return (
    <div className={cx(styles['receipt-wrapper'], styles['receipt-green'])}>
      {icon}
      <span className="typography-body2">{label}</span>
    </div>
  );
};

RequestReceipt.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
};

export default RequestReceipt;
