import React from 'react';
import styles from './BlankState.module.css';

const StyledBlankState = props => <div className={['typography-h6', styles.blankState].join(' ')}>{props.children}</div>;

export default StyledBlankState;
