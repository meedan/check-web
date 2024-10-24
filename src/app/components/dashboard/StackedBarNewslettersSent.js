import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const StackedBarNewslettersSent = ({ statistics }) => {
  const data = {
    sent: statistics.number_of_newsletters_sent,
    empty: statistics.number_of_newsletters_sent - statistics.number_of_newsletters_delivered,
  };

  return (
    <StackedBarChartWidget
      data={
        Object.entries(data).map(([name, value]) => ({ name, value }))
      }
      title="Newsletters Sent"
    />
  );
};

export default createFragmentContainer(StackedBarNewslettersSent, graphql`
  fragment StackedBarNewslettersSent_statistics on TeamStatistics {
    number_of_newsletters_delivered
    number_of_newsletters_sent
  }
`);
