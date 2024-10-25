import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const StackedBarSearchResultsFeedback = ({ statistics }) => (
  <FormattedMessage
    defaultMessage="Search Results"
    description="Title for the number of search results by type widget"
    id="stackedBarSearchResultsFeedback.title"
  >
    {title => (
      <StackedBarChartWidget
        data={
          Object.entries(statistics.number_of_search_results_by_type).map(([name, value]) => ({ name, value }))
        }
        title={title}
      />
    )}
  </FormattedMessage>
);

StackedBarSearchResultsFeedback.propTypes = {
  statistics: PropTypes.shape({
    number_of_search_results_by_type: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(StackedBarSearchResultsFeedback, graphql`
  fragment StackedBarSearchResultsFeedback_statistics on TeamStatistics {
    number_of_search_results_by_type
  }
`);
