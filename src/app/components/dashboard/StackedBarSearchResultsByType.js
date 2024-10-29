import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const messages = defineMessages({
  FactCheck: {
    defaultMessage: 'Fact-Check',
    description: 'Article type: Fact-Check',
    id: 'stackedBarSearchResultsByType.FactCheck',
  },
  Explainer: {
    defaultMessage: 'Explainer',
    description: 'Article type: Explainer',
    id: 'stackedBarSearchResultsByType.Explainer',
  },
});

const StackedBarSearchResultsByType = ({ intl, statistics }) => (
  <FormattedMessage
    defaultMessage="Matched Results"
    description="Title for the number of search results by type widget"
    id="stackedBarSearchResultsByType.title"
  >
    {title => (
      <StackedBarChartWidget
        data={
          Object.entries(statistics.number_of_matched_results_by_article_type).map(([name, value]) => ({
            name: intl.formatMessage(messages[name]),
            value,
          }))
        }
        title={title}
      />
    )}
  </FormattedMessage>
);

StackedBarSearchResultsByType.propTypes = {
  statistics: PropTypes.shape({
    number_of_matched_results_by_article_type: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(injectIntl(StackedBarSearchResultsByType), graphql`
  fragment StackedBarSearchResultsByType_statistics on TeamStatistics {
    number_of_matched_results_by_article_type
  }
`);
