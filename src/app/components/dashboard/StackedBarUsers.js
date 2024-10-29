import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const messages = defineMessages({
  unique: {
    defaultMessage: 'Unique',
    description: 'Unique users',
    id: 'stackedBarUsers.unique',
  },
  returning: {
    defaultMessage: 'Returning',
    description: 'Returning users',
    id: 'stackedBarUsers.returning',
  },
});

const StackedBarUsers = ({ intl, statistics }) => {
  const data = {
    unique: statistics.number_of_unique_users,
    returning: statistics.number_of_total_users - statistics.number_of_unique_users,
  };

  return (
    <FormattedMessage
      defaultMessage="Users"
      description="Title for the number of users widget"
      id="stackedBarUsers.title"
    >
      {title => (
        <StackedBarChartWidget
          data={Object.entries(data).map(([name, value]) => ({
            name: intl.formatMessage(messages[name]),
            value,
          }))}
          title={title}
        />
      )}
    </FormattedMessage>
  );
};

StackedBarUsers.propTypes = {
  statistics: PropTypes.shape({
    number_of_total_users: PropTypes.number.isRequired,
    number_of_unique_users: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(injectIntl(StackedBarUsers), graphql`
  fragment StackedBarUsers_statistics on TeamStatistics {
    number_of_total_users
    number_of_unique_users
  }
`);
