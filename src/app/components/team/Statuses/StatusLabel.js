import React from 'react';
import PropTypes from 'prop-types';
import IconEllipse from '../../../icons/ellipse.svg';
import styles from './Statuses.module.css';

const StatusLabel = props => (
  <h6 className={styles['status-label']}>
    <IconEllipse style={{ color: props.color }} />
    {props.children}
  </h6>
);

StatusLabel.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StatusLabel;
