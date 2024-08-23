import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import ApiKeys from './ApiKeys'; // eslint-disable-line no-unused-vars
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
        id
        ...ApiKeys_team
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

  const resetForm = () => {
    setName('');
    setDescription('');
  };

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
          resetForm();
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
        className="api-key-create__open-dialog-button"
        iconLeft={<AddIcon />}
        label={
          <FormattedMessage
            defaultMessage="New API Key"
            description="Button that opens the api key creation dialog"
            id="apiKeyCreate.newButton"
          />
        }
        size="small"
        onClick={() => setDialogOpen(true)}
      />
      <Dialog className={styles['dialog-window']} open={dialogOpen}>
        <div className={styles['dialog-title']}>
          <FormattedMessage
            defaultMessage="New API Key"
            description="Title of a dialog box to create API keys"
            id="apiKeyCreate.dialogTitle"
            tagName="h6"
          />
        </div>
        <div className={styles['dialog-content']}>
          <div className={inputStyles['form-fieldset']}>
            <div className={inputStyles['form-fieldset-field']}>
              <FormattedMessage
                defaultMessage="Enter a name for your key"
                description="Placeholder text for api key name input field"
                id="apiKeyCreate.keyNamePlaceholder"
              >
                { placeholder => (
                  <TextField
                    className="api-key-create__name-field"
                    error={error}
                    helpContent={
                      <FormattedMessage
                        defaultMessage="The Key Name will be displayed as the author of content added"
                        description="Label for key name input"
                        id="apiKeyCreate.keyNameHelper"
                      />
                    }
                    label={
                      <FormattedMessage
                        defaultMessage="Key name"
                        description="Label for key name input"
                        id="apiKeyCreate.keyName"
                      />
                    }
                    placeholder={placeholder}
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                )}
              </FormattedMessage>
            </div>
            <p className="typography-subtitle2">
              <FormattedMessage
                defaultMessage="What will you use this API Key for? (optional)"
                description="Label displayed before the API Key description input"
                id="apiKeyCreate.descriptionBlurb"
              />
            </p>
            <div className={inputStyles['form-fieldset-field']}>
              <FormattedMessage
                defaultMessage="A brief description can help remind the purpose of your integration"
                description="Placeholder text for api key description input field"
                id="apiKeyCreate.descriptionPlaceholder"
              >
                { placeholder => (
                  <LimitedTextField
                    className="api-key-create__description-field"
                    label={
                      <FormattedMessage
                        defaultMessage="Description"
                        description="Generic label for a text field to input a description"
                        id="global.description"
                      />
                    }
                    maxChars={720}
                    placeholder={placeholder}
                    required={false}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        </div>
        <div className={styles['dialog-actions']}>
          <ButtonMain
            className="api-key-create__cancel-button"
            label={
              <FormattedMessage
                defaultMessage="Cancel"
                description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
                id="global.cancel"
              />
            }
            theme="text"
            variant="text"
            onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}
          />
          <ButtonMain
            className="api-key-create__submit-button"
            label={
              <FormattedMessage
                defaultMessage="Generate Key"
                description="Label for button that creates a new API key"
                id="apiKeyCreate.submit"
              />
            }
            onClick={handleSubmit}
          />
        </div>
      </Dialog>
    </>
  );
};

ApiKeyCreate.propTypes = {}; // No props

export default ApiKeyCreate;
