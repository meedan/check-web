import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';

const RequestSubscription = ({
  subscribed,
  lastCalledAt,
}) => {
  if (subscribed) {
    return 'Bell Icon';
  }

  if (lastCalledAt) {
    return (
      <FormattedDate
        value={lastCalledAt}
        year="numeric"
        month="short"
        day="2-digit"
      />
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
