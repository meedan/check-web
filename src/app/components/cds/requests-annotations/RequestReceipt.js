import React from 'react';
import cx from 'classnames/bind';
import styles from './RequestReceipt.module.css';

const RequestReceipt = ({
  icon,
  label,
}) => (
  <div className={cx(styles['receipt-wrapper'], styles['receipt-green'])}>{icon}{label}</div>
);

export default RequestReceipt;
