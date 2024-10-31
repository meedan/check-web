import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberExplainersCreated = ({ statistics }) => (
  <NumberWidget
    itemCount={statistics.number_of_explainers_created}
    title={
      <FormattedMessage
        defaultMessage="Explainers Created"
        description="Title for the number of explainers created widget"
        id="numberExplainersCreated.title"
      />
    }
  />
);

NumberExplainersCreated.propTypes = {
  statistics: PropTypes.shape({
    number_of_explainers_created: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(NumberExplainersCreated, graphql`
  fragment NumberExplainersCreated_statistics on TeamStatistics {
    number_of_explainers_created
  }
`);
