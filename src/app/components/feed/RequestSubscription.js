import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import CheckIcon from '@material-ui/icons/Check';
import { FormattedDate } from 'react-intl';

const useStyles = makeStyles({
  bellIcon: {
    color: '#E78A00',
    display: 'inline-block',
  },
  checkIcon: {
    color: '#4CAF50',
    fontWeight: 700,
    fontSize: 12,
  },
});

const RequestSubscription = ({
  subscribed,
  lastCalledAt,
}) => {
  const classes = useStyles();

  if (subscribed) {
    return (
      <Box>
        <NotificationsNoneIcon className={classes.bellIcon} />
      </Box>
    );
  }

  if (lastCalledAt) {
    return (
      <Box className={classes.checkIcon} display="flex" alignItems="center">
        <CheckIcon />
        {' '}
        <FormattedDate
          value={lastCalledAt}
          year="numeric"
          month="short"
          day="2-digit"
        />
      </Box>
    );
  }

  return null;
};

RequestSubscription.propTypes = {
  subscribed: PropTypes.bool,
  lastCalledAt: PropTypes.string,
};

RequestSubscription.defaultProps = {
  subscribed: false,
  lastCalledAt: null,
};

export default RequestSubscription;
