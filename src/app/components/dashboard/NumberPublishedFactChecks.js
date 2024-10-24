import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberPublishedFactChecks = ({ statistics }) => (
  <NumberWidget
    color="var(--color-green-82)"
    itemCount={statistics.number_of_published_fact_checks}
    title="Published Fact-Checks"
  />
);

export default createFragmentContainer(NumberPublishedFactChecks, graphql`
  fragment NumberPublishedFactChecks_statistics on TeamStatistics {
    number_of_published_fact_checks
  }
`);
