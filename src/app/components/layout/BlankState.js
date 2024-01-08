import React from 'react';
import styles from './BlankState.module.css';

const StyledBlankState = props => <div className={styles.blankState}>{props.children}</div>;

export default StyledBlankState;
