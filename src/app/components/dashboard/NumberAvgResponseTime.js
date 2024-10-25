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

  return (
    <NumberWidget
      color="var(--color-yellow-79)"
      itemCount={moment.duration(statistics.average_response_time, 'seconds').humanize()}
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
