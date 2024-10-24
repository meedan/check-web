import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberAvgResponseTime = ({ statistics }) => (
  <NumberWidget
    color="var(--color-yellow-79)"
    itemCount={statistics.average_response_time}
    title="Avg. Response Time"
  />
);

export default createFragmentContainer(NumberAvgResponseTime, graphql`
  fragment NumberAvgResponseTime_statistics on TeamStatistics {
    average_response_time
  }
`);
