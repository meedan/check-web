import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const messages = defineMessages({
  Positive: {
    defaultMessage: 'Positive',
    description: 'Feedback type: Positive',
    id: 'stackedBarSearchResultsFeedback.positive',
  },
  Negative: {
    defaultMessage: 'Negative',
    description: 'Feedback type: Negative',
    id: 'stackedBarSearchResultsFeedback.negative',
  },
  'No Response': {
    defaultMessage: 'No Response',
    description: 'Feedback type: No Response',
    id: 'stackedBarSearchResultsFeedback.noResponse',
  },
});

const colors = {
  Positive: 'var(--color-green-50)',
  Negative: 'var(--color-pink-53)',
  'No Response': 'var(--color-blue-54)',
};

const StackedBarSearchResultsFeedback = ({ intl, statistics }) => (
  <FormattedMessage
    defaultMessage="Search Results"
    description="Title for the number of search results by type widget"
    id="stackedBarSearchResultsFeedback.title"
  >
    {title => (
      <StackedBarChartWidget
        data={
          Object.entries(statistics.number_of_search_results_by_feedback_type).map(([name, value]) => ({
            name: intl.formatMessage(messages[name]),
            value,
            color: colors[name],
          }))
        }
        title={title}
      />
    )}
  </FormattedMessage>
);

StackedBarSearchResultsFeedback.propTypes = {
  statistics: PropTypes.shape({
    number_of_search_results_by_feedback_type: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(injectIntl(StackedBarSearchResultsFeedback), graphql`
  fragment StackedBarSearchResultsFeedback_statistics on TeamStatistics {
    number_of_search_results_by_feedback_type
  }
`);
