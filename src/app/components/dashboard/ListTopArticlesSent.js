import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopArticlesSent = ({ statistics }) => (
  <ListWidget
    emptyText={
      <FormattedMessage
        defaultMessage="No articles sent"
        description="Text to display when there are no articles sent"
        id="listTopArticlesSent.emptyText"
      />
    }
    items={
      Object.entries(statistics.top_articles_sent).map(([itemText, itemValue]) => ({ itemText, itemValue }))
    }
    title={
      <FormattedMessage
        defaultMessage="Top Articles Sent"
        description="Title for the top articles sent list widget"
        id="listTopArticlesSent.title"
      />
    }
  />
);

ListTopArticlesSent.propTypes = {
  statistics: PropTypes.shape({
    top_articles_sent: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(ListTopArticlesSent, graphql`
  fragment ListTopArticlesSent_statistics on TeamStatistics {
    top_articles_sent
  }
`);
