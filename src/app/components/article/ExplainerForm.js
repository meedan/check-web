import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { graphql, QueryRenderer, commitMutation, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ArticleForm from './ArticleForm';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const addMutation = graphql`
  mutation ExplainerFormCreateExplainerItemMutation($input: CreateExplainerItemInput!) {
    createExplainerItem(input: $input) {
      project_media {
        id
      }
    }
  }
`;

const createMutation = graphql`
  mutation ExplainerFormCreateExplainerMutation($input: CreateExplainerInput!) {
    createExplainer(input: $input) {
      team {
        explainersCount: articles_count(article_type: "explainer")
        totalArticlesCount: articles_count
      }
      explainer {
        dbid
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
  team,
  article,
  projectMedia,
  onClose,
  onCreate,
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

  const handleAdd = (response) => {
    setSaving(true);
    commitMutation(Relay.Store, {
      mutation: addMutation,
      variables: {
        input: {
          explainerId: response.createExplainer.explainer.dbid,
          projectMediaId: projectMedia.dbid,
        },
      },
      onCompleted: (response2, err) => {
        setSaving(false);
        if (err) {
          onFailure(err);
        } else {
          onSuccess();
          onCreate();
        }
      },
      onError: (err) => {
        onFailure(err);
      },
    });
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
        } else if (projectMedia) {
          handleAdd(response);
        } else {
          onSuccess();
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
  projectMedia: null,
  onCreate: () => {},
};

ExplainerForm.propTypes = {
  team: PropTypes.object.isRequired,
  article: PropTypes.object,
  projectMedia: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
};

const ExplainerFormContainer = createFragmentContainer(ExplainerForm, graphql`
  fragment ExplainerForm_team on Team {
    ...ArticleForm_team
  }
  fragment ExplainerForm_article on Explainer {
    id
    ...ArticleForm_article
  }
  fragment ExplainerForm_projectMedia on ProjectMedia {
    dbid
  }
`);

const ExplainerFormQueryRenderer = ({
  teamSlug,
  explainerId,
  onClose,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ExplainerFormQuery($teamSlug: String!, $explainerId: ID!) {
        team(slug: $teamSlug) {
          ...ExplainerForm_team
        }
        explainer(id: $explainerId) {
          ...ExplainerForm_article
        }
      }
    `}
    variables={{
      teamSlug,
      explainerId,
    }}
    render={({ error, props }) => {
      if (props && !error) {
        return <ExplainerFormContainer article={props.explainer} team={props.team} onClose={onClose} />;
      }
      return null;
    }}
  />
);

export default ExplainerFormContainer;
export { ExplainerFormQueryRenderer };
