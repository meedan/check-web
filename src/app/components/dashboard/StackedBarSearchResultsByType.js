import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const StackedBarSearchResultsByType = ({ statistics }) => {
  console.log('StackedBarSearchResultsByType statistics:', statistics.number_of_search_results_by_type); // eslint-disable-line no-console

  return (
    <StackedBarChartWidget
      data={
        Object.entries(statistics.number_of_search_results_by_type).map(([name, value]) => ({ name, value }))
      }
      title="Matched Results"
    />
  );
};

export default createFragmentContainer(StackedBarSearchResultsByType, graphql`
  fragment StackedBarSearchResultsByType_statistics on TeamStatistics {
    number_of_search_results_by_type
  }
`);
