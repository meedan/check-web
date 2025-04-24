import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation, createFragmentContainer } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import ApiKeys from './ApiKeys'; // eslint-disable-line no-unused-vars
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Select from '../cds/inputs/Select';
import TextField from '../cds/inputs/TextField';
import LimitedTextField from '../layout/inputs/LimitedTextField';
import { getErrorMessageForRelayModernProblem, safelyParseJSON } from '../../helpers';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';
import AddIcon from '../../icons/add.svg';
import EditIcon from '../../icons/edit.svg';

const mutation = graphql`
  mutation WebhookEditMutation($input: CreateApiKeyInput!) {
    createApiKey(input: $input) {
      team {
        id
        ...ApiKeys_team
      }
    }
  }
`;

const WebhookEdit = ({ webhook }) => {
  const parsedEvents = safelyParseJSON(webhook?.events);
  const selectedEvent = parsedEvents && parsedEvents.length > 0 ? parsedEvents[0].event : null;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [eventType, setEventType] = React.useState(selectedEvent);
  const [name, setName] = React.useState(webhook ? webhook.name : '');
  const [url, setUrl] = React.useState(webhook ? webhook.request_url : '');
  const [headers, setHeaders] = React.useState(webhook ? webhook.headers : '');
  const [error, setError] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const resetForm = () => {
    setName('');
    setHeaders('');
  };

  const handleSubmit = () => {
    if (!name || !url) {
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
          headers,
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
      { !webhook && (
        <ButtonMain
          className="webhook-edit__open-dialog-button"
          iconLeft={<AddIcon />}
          label={
            <FormattedMessage
              defaultMessage="New Webhook"
              description="Button that opens the api key creation dialog"
              id="webhookEdit.newButton"
            />
          }
          size="small"
          onClick={() => setDialogOpen(true)}
        />
      )}
      { webhook && (
        <ButtonMain
          className="webhook-edit__open-dialog-button"
          iconLeft={<EditIcon />}
          label={
            <FormattedMessage
              defaultMessage="Edit"
              description="Generic label for a button or link for a user to press when they wish to edit content or functionality"
              id="global.edit"
            />
          }
          theme="text"
          variant="outlined"
          onClick={() => setDialogOpen(true)}
        />
      )}
      <Dialog className={styles['dialog-window']} open={dialogOpen}>
        <div className={styles['dialog-title']}>
          { !webhook &&
            <FormattedMessage
              defaultMessage="New Webhook"
              description="Title of a dialog box to create new webhooks"
              id="webhookEdit.dialogTitleCreate"
              tagName="h6"
            />
          }
          { webhook &&
            <FormattedMessage
              defaultMessage="Edit Webhook"
              description="Title of a dialog box to edit webhook settings"
              id="webhookEdit.dialogTitleEdit"
              tagName="h6"
            />
          }
        </div>
        <div className={styles['dialog-content']}>
          <div className={inputStyles['form-fieldset']}>
            <div className={inputStyles['form-fieldset-field']}>
              <TextField
                className="webhook-edit__name-field"
                error={error}
                label={
                  <FormattedMessage
                    defaultMessage="Webhook name"
                    description="Label for webhook name input"
                    id="webhookEdit.webhookName"
                  />
                }
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className={inputStyles['form-fieldset-field']}>
              <TextField
                className="webhook-edit__url-field"
                error={error}
                label={
                  <FormattedMessage
                    defaultMessage="Webhook URL"
                    description="Label for webhook URL input"
                    id="webhookEdit.webhookUrl"
                  />
                }
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <div className={inputStyles['form-fieldset-field']}>
              <Select
                label="Event"
                required
                value={eventType}
                onChange={e => setEventType(e.target.value)}
              >
                <option value="update_annotation_verification_status-check">Item Status Changed</option>
                <option value="publish_report">Report Published</option>
              </Select>
            </div>
            <div className={inputStyles['form-fieldset-field']}>
              <LimitedTextField
                className="webhook-edit__headers-field"
                label={
                  <FormattedMessage
                    defaultMessage="Headers (Optional)"
                    description="Label for webhook headers input"
                    id="webhookEdit.headers"
                  />
                }
                maxChars={720}
                placeholder="[{ 'key': 'value' }]"
                required={false}
                value={headers}
                onChange={e => setHeaders(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={styles['dialog-actions']}>
          <ButtonMain
            className="webhook-edit__cancel-button"
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
            className="webhook-edit__submit-button"
            label={
              <FormattedMessage
                defaultMessage="Save"
                description="Generic label for a button or link for a user to press when they wish to save an action or setting"
                id="global.save"
              />
            }
            onClick={handleSubmit}
          />
        </div>
      </Dialog>
    </>
  );
};

WebhookEdit.propTypes = {
  webhook: PropTypes.shape({
    name: PropTypes.string,
    events: PropTypes.string,
    headers: PropTypes.string,
    request_url: PropTypes.string,
  }),
};

WebhookEdit.defaultProps = {
  webhook: null,
};

export default WebhookEdit;

const WebhookEditContainer = createFragmentContainer(WebhookEdit, graphql`
  fragment WebhookEditContainer_webhook on Webhook {
    name
    events
    headers
    request_url
  }
`);

export { WebhookEditContainer }; // eslint-disable-line import/no-unused-modules
