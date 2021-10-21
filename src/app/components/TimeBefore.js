import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedRelative, injectIntl, intlShape } from 'react-intl';

function hoursDiff(date2, date1) {
  let diff = (date2.getTime() - date1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
}

const TimeBefore = ({ date, intl }) => {
  if (new Date(date).toString() === 'Invalid Date') {
    return '-';
  }
  return (
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
          { hoursDiff(new Date(), date) >= 24 ?
            date.toLocaleDateString(intl.locale, { month: 'short', year: 'numeric', day: '2-digit' }) :
            <FormattedRelative value={date} /> }
        </time>
      )}
    </FormattedDate>
  );
};

TimeBefore.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(TimeBefore);
