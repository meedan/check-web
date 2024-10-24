import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const StackedBarSearchResultsFeedback = ({ statistics }) => (
  <StackedBarChartWidget
    data={
      Object.entries(statistics.number_of_search_results_by_type).map(([name, value]) => ({ name, value }))
    }
    title="Search Results"
  />
);

export default createFragmentContainer(StackedBarSearchResultsFeedback, graphql`
  fragment StackedBarSearchResultsFeedback_statistics on TeamStatistics {
    number_of_search_results_by_type
  }
`);
