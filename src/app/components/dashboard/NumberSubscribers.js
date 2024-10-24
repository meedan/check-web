import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberSubscribers = ({ statistics }) => (
  <NumberWidget
    color="var(--color-green-82)"
    itemCount={statistics.number_of_subscribers}
    title="Subscribers"
  />
);

export default createFragmentContainer(NumberSubscribers, graphql`
  fragment NumberSubscribers_statistics on TeamStatistics {
    number_of_subscribers
  }
`);
