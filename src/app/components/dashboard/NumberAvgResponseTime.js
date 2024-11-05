import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import moment from 'moment';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberAvgResponseTime = ({ statistics }) => {
  // Rounding function to round to 2 decimal places
  const roundingFunction = (t) => {
    const DIGITS = 2; // like: 2.56 minutes
    return Math.round(t * (10 ** DIGITS)) / (10 ** DIGITS);
  };

  // Get the original rounding function and thresholds
  const originalRounding = moment.relativeTimeRounding();

  const originalThresholds = {
    M: moment.relativeTimeThreshold('M'),
    w: moment.relativeTimeThreshold('w'),
    d: moment.relativeTimeThreshold('d'),
    h: moment.relativeTimeThreshold('h'),
    m: moment.relativeTimeThreshold('m'),
    s: moment.relativeTimeThreshold('s'),
    ss: moment.relativeTimeThreshold('ss'),
  };

  // Set the custom rounding function and thresholds
  moment.relativeTimeRounding(roundingFunction);

  moment.relativeTimeThreshold('M', null);
  moment.relativeTimeThreshold('w', null);
  moment.relativeTimeThreshold('d', Infinity);
  moment.relativeTimeThreshold('h', 24);
  moment.relativeTimeThreshold('m', 60);
  moment.relativeTimeThreshold('s', 60);
  moment.relativeTimeThreshold('ss', null);

  // Format the duration using Moment's humanize function
  const value =
    statistics.average_response_time ?
      moment.duration(statistics.average_response_time, 'seconds').humanize() : null;

  // Restore the original rounding function and thresholds
  moment.relativeTimeRounding(originalRounding);

  Object.entries(originalThresholds).forEach(([key, val]) => {
    moment.relativeTimeThreshold(key, val);
  });

  return (
    <NumberWidget
      color="var(--color-yellow-79)"
      itemCount={value}
      title={
        <FormattedMessage
          defaultMessage="Avg. Response Time"
          description="Title for the average response time widget"
          id="numberAvgResponseTime.title"
        />
      }
    />
  );
};

NumberAvgResponseTime.propTypes = {
  statistics: PropTypes.shape({
    average_response_time: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(injectIntl(NumberAvgResponseTime), graphql`
  fragment NumberAvgResponseTime_statistics on TeamStatistics {
    average_response_time
  }
`);
