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

const updateMutationExplainer = graphql`
  mutation TrashedArticlesUpdateExplainerMutation($input: UpdateExplainerInput!) {
    updateExplainer(input: $input) {
      explainer {
        id
        tags
      }
    }
  }
`;

const updateMutationFactCheck = graphql`
  mutation TrashedArticlesUpdateFactCheckMutation($input: UpdateFactCheckInput!) {
    updateFactCheck(input: $input) {
      fact_check {
        id
        tags
      }
    }
  }
`;

const TrashedArticles = ({ intl, routeParams }) => {
  const [type, setType] = React.useState('fact-check');
  const [updateMutation, setUpdateMutation] = React.useState(updateMutationFactCheck);

  const sortOptions = [
    { value: 'title', label: intl.formatMessage(messages.sortTitle) },
    { value: 'language', label: intl.formatMessage(messages.sortLanguage) },
    { value: 'updated_at', label: intl.formatMessage(messages.sortDate) },
  ];

  const handleChangeArticleType = (newType) => {
    if (newType === 'explainer') {
      setType(newType);
      setUpdateMutation(updateMutationExplainer);
    } else if (newType === 'fact-check') {
      setType('fact-check');
      setUpdateMutation(updateMutationFactCheck);
    } else {
      setType(null);
    }
  };

  return (
    <Articles
      articleTypeReadOnly={false}
      defaultFilters={{ trashed: true }}
      filterOptions={['users', 'tags', 'range']}
      icon={<TrashIcon />}
      sortOptions={sortOptions}
      teamSlug={routeParams.team}
      title={<FormattedMessage defaultMessage="Trash" description="Title of the trashed articles page." id="trashedArticles.title" />}
      type={type}
      updateMutation={updateMutation}
      onChangeArticleType={handleChangeArticleType}
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
