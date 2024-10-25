import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberFactChecksCreated = ({ statistics }) => (
  <NumberWidget
    color="var(--color-yellow-79)"
    itemCount={statistics.number_of_fact_checks_created}
    title={
      <FormattedMessage
        defaultMessage="Fact-Checks Created"
        description="Title for the number of fact-checks created widget"
        id="numberFactChecksCreated.title"
      />
    }
  />
);

NumberFactChecksCreated.propTypes = {
  statistics: PropTypes.shape({
    number_of_fact_checks_created: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(NumberFactChecksCreated, graphql`
  fragment NumberFactChecksCreated_statistics on TeamStatistics {
    number_of_fact_checks_created
  }
`);
