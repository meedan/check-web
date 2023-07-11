import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import ArrowUpwardIcon from '../../icons/arrow_upward.svg';
import ArrowDownwardIcon from '../../icons/arrow_downward.svg';

const useStyles = makeStyles(() => ({
  reorderArrow: {
    paddingTop: 2,
    paddingBottom: 2,
  },
}));

const Reorder = ({
  onMoveDown,
  onMoveUp,
  disableUp,
  disableDown,
}) => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column" width="fit-content">
      <IconButton
        className={['reorder__button-up', classes.reorderArrow].join(' ')}
        onClick={onMoveUp}
        disabled={disableUp}
      >
        <ArrowUpwardIcon style={{ fontSize: '20px' }} />
      </IconButton>
      <IconButton
        className={['reorder__button-down', classes.reorderArrow].join(' ')}
        onClick={onMoveDown}
        disabled={disableDown}
      >
        <ArrowDownwardIcon style={{ fontSize: '20px' }} />
      </IconButton>
    </Box>
  );
};

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
