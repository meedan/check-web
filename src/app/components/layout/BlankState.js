import React from 'react';
import cx from 'classnames/bind';
import styles from './BlankState.module.css';

const StyledBlankState = ({ children, noMargin }) => (
  <div
    className={cx(
      [styles.blankState],
      {
        [styles.noMargin]: noMargin,
      },
    )}
  >
    {children}
  </div>
);

export default StyledBlankState;
