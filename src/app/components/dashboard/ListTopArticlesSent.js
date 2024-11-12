import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopArticlesSent = ({ statistics }) => {
  const teamSlug = window.location.pathname.split('/')[1];

  const dataArray = statistics.top_articles_sent.map(a => ({
    itemText: a.label,
    itemValue: a.value,
    itemLink: `/${teamSlug}/articles/fact-checks?factCheckId=${a.id}`,
  }));

  return (
    <ListWidget
      emptyText={
        <FormattedMessage
          defaultMessage="No articles sent"
          description="Text to display when there are no articles sent"
          id="listTopArticlesSent.emptyText"
        />
      }
      items={dataArray}
      title={
        <FormattedMessage
          defaultMessage="Top Articles Sent"
          description="Title for the top articles sent list widget"
          id="listTopArticlesSent.title"
        />
      }
    />
  );
};

ListTopArticlesSent.propTypes = {
  statistics: PropTypes.shape({
    top_articles_sent: PropTypes.array.isRequired,
  }).isRequired,
};

export default createFragmentContainer(ListTopArticlesSent, graphql`
  fragment ListTopArticlesSent_statistics on TeamStatistics {
    top_articles_sent
  }
`);
