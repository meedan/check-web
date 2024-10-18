import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import VerticalBarChartWidget from '../cds/charts/VerticalBarChartWidget';

const VerticalBarFactChecksByRating = ({ statistics }) => {
  console.log('VerticalBarFactChecksByRating statistics:', statistics.number_of_fact_checks_by_rating); // eslint-disable-line no-console

  return (
    <VerticalBarChartWidget
      data={
        Object.entries(statistics.number_of_fact_checks_by_rating).map(([name, value]) => ({ name, value }))
      }
      title="Claim & Fact-Checks"
    />
  );
};

export default createFragmentContainer(VerticalBarFactChecksByRating, graphql`
  fragment VerticalBarFactChecksByRating_statistics on TeamStatistics {
    number_of_fact_checks_by_rating
  }
`);
