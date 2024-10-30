import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const messages = defineMessages({
  delivered: {
    defaultMessage: 'Delivered',
    description: 'Delivered newsletters',
    id: 'stackedBarNewslettersSent.delivered',
  },
});

const StackedBarNewslettersSent = ({ intl, statistics }) => {
  const data = {
    delivered: statistics.number_of_newsletters_delivered,
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
          data={Object.entries(data).map(([name, value]) => ({
            name: messages[name] ? intl.formatMessage(messages[name]) : name,
            value,
            color: name === 'delivered' ? 'var(--color-green-50)' : null,
          }))}
          title={title}
          total={statistics.number_of_newsletters_sent}
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

export default createFragmentContainer(injectIntl(StackedBarNewslettersSent), graphql`
  fragment StackedBarNewslettersSent_statistics on TeamStatistics {
    number_of_newsletters_delivered
    number_of_newsletters_sent
  }
`);
