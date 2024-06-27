import React from 'react';
import { graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import BookIcon from '../../icons/book.svg';
import Articles from './Articles';

const messages = defineMessages({
  sortTitle: {
    id: 'explainers.sortTitle',
    defaultMessage: 'Title',
    description: 'Label for sort criteria option displayed in a drop-down in the explainers page.',
  },
  sortLanguage: {
    id: 'explainers.sortLanguage',
    defaultMessage: 'Language',
    description: 'Label for sort criteria option displayed in a drop-down in the explainers page.',
  },
  sortDate: {
    id: 'explainers.sortDate',
    defaultMessage: 'Updated (date)',
    description: 'Label for sort criteria option displayed in a drop-down in the explainers page.',
  },
});

const Explainers = ({ routeParams, intl }) => {
  const sortOptions = [
    { value: 'title', label: intl.formatMessage(messages.sortTitle) },
    { value: 'language', label: intl.formatMessage(messages.sortLanguage) },
    { value: 'updated_at', label: intl.formatMessage(messages.sortDate) },
  ];

  const updateMutation = graphql`
    mutation ExplainersUpdateExplainerMutation($input: UpdateExplainerInput!) {
      updateExplainer(input: $input) {
        explainer {
          id
          tags
        }
      }
    }
  `;

  return (
    <Articles
      type="explainer"
      title={<FormattedMessage id="explainers.title" defaultMessage="Explainers" description="Title of the explainers page." />}
      icon={<BookIcon />}
      teamSlug={routeParams.team}
      sortOptions={sortOptions}
      filterOptions={['users', 'tags', 'range']}
      updateMutation={updateMutation}
    />
  );
};

Explainers.defaultProps = {};

Explainers.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Explainers);
