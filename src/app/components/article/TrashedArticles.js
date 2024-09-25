import React from 'react';
import { graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Articles from './Articles';
import TrashIcon from '../../icons/delete.svg';

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

const TrashedArticles = ({ intl, routeParams }) => {
  const sortOptions = [
    { value: 'title', label: intl.formatMessage(messages.sortTitle) },
    { value: 'language', label: intl.formatMessage(messages.sortLanguage) },
    { value: 'updated_at', label: intl.formatMessage(messages.sortDate) },
  ];

  const updateMutation = graphql`
    mutation TrashedArticlesUpdateExplainerMutation($input: UpdateExplainerInput!) {
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
      defaultFilters={{ trashed: true }}
      filterOptions={['users', 'tags', 'range']}
      icon={<TrashIcon />}
      sortOptions={sortOptions}
      teamSlug={routeParams.team}
      title={<FormattedMessage defaultMessage="Trash" description="Title of the trashed articles page." id="trashedArticles.title" />}
      type="fact-check"
      updateMutation={updateMutation}
    />
  );
};

TrashedArticles.defaultProps = {};

TrashedArticles.propTypes = {
  intl: intlShape.isRequired,
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default injectIntl(TrashedArticles);
