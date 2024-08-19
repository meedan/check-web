/* eslint-disable react/sort-prop-types */
import React from 'react';
import { graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Articles from './Articles';
import PublishedIcon from '../../icons/playlist_add_check.svg';

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

const PublishedArticles = ({ intl, routeParams }) => {
  const sortOptions = [
    { value: 'title', label: intl.formatMessage(messages.sortTitle) },
    { value: 'language', label: intl.formatMessage(messages.sortLanguage) },
    { value: 'updated_at', label: intl.formatMessage(messages.sortDate) },
  ];

  const updateMutation = graphql`
    mutation PublishedArticlesUpdateExplainerMutation($input: UpdateExplainerInput!) {
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
      defaultFilters={{ report_status: 'published' }}
      filterOptions={['users', 'tags', 'range']}
      icon={<PublishedIcon />}
      sortOptions={sortOptions}
      teamSlug={routeParams.team}
      title={<FormattedMessage defaultMessage="Published" description="Title of the published articles page." id="publishedArticles.title" />}
      type="fact-check"
      updateMutation={updateMutation}
    />
  );
};

PublishedArticles.defaultProps = {};

PublishedArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PublishedArticles);
