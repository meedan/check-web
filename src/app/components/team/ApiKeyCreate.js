import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import LimitedTextField from '../layout/inputs/LimitedTextField';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';
import AddIcon from '../../icons/add.svg';

const mutation = graphql`
  mutation ApiKeyCreateMutation($input: CreateApiKeyInput!) {
    createApiKey(input: $input) {
      team {
        api_keys(first: 10000) {
          edges {
            node {
              dbid
              title
              description
              access_token
              created_at
              expire_at
              user {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const ApiKeyCreate = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [error, setError] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleSubmit = () => {
    if (!name) {
      setError(true);
      return;
    }

    const handleError = (err) => {
      const errorMessage = getErrorMessageForRelayModernProblem(err) || <GenericUnknownErrorMessage />;
      setFlashMessage(errorMessage, 'error');
    };

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          title: name,
          description,
        },
      },
      onCompleted: (response, err) => {
        if (err) {
          handleError(err);
        } else {
          setDialogOpen(false);
        }
      },
      onError: (err) => {
        handleError(err);
      },
    });
  };

  return (
    <>
      <ButtonMain
        onClick={() => setDialogOpen(true)}
        label={
          <FormattedMessage
            id="apiKeyCreate.newButton"
            defaultMessage="New API Key"
            description="Button that opens the api key creation dialog"
          />
        }
        iconLeft={<AddIcon />}
        size="small"
      />
      <Dialog className={styles['dialog-window']} open={dialogOpen}>
        <div className={styles['dialog-title']}>
          <FormattedMessage
            tagName="h6"
            id="apiKeyCreate.dialogTitle"
            defaultMessage="New API Key"
            description="Title of a dialog box to create API keys"
          />
        </div>
        <div className={styles['dialog-content']}>
          <div className={inputStyles['form-fieldset']}>
            <div className={inputStyles['form-fieldset-field']}>
              <FormattedMessage
                id="apiKeyCreate.keyNamePlaceholder"
                defaultMessage="Enter a name for your key"
                description="Placeholder text for api key name input field"
              >
                { placeholder => (
                  <TextField
                    required
                    placeholder={placeholder}
                    label={
                      <FormattedMessage
                        id="apiKeyCreate.keyName"
                        defaultMessage="Key name"
                        description="Label for key name input"
                      />
                    }
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={error}
                    helpContent={
                      <FormattedMessage
                        id="apiKeyCreate.keyNameHelper"
                        defaultMessage="The Key Name will be displayed as the author of content added"
                        description="Label for key name input"
                      />
                    }
                  />
                )}
              </FormattedMessage>
            </div>
            <p className="typography-subtitle2">
              <FormattedMessage
                id="apiKeyCreate.descriptionBlurb"
                defaultMessage="What will you use this API Key for? (optional)"
                description="Label displayed before the API Key description input"
              />
            </p>
            <div className={inputStyles['form-fieldset-field']}>
              <FormattedMessage
                id="apiKeyCreate.descriptionPlaceholder"
                defaultMessage="A brief description can help remind the purpose of your integration"
                description="Placeholder text for api key description input field"
              >
                { placeholder => (
                  <LimitedTextField
                    required={false}
                    maxChars={720}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={placeholder}
                    label={
                      <FormattedMessage
                        id="global.description"
                        defaultMessage="Description"
                        description="Generic label for a text field to input a description"
                      />
                    }
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        </div>
        <div className={styles['dialog-actions']}>
          <ButtonMain
            onClick={() => setDialogOpen(false)}
            label={
              <FormattedMessage
                id="global.cancel"
                defaultMessage="Cancel"
                description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
              />
            }
            variant="text"
            theme="text"
          />
          <ButtonMain
            onClick={handleSubmit}
            label={
              <FormattedMessage
                id="apiKeyCreate.submit"
                defaultMessage="Generate Key"
                description="Label for button that creates a new API key"
              />
            }
          />
        </div>
      </Dialog>
    </>
  );
};

export default ApiKeyCreate;
