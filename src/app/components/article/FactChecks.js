import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import FactCheckIcon from '../../icons/fact_check.svg';
import CheckArticleTypes from '../../constants/CheckArticleTypes';

const FactChecks = ({ routeParams }) => (
  <Articles
    defaultFilters={{ article_type: CheckArticleTypes.FACT_CHECK }}
    filterOptions={['users', 'tags', 'range', 'language_filter', 'published_by', 'report_status', 'verification_status', 'channels']}
    icon={<FactCheckIcon />}
    pageName="fact-checks"
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="Claim & Fact-Checks" description="Title of the fact-checks page." id="factChecks.title" />}
  />
);

FactChecks.defaultProps = {};

FactChecks.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default FactChecks;
