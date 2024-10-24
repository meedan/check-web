import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const StackedBarUsers = ({ statistics }) => {
  const data = {
    unique: statistics.number_of_unique_users,
    returning: statistics.number_of_total_users - statistics.number_of_unique_users,
  };

  return (
    <StackedBarChartWidget
      data={
        Object.entries(data).map(([name, value]) => ({ name, value }))
      }
      title="Users"
    />
  );
};

export default createFragmentContainer(StackedBarUsers, graphql`
  fragment StackedBarUsers_statistics on TeamStatistics {
    number_of_total_users
    number_of_unique_users
  }
`);
