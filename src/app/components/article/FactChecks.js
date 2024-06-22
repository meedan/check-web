import React from 'react';
import { graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import FactCheckIcon from '../../icons/fact_check.svg';
import Articles from './Articles';

const messages = defineMessages({
  sortTitle: {
    id: 'factChecks.sortTitle',
    defaultMessage: 'Title',
    description: 'Label for sort criteria option displayed in a drop-down in the fact-checks page.',
  },
  sortLanguage: {
    id: 'factChecks.sortLanguage',
    defaultMessage: 'Language',
    description: 'Label for sort criteria option displayed in a drop-down in the fact-checks page.',
  },
  sortDate: {
    id: 'factChecks.sortDate',
    defaultMessage: 'Updated (date)',
    description: 'Label for sort criteria option displayed in a drop-down in the fact-checks page.',
  },
});

const FactChecks = ({ routeParams, intl }) => {
  const sortOptions = [
    { value: 'title', label: intl.formatMessage(messages.sortTitle) },
    { value: 'language', label: intl.formatMessage(messages.sortLanguage) },
    { value: 'updated_at', label: intl.formatMessage(messages.sortDate) },
  ];

  const updateMutation = graphql`
    mutation FactChecksUpdateFactCheckMutation($input: UpdateFactCheckInput!) {
      updateFactCheck(input: $input) {
        fact_check {
          id
          tags
        }
      }
    }
  `;

  return (
    <Articles
      type="fact-check"
      title={<FormattedMessage id="factChecks.title" defaultMessage="Claim & Fact-checks" description="Title of the fact-checks page." />}
      icon={<FactCheckIcon />}
      teamSlug={routeParams.team}
      sortOptions={sortOptions}
      filterOptions={['users', 'tags', 'range', 'language_filter', 'published_by', 'report_status', 'verification_status']}
      updateMutation={updateMutation}
    />
  );
};

FactChecks.defaultProps = {};

FactChecks.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(FactChecks);
