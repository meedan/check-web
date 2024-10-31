import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberSubscribers = ({ statistics }) => (
  <NumberWidget
    color="var(--color-green-82)"
    contextText={
      <FormattedMessage
        defaultMessage="{number} new"
        description="Context caption to number of subscribers, of which how many are new"
        id="numberSubscribers.new"
        values={{ number: statistics.number_of_new_subscribers }}
      />
    }
    itemCount={statistics.number_of_subscribers}
    title={
      <FormattedMessage
        defaultMessage="Subscribers"
        description="Title for the number of subscribers widget"
        id="numberSubscribers.title"
      />
    }
  />
);

NumberSubscribers.propTypes = {
  statistics: PropTypes.shape({
    number_of_subscribers: PropTypes.number.isRequired,
    number_of_new_subscribers: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(NumberSubscribers, graphql`
  fragment NumberSubscribers_statistics on TeamStatistics {
    number_of_subscribers
    number_of_new_subscribers
  }
`);
