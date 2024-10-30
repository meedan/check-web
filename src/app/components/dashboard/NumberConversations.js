import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberConversations = ({ statistics }) => (
  <NumberWidget
    color="var(--color-blue-90)"
    itemCount={statistics.number_of_conversations}
    title={
      <FormattedMessage
        defaultMessage="Conversations"
        description="Title for the number of conversations widget"
        id="numberConversations.title"
      />
    }
  />
);

NumberConversations.propTypes = {
  statistics: PropTypes.shape({
    number_of_conversations: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(NumberConversations, graphql`
  fragment NumberConversations_statistics on TeamStatistics {
    number_of_conversations
  }
`);
