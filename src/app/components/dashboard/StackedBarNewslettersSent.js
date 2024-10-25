import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const StackedBarNewslettersSent = ({ statistics }) => {
  const data = {
    sent: statistics.number_of_newsletters_sent,
    empty: statistics.number_of_newsletters_sent - statistics.number_of_newsletters_delivered || 1,
  };

  return (
    <FormattedMessage
      defaultMessage="Newsletters Sent"
      description="Title for the number of newsletters sent widget"
      id="stackedBarNewslettersSent.title"
    >
      {title => (
        <StackedBarChartWidget
          data={Object.entries(data).map(([name, value]) => ({ name, value }))}
          title={title}
        />
      )}
    </FormattedMessage>
  );
};

StackedBarNewslettersSent.propTypes = {
  statistics: PropTypes.shape({
    number_of_newsletters_delivered: PropTypes.number.isRequired,
    number_of_newsletters_sent: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(StackedBarNewslettersSent, graphql`
  fragment StackedBarNewslettersSent_statistics on TeamStatistics {
    number_of_newsletters_delivered
    number_of_newsletters_sent
  }
`);
