import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StackedBarChartWidget from '../cds/charts/StackedBarChartWidget';

const StackedBarSearchResultsByType = ({ statistics }) => (
  <FormattedMessage
    defaultMessage="Matched Results"
    description="Title for the number of search results by type widget"
    id="stackedBarSearchResultsByType.title"
  >
    {title => (
      <StackedBarChartWidget
        data={
          Object.entries(statistics.number_of_search_results_by_type).map(([name, value]) => ({ name, value }))
        }
        title={title}
      />
    )}
  </FormattedMessage>
);

StackedBarSearchResultsByType.propTypes = {
  statistics: PropTypes.shape({
    number_of_search_results_by_type: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(StackedBarSearchResultsByType, graphql`
  fragment StackedBarSearchResultsByType_statistics on TeamStatistics {
    number_of_search_results_by_type
  }
`);
