import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopArticlesSent = ({ statistics }) => {
  console.log('ListTopArticlesSent statistics:', statistics); // eslint-disable-line no-console

  return (
    <ListWidget
      items={
        Object.entries(statistics.top_articles_sent).map(([itemText, itemValue]) => ({ itemText, itemValue }))
      }
      title="Top Explainers Sent"
    />
  );
};

export default createFragmentContainer(ListTopArticlesSent, graphql`
  fragment ListTopArticlesSent_statistics on TeamStatistics {
    top_articles_sent
  }
`);
