import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedRelative } from 'react-intl';

const TimeBefore = ({ date }) => (
  <FormattedDate
    value={date}
    year="numeric"
    month="long"
    day="numeric"
    hour="numeric"
    minute="numeric"
  >
    {title => (
      <time dateTime={date.toISOString()} title={title}>
        <FormattedRelative value={date} />
      </time>
    )}
  </FormattedDate>
);
TimeBefore.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default TimeBefore;
