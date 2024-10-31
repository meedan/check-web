import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import moment from 'moment';
import 'moment/locale/ar';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/id';
import 'moment/locale/mk';
import 'moment/locale/pt';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberAvgResponseTime = ({ intl, statistics }) => {
  moment.locale(intl.locale);

  // Set the rounding function to round to 2 decimal places and set the thresholds
  moment.relativeTimeRounding((t) => {
    const DIGITS = 2; // like: 2.56 minutes
    return Math.round(t * (10 ** DIGITS)) / (10 ** DIGITS);
  });
  moment.relativeTimeThreshold('y', 365);
  moment.relativeTimeThreshold('M', 12);
  moment.relativeTimeThreshold('w', 4);
  moment.relativeTimeThreshold('d', 31);
  moment.relativeTimeThreshold('h', 24);
  moment.relativeTimeThreshold('m', 60);
  moment.relativeTimeThreshold('s', 60);
  moment.relativeTimeThreshold('ss', 0);

  const value = statistics.average_response_time ?
    moment.duration(statistics.average_response_time, 'seconds').humanize() : null;

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
  intl: intlShape.isRequired,
  statistics: PropTypes.shape({
    average_response_time: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(injectIntl(NumberAvgResponseTime), graphql`
  fragment NumberAvgResponseTime_statistics on TeamStatistics {
    average_response_time
  }
`);
