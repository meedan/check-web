import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopArticlesTags = ({ statistics }) => {
  console.log('ListTopArticlesTags statistics:', statistics); // eslint-disable-line no-console

  return (
    <ListWidget
      items={
        Object.entries(statistics.top_articles_tags).map(([itemText, itemValue]) => ({ itemText, itemValue }))
      }
      title="Top Article Tags"
    />
  );
};

export default createFragmentContainer(ListTopArticlesTags, graphql`
  fragment ListTopArticlesTags_statistics on TeamStatistics {
    top_articles_tags
  }
`);
