import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { getStatus, getStatusStyle } from '../../helpers';
import VerticalBarChartWidget from '../cds/charts/VerticalBarChartWidget';


const VerticalBarFactChecksByRating = ({ language, statistics, team }) => (
  <FormattedMessage
    defaultMessage="Claim & Fact-Checks"
    description="Title for the number of fact-checks by rating widget"
    id="verticalBarFactChecksByRating.title"
  >
    {title => (
      <VerticalBarChartWidget
        data={
          Object.entries(statistics.number_of_fact_checks_by_rating).map(([name, value]) => ({
            name: getStatus(team.verification_statuses, name, language).label,
            value,
            color: getStatusStyle(getStatus(team.verification_statuses, name), 'color'),
          }))
        }
        title={title}
      />
    )}
  </FormattedMessage>
);

VerticalBarFactChecksByRating.propTypes = {
  language: PropTypes.string.isRequired,
  statistics: PropTypes.shape({
    number_of_fact_checks_by_rating: PropTypes.object.isRequired,
  }).isRequired,
  team: PropTypes.shape({
    verification_statuses: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  }).isRequired,
};

export default createFragmentContainer(VerticalBarFactChecksByRating, graphql`
  fragment VerticalBarFactChecksByRating_team on Team {
    verification_statuses
  }
  fragment VerticalBarFactChecksByRating_statistics on TeamStatistics {
    number_of_fact_checks_by_rating
  }
`);
