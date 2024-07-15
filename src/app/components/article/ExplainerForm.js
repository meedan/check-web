import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { graphql, commitMutation, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ArticleForm from './ArticleForm';
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';

const createMutation = graphql`
  mutation ExplainerFormCreateExplainerMutation($input: CreateExplainerInput!) {
    createExplainer(input: $input) {
      explainer {
        id
        dbid
        title
        description
        url
        language
        tags
        user {
          dbid
          name
        }
        team {
          dbid
          slug
        }
      }
    }
  }
`;

const updateMutation = graphql`
  mutation ExplainerFormUpdateExplainerMutation($input: UpdateExplainerInput!) {
    updateExplainer(input: $input) {
      explainer {
        id
        dbid
        title
        description
        url
        language
        tags
        user {
          dbid
          name
        }
        team {
          dbid
          slug
        }
      }
    }
  }
`;

const ExplainerForm = ({
  article,
  team,
  onClose,
}) => {
  const type = article?.id ? 'edit' : 'create';
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [explainer, setExplainer] = React.useState({});

  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onSuccess = () => {
    setSaving(false);
    setError(false);
    onClose(false);
    setFlashMessage(<FormattedMessage
      id="explainerForm.saveSuccess"
      defaultMessage="Article created successfully!"
      description="Save item action success message"
    />, 'success');
  };

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
    setSaving(false);
    setFlashMessage(errorMessage, 'error');
  };

  const handleSave = () => {
    setSaving(true);
    commitMutation(Relay.Store, {
      mutation: createMutation,
      variables: {
        input: {
          ...explainer,
        },
      },
      onCompleted: (response, err) => {
        setSaving(false);
        if (err) {
          onFailure(err);
        } else {
          onSuccess(response);
        }
      },
      onError: (err) => {
        onFailure(err);
      },
    });
  };

  const handleBlur = (field, value) => {
    setExplainer({ ...explainer, [field]: value });
    const saveExplainer = { ...explainer, [field]: value };
    if (type === 'edit') {
      setSaving(true);
      commitMutation(Relay.Store, {
        mutation: updateMutation,
        variables: {
          input: {
            id: article.id,
            ...saveExplainer,
          },
        },
        onCompleted: (response, err) => {
          setSaving(false);
          if (err) {
            onFailure(err);
            setError(true);
          } else {
            setError(false);
          }
        },
        onError: (err) => {
          onFailure(err);
          setSaving(false);
          setError(true);
        },
      });
    }
  };

  return (
    <ArticleForm
      handleSave={handleSave}
      onClose={onClose}
      handleBlur={handleBlur}
      articleType="explainer"
      mode={type}
      article={article}
      team={team}
      saving={saving}
      error={error}
    />
  );
};

ExplainerForm.defaultProps = {
  article: {},
};

ExplainerForm.propTypes = {
  article: PropTypes.object,
  team: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default createFragmentContainer(ExplainerForm, graphql`
  fragment ExplainerForm_team on Team {
    ...ArticleForm_team
  }
  fragment ExplainerForm_article on Explainer {
    id
    ...ArticleForm_article
  }
`);
