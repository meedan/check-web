import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ArticleForm from './ArticleForm';
import { withSetFlashMessage } from '../FlashMessage';

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
  setFlashMessage,
  projectMedia,
}) => {
  const type = article?.dbid ? 'edit' : 'create';
  const [saving, setSaving] = React.useState(Boolean(false));
  const [error, setError] = React.useState(Boolean(false));
  const tags = projectMedia.tags || [];
  const [explainer, setExplainer] = React.useState({
    title: article?.title || null,
    description: article?.descripton || null,
    language: article?.language || null,
    tags: article?.tags || [],
    url: article?.url || null,
  });

  const handleSuccess = () => {
    setSaving(false);
    setError(false);
    onClose(false);
    setFlashMessage(<FormattedMessage
      id="explainerForm.saveSuccess"
      defaultMessage="Article created successfully!"
      description="Save item action success message"
    />, 'success');
  };

  const handleError = () => {
    setSaving(false);
    setError(false);
    onClose(false);
    setFlashMessage(<FormattedMessage
      id="explainerForm.saveError"
      defaultMessage="Error with saving your article"
      description="save item action failure message"
    />, 'error');
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
          handleError(err);
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        setSaving(false);
        setError(true);
      },
    });
  };

  const handleBlur = (field, value) => {
    setExplainer({ ...explainer, [field]: value });
    if (type === 'edit') {
      setSaving(true);
      commitMutation(Relay.Store, {
        mutation: updateMutation,
        variables: {
          input: {
            id: article.id,
            ...explainer,
          },
        },
        onCompleted: (response, err) => {
          setSaving(false);
          if (err) {
            setError(true);
          } else {
            setError(false);
          }
        },
        onError: () => {
          setSaving(false);
          setError(true);
        },
      });
    }
  };

  return (
    <>
      <ArticleForm
        handleSave={handleSave}
        onClose={onClose}
        handleBlur={handleBlur}
        articleType="explainer"
        mode={type}
        article={article}
        team={team}
        tags={tags}
        saving={saving}
        error={error}
      />
    </>
  );
};

ExplainerForm.defaultProps = {
  article: null,
};

ExplainerForm.propTypes = {
  article: PropTypes.object,
  team: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withSetFlashMessage(ExplainerForm);
