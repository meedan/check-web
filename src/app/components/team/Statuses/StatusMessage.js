import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import CommentIcon from '@material-ui/icons/Comment';
import { black32 } from '../../../styles/js/shared';

const useStyles = makeStyles(() => ({
  statusMessageText: {
    fontSize: 12,
    opacity: 0.7,
  },
  statusMessageIcon: {
    color: black32,
  },
}));

const StatusMessage = ({ message }) => {
  const classes = useStyles();

  if (!message) {
    return null;
  }

  return (
    <Box display="flex" alignItems="flex-start" mt={1} className="status-message">
      <CommentIcon className={classes.statusMessageIcon} />
      <Box className={classes.statusMessageText} ml={1}>
        {message}
      </Box>
    </Box>
  );
};

StatusMessage.defaultProps = {
  message: null,
};

StatusMessage.propTypes = {
  message: PropTypes.string,
};

export default StatusMessage;
