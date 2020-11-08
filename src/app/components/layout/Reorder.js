import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

const Reorder = ({
  onMoveDown,
  onMoveUp,
  disableUp,
  disableDown,
}) => (
  <Box display="flex" flexDirection="column" width="fit-content">
    <IconButton
      className="reorder__button-up"
      onClick={onMoveUp}
      disabled={disableUp}
    >
      <ArrowUpwardIcon />
    </IconButton>
    <IconButton
      className="reorder__button-down"
      onClick={onMoveDown}
      disabled={disableDown}
    >
      <ArrowDownwardIcon />
    </IconButton>
  </Box>
);

Reorder.defaultProps = {
  disableUp: false,
  disableDown: false,
};

Reorder.propTypes = {
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  disableUp: PropTypes.bool,
  disableDown: PropTypes.bool,
};

export default Reorder;
