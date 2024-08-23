import React from 'react';
import PropTypes from 'prop-types';
import MuiTooltip from '@material-ui/core/Tooltip';
import styles from './Tooltip.module.css';

const Tooltip = props => props.title ? (
  <MuiTooltip
    classes={{ tooltip: styles.tooltip }}
    {...props}
  />
) : props.children;

Tooltip.defaultProps = {
  title: null,
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
};

export default Tooltip;
