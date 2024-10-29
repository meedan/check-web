import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopArticlesTags = ({ statistics }) => (
  <ListWidget
    emptyText={
      <FormattedMessage
        defaultMessage="No article tags"
        description="Text to display when there are no article tags"
        id="listTopArticlesTags.emptyText"
      />
    }
    items={
      Object.entries(statistics.top_articles_tags).map(([itemText, itemValue]) => ({ itemText, itemValue }))
    }
    title={
      <FormattedMessage
        defaultMessage="Top Article Tags"
        description="Title for the top article tags list widget"
        id="listTopArticlesTags.title"
      />
    }
  />
);

ListTopArticlesTags.propTypes = {
  statistics: PropTypes.shape({
    top_articles_tags: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(ListTopArticlesTags, graphql`
  fragment ListTopArticlesTags_statistics on TeamStatistics {
    top_articles_tags
  }
`);
