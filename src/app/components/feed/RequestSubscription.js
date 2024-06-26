import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { FormattedDate } from 'react-intl';
import CheckIcon from '../../icons/done.svg';
import NotificationsNoneIcon from '../../icons/notifications.svg';

const useStyles = makeStyles({
  bellIcon: {
    color: 'var(--color-orange-54)',
    display: 'inline-block',
  },
  checkIcon: {
    color: 'var(--color-green-35)',
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
  lastCalledAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]), // Any value that FormattedMessage understands
};

RequestSubscription.defaultProps = {
  subscribed: false,
  lastCalledAt: null,
};

export default RequestSubscription;
