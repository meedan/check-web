import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberArticlesSent = ({ statistics }) => (
  <NumberWidget
    color="var(--color-purple-92"
    itemCount={statistics.number_of_articles_sent}
    title="Articles Sent"
  />
);

export default createFragmentContainer(NumberArticlesSent, graphql`
  fragment NumberArticlesSent_statistics on TeamStatistics {
    number_of_articles_sent
  }
`);
