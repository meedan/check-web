import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import VerticalBarChartWidget from '../cds/charts/VerticalBarChartWidget';

const VerticalBarFactChecksByRating = ({ statistics }) => (
  <VerticalBarChartWidget
    data={
      Object.entries(statistics.number_of_fact_checks_by_rating).map(([name, value]) => ({ name, value }))
    }
    title={
      <FormattedMessage
        defaultMessage="Claim & Fact-Checks"
        description="Title for the number of fact-checks by rating widget"
        id="verticalBarFactChecksByRating.title"
      />
    }
  />
);

VerticalBarFactChecksByRating.propTypes = {
  statistics: PropTypes.shape({
    number_of_fact_checks_by_rating: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(VerticalBarFactChecksByRating, graphql`
  fragment VerticalBarFactChecksByRating_statistics on TeamStatistics {
    number_of_fact_checks_by_rating
  }
`);
