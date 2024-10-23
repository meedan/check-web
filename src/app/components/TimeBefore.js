import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedRelative, injectIntl, intlShape } from 'react-intl';

function hoursDiff(date2, date1) {
  let diff = (date2.getTime() - date1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
}

const TimeBefore = ({ date, includeTime, intl }) => {
  if (new Date(date).toString() === 'Invalid Date') {
    return '-';
  }

  const dateOptions = includeTime
    ? {
      month: 'short', year: 'numeric', day: '2-digit', hour: 'numeric', minute: 'numeric',
    }
    : { month: 'short', year: 'numeric', day: '2-digit' };
  return (
    <FormattedDate
      day="numeric"
      hour="numeric"
      minute="numeric"
      month="long"
      value={date}
      year="numeric"
    >
      {title => (
        <time dateTime={date.toISOString()} title={title}>
          { hoursDiff(new Date(), date) >= 24 ?
            date.toLocaleDateString(intl.locale, dateOptions) :
            <FormattedRelative value={date} /> }
        </time>
      )}
    </FormattedDate>
  );
};

TimeBefore.defaultProps = {
  includeTime: false,
};

TimeBefore.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  includeTime: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(TimeBefore);
