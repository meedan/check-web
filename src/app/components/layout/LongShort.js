import React from 'react';
import styles from './LongShort.module.css';

const LongShort = props => (
  <p
    className={styles.longShort}
    style={{
      WebkitLineClamp: props.showAll ? null : props.maxLines,
      maxHeight: props.showAll ? null : `${props.maxLines * 20}px`,
    }}
  >
    {props.children}
  </p>
);

export default LongShort;
