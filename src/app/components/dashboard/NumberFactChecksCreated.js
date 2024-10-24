import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberFactChecksCreated = ({ statistics }) => (
  <NumberWidget
    color="var(--color-yellow-79)"
    itemCount={statistics.number_of_fact_checks_created}
    title="Fact-Checks Created"
  />
);

export default createFragmentContainer(NumberFactChecksCreated, graphql`
  fragment NumberFactChecksCreated_statistics on TeamStatistics {
    number_of_fact_checks_created
  }
`);
