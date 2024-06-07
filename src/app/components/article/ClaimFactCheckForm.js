import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ArticleForm from './ArticleForm';
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';

const updateClaimMutation = graphql`
  mutation ClaimFactCheckFormUpdateClaimDescriptionMutation($input: UpdateClaimDescriptionInput!) {
    updateClaimDescription(input: $input) {
      claim_description {
        id
        dbid
        updated_at
        description
        user {
          name
        }
        project_media {
          title
          title_field
          custom_title
        }
      }
    }
  }
`;

const createClaimMutation = graphql`
  mutation ClaimFactCheckFormCreateClaimDescriptionMutation($input: CreateClaimDescriptionInput!) {
    createClaimDescription(input: $input) {
      project_media {
        permissions
        claim_description {
          id
          dbid
          updated_at
          description
          context
          user {
            name
          }
        }
      }
    }
  }
`;

const createFactCheckMutation = graphql`
  mutation ClaimFactCheckFormCreateFactCheckMutation($input: CreateFactCheckInput!) {
    createFactCheck(input: $input) {
      claim_description {
        id
        dbid
        fact_check {
          id
          title
          summary
          url
          language
          tags
          updated_at
          user {
            name
          }
        }
      }
    }
  }
`;

const updateFactCheckMutation = graphql`
  mutation ClaimFactCheckFormUpdateFactCheckMutation($input: UpdateFactCheckInput!) {
    updateFactCheck(input: $input) {
      fact_check {
        id
        updated_at
        title
        summary
        url
        language
        tags
        user {
          name
        }
        claim_description {
          project_media {
            title
            title_field
            custom_title
          }
        }
      }
    }
  }
`;

const ClaimFactCheckForm = ({
  article,
  team,
  onClose,
  projectMedia,
}) => {
  const type = article?.dbid ? 'edit' : 'create';
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [factCheck, setFactCheck] = React.useState({
    title: article?.factCheck?.title || null,
    description: article?.factCheck?.descripton || null,
    language: article?.factCheck?.language || null,
    tags: article?.factCheck?.tags || [],
    url: article?.factCheck?.url || null,
    status: article?.factCheck?.status || null,
  });
  const [claim, setClaim] = React.useState({
    description: article?.description || null,
    context: article?.context || null,
  });
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onSuccess = () => {
    setSaving(false);
    setError(false);
    onClose(false);
    setFlashMessage(<FormattedMessage
      id="claimFactCheckForm.saveSuccess"
      defaultMessage="Article created successfully!"
      description="Save item action success message"
    />, 'success');
  };

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
    setSaving(false);
    setFlashMessage(errorMessage, 'error');
  };

  const handleSaveFactCheck = (response) => {
    setSaving(true);
    commitMutation(Relay.Store, {
      mutation: createFactCheckMutation,
      variables: {
        input: {
          claim_description_id: response.createClaimDescription.project_media.claim_description.dbid,
          language: factCheck.language,
          summary: factCheck.description,
          title: factCheck.title,
          url: factCheck.url,
          tags: factCheck.tags,
        },
      },
      onCompleted: (err) => {
        setSaving(false);
        if (err) {
          onFailure(err);
        } else {
          onSuccess();
        }
      },
      onError: (err) => {
        onFailure(err);
        setSaving(false);
      },
    });
  };

  const handleSave = () => {
    setSaving(true);
    commitMutation(Relay.Store, {
      mutation: createClaimMutation,
      variables: {
        input: {
          description: claim.description,
          context: claim.title,
          project_media_id: projectMedia?.dbid || null,
        },
      },
      onCompleted: (response, err) => {
        if (err) {
          onFailure(err);
        } else {
          // claim has to exist before creating fact check
          handleSaveFactCheck(response);
        }
      },
      onError: (err) => {
        onFailure(err);
        setError(true);
      },
    });
  };

  const handleBlur = (field, value) => {
    if (field.indexOf('claim') >= 0) {
      setClaim({ ...claim, [field.replace('claim ', '').toLowerCase()]: value });
      if (type === 'edit') {
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: updateClaimMutation,
          variables: {
            input: {
              id: article.id,
              ...claim,
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
    } else {
      setFactCheck({ ...factCheck, [field]: value });
      if (type === 'edit') {
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: updateFactCheckMutation,
          variables: {
            input: {
              id: article.factCheck.id,
              language: factCheck.language,
              summary: factCheck.description,
              title: factCheck.title,
              url: factCheck.url,
              tags: factCheck.tags,
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
    }
    setFactCheck({ ...factCheck, [field]: value });
  };

  return (
    <>
      <ArticleForm
        handleSave={handleSave}
        onClose={onClose}
        handleBlur={handleBlur}
        articleType="fact check"
        mode={type}
        article={article}
        team={team}
        saving={saving}
        error={error}
      />
    </>
  );
};

ClaimFactCheckForm.defaultProps = {
  article: {},
};

ClaimFactCheckForm.propTypes = {
  article: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ClaimFactCheckForm;
