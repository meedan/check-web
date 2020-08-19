import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

const Reorder = ({
  onMoveDown,
  onMoveUp,
}) => (
  <Box display="flex" flexDirection="column">
    <IconButton
      onClick={onMoveUp}
    >
      <ArrowUpwardIcon />
    </IconButton>
    <IconButton
      onClick={onMoveDown}
    >
      <ArrowDownwardIcon />
    </IconButton>
  </Box>
);

Reorder.propTypes = {
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
};

export default Reorder;
