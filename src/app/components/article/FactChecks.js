import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import FactCheckIcon from '../../icons/fact_check.svg';

const FactChecks = ({ routeParams }) => (
  <Articles
    filterOptions={['users', 'tags', 'range', 'language_filter', 'published_by', 'report_status', 'verification_status']}
    icon={<FactCheckIcon />}
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="Claim & Fact-Checks" description="Title of the fact-checks page." id="factChecks.title" />}
    type="fact-check"
  />
);

FactChecks.defaultProps = {};

FactChecks.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default FactChecks;
