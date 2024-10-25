import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberArticlesSent = ({ statistics }) => (
  <NumberWidget
    color="var(--color-purple-92"
    itemCount={statistics.number_of_articles_sent}
    title={
      <FormattedMessage
        defaultMessage="Articles Sent"
        description="Title for the number of articles sent widget"
        id="numberArticlesSent.title"
      />
    }
  />
);

NumberArticlesSent.propTypes = {
  statistics: PropTypes.shape({
    number_of_articles_sent: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(NumberArticlesSent, graphql`
  fragment NumberArticlesSent_statistics on TeamStatistics {
    number_of_articles_sent
  }
`);
