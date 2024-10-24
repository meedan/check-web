import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import VerticalBarChartWidget from '../cds/charts/VerticalBarChartWidget';

const VerticalBarFactChecksByRating = ({ statistics }) => (
  <VerticalBarChartWidget
    data={
      Object.entries(statistics.number_of_fact_checks_by_rating).map(([name, value]) => ({ name, value }))
    }
    title="Claim & Fact-Checks"
  />
);

export default createFragmentContainer(VerticalBarFactChecksByRating, graphql`
  fragment VerticalBarFactChecksByRating_statistics on TeamStatistics {
    number_of_fact_checks_by_rating
  }
`);
