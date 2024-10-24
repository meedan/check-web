import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberConversations = ({ statistics }) => (
  <NumberWidget
    color="var(--color-blue-90)"
    itemCount={statistics.number_of_conversations}
    title="Conversations"
  />
);

export default createFragmentContainer(NumberConversations, graphql`
  fragment NumberConversations_statistics on TeamStatistics {
    number_of_conversations
  }
`);
