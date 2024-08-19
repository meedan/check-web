/* eslint-disable react/sort-prop-types */
import React from 'react';
import { graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Articles from './Articles';
import FactCheckIcon from '../../icons/fact_check.svg';

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

const FactChecks = ({ intl, routeParams }) => {
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
      filterOptions={['users', 'tags', 'range', 'language_filter', 'published_by', 'report_status', 'verification_status']}
      icon={<FactCheckIcon />}
      sortOptions={sortOptions}
      teamSlug={routeParams.team}
      title={<FormattedMessage defaultMessage="Claim & Fact-Checks" description="Title of the fact-checks page." id="factChecks.title" />}
      type="fact-check"
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
