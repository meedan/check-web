import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberExplainersCreated = ({ statistics }) => {
  console.log('NumberExplainersCreated statistics:', statistics); // eslint-disable-line no-console

  return (
    <NumberWidget itemCount={statistics.number_of_explainers_created} title="Explainers Created" />
  );
};

export default createFragmentContainer(NumberExplainersCreated, graphql`
  fragment NumberExplainersCreated_statistics on TeamStatistics {
    number_of_explainers_created
  }
`);
