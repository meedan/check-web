import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberExplainersCreated = ({ statistics }) => (
  <NumberWidget
    itemCount={statistics.number_of_explainers_created}
    title="Explainers Created"
  />
);

export default createFragmentContainer(NumberExplainersCreated, graphql`
  fragment NumberExplainersCreated_statistics on TeamStatistics {
    number_of_explainers_created
  }
`);
