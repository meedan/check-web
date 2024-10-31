import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import NumberWidget from '../cds/charts/NumberWidget';

const NumberPublishedFactChecks = ({ statistics }) => (
  <NumberWidget
    color="var(--color-green-82)"
    itemCount={statistics.number_of_published_fact_checks}
    title={
      <FormattedMessage
        defaultMessage="Published Fact-Checks"
        description="Title for the number of published fact-checks widget"
        id="numberPublishedFactChecks.title"
      />
    }
  />
);

NumberPublishedFactChecks.propTypes = {
  statistics: PropTypes.shape({
    number_of_published_fact_checks: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(NumberPublishedFactChecks, graphql`
  fragment NumberPublishedFactChecks_statistics on TeamStatistics {
    number_of_published_fact_checks
  }
`);
