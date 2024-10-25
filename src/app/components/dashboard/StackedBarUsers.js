import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
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
      title={
        <FormattedMessage
          defaultMessage="Users"
          description="Title for the number of users widget"
          id="stackedBarUsers.title"
        />
      }
    />
  );
};

StackedBarUsers.propTypes = {
  statistics: PropTypes.shape({
    number_of_total_users: PropTypes.number.isRequired,
    number_of_unique_users: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(StackedBarUsers, graphql`
  fragment StackedBarUsers_statistics on TeamStatistics {
    number_of_total_users
    number_of_unique_users
  }
`);
