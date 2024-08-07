import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, QueryRenderer, commitMutation, createFragmentContainer } from 'react-relay/compat';
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
          report_status
          status
          last_status
          last_status_obj {
            id
            locked
          }
        }
      }
    }
  }
`;

const createClaimMutation = graphql`
  mutation ClaimFactCheckFormCreateClaimDescriptionMutation($input: CreateClaimDescriptionInput!) {
    createClaimDescription(input: $input) {
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
      project_media {
        articles_count
        fact_check {
          id
          title
          summary
          url
          language
          rating
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

const createFactCheckMutation = graphql`
  mutation ClaimFactCheckFormCreateFactCheckMutation($input: CreateFactCheckInput!) {
    createFactCheck(input: $input) {
      team {
        factChecksCount: articles_count(article_type: "fact-check")
        totalArticlesCount: articles_count
      }
      claim_description {
        project_media {
          title
          title_field
          custom_title
          status
          last_status
          last_status_obj {
            id
            locked
          }
        }
      }
      fact_checkEdge {
        __typename
        cursor
        node {
          id
          title
          summary
          url
          language
          rating
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
        rating
        tags
        user {
          name
        }
        claim_description {
          project_media {
            title
            title_field
            custom_title
            status
            last_status
            last_status_obj {
              id
              locked
            }
          }
        }
      }
    }
  }
`;

const ClaimFactCheckForm = ({
  article,
  team,
  projectMedia,
  onClose,
  onCreate,
}) => {
  const type = article?.id ? 'edit' : 'create';
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [factCheck, setFactCheck] = React.useState({});
  const [claim, setClaim] = React.useState({});
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
          claim_description_id: response.createClaimDescription.claim_description.dbid,
          ...factCheck,
        },
      },
      /* This works - but since it's too complex to handle all different filters, let's keep this commented for now and rely on reloading the data
      configs: [{
        type: 'RANGE_ADD',
        parentName: 'team',
        parentID: team['__dataID__'], // eslint-disable-line
        edgeName: 'fact_checkEdge',
        connectionName: 'articles',
        rangeBehaviors: (args) => {
          if (args.article_type === 'fact-check') {
            return 'prepend';
          }
          return 'ignore';
        },
      }],
      */
      onCompleted: () => {
        setSaving(false);
        onSuccess();
        onCreate();
      },
      onError: (err) => {
        onFailure(err);
        setSaving(false);
      },
    });
  };

  const handleSave = () => {
    setSaving(true);
    const input = { ...claim };
    if (projectMedia) {
      input.project_media_id = projectMedia.dbid;
    }
    commitMutation(Relay.Store, {
      mutation: createClaimMutation,
      variables: {
        input,
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
        const saveClaim = { ...claim, [field.replace('claim ', '').toLowerCase()]: value };
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: updateClaimMutation,
          variables: {
            input: {
              id: article.claim_description.id,
              ...saveClaim,
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
    } else {
      setFactCheck({ ...factCheck, [field]: value });
      if (type === 'edit') {
        const saveFactCheck = { ...factCheck, [field]: value };
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: updateFactCheckMutation,
          variables: {
            input: {
              id: article.id,
              ...saveFactCheck,
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
          onError: (err) => {
            onFailure(err);
            setSaving(false);
            setError(true);
          },
        });
      }
    }
  };

  return (
    <ArticleForm
      handleSave={handleSave}
      onClose={onClose}
      handleBlur={handleBlur}
      articleType="fact-check"
      mode={type}
      article={article}
      team={team}
      saving={saving}
      error={error}
    />
  );
};

ClaimFactCheckForm.defaultProps = {
  article: {},
  projectMedia: null,
  onCreate: () => {},
};

ClaimFactCheckForm.propTypes = {
  team: PropTypes.object.isRequired,
  article: PropTypes.object,
  projectMedia: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
};
const ClaimFactCheckFormContainer = createFragmentContainer(ClaimFactCheckForm, graphql`
  fragment ClaimFactCheckForm_team on Team {
    id
    ...ArticleForm_team
  }
  fragment ClaimFactCheckForm_article on FactCheck {
    id
    claim_description {
      id
    }
    ...ArticleForm_article
  }
  fragment ClaimFactCheckForm_projectMedia on ProjectMedia {
    dbid
  }
`);

const ClaimFactCheckFormQueryRenderer = ({
  teamSlug,
  factCheckId,
  onClose,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ClaimFactCheckFormQuery($teamSlug: String!, $factCheckId: ID!) {
        team(slug: $teamSlug) {
          ...ClaimFactCheckForm_team
        }
        fact_check(id: $factCheckId) {
          ...ClaimFactCheckForm_article
        }
      }
    `}
    variables={{
      teamSlug,
      factCheckId,
    }}
    render={({ error, props }) => {
      if (props && !error) {
        return <ClaimFactCheckFormContainer article={props.fact_check} team={props.team} onClose={onClose} />;
      }
      return null;
    }}
  />
);

export default ClaimFactCheckFormContainer;
export { ClaimFactCheckFormQueryRenderer };
