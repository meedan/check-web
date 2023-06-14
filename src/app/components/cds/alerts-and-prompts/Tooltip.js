import React from 'react';
import PropTypes from 'prop-types';
import MuiTooltip from '@material-ui/core/Tooltip';
import styles from './Tooltip.module.css';

const Tooltip = props => (
  <MuiTooltip
    classes={{ tooltip: styles.tooltip }}
    {...props}
  />
);

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
};

export default Tooltip;
