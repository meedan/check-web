import React from 'react';
import styles from './TeamAvatar.module.css';

const TeamAvatar = props => (
  <div
    {...props}
    className={styles['team-avatar']}
    style={{
      backgroundImage: `url(${props.team?.avatar})`,
      width: props.size ? props.size : null,
      height: props.size ? props.size : null,
    }}
  />
);

export default TeamAvatar;
