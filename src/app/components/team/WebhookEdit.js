import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation, createFragmentContainer } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
// For using the Webhooks_team fragment in the mutation
import Webhooks from './Webhooks'; // eslint-disable-line no-unused-vars
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Select from '../cds/inputs/Select';
import TextField from '../cds/inputs/TextField';
import { getErrorMessageForRelayModernProblem, validateURL } from '../../helpers';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';
import AddIcon from '../../icons/add.svg';
import EditIcon from '../../icons/edit.svg';

const messages = defineMessages({
  update_annotation_verification_status: {
    id: 'webhookEdit.eventTypeItemStatusChanged',
    defaultMessage: 'Item Status Changed',
    description: 'Label for the event type when the status of an item changes',
  },
  publish_report: {
    id: 'webhookEdit.eventTypeReportPublished',
    defaultMessage: 'Report Published',
    description: 'Label for the event type when a report is published',
  },
  create_project_media: {
    id: 'webhookEdit.eventTypeProjectMediaCreated',
    defaultMessage: 'Project Media Created',
    description: 'Label for the event type when a project media is created',
  },
});

const createMutation = graphql`
  mutation WebhookEditCreateMutation($input: CreateBotUserInput!) {
    createWebhook(input: $input) {
      team {
        id
        ...Webhooks_team
      }
    }
  }
`;

const updateMutation = graphql`
  mutation WebhookEditUpdateMutation($input: UpdateBotUserInput!) {
    updateWebhook(input: $input) {
      team {
        id
        ...Webhooks_team
      }
    }
  }
`;

const validateHeaders = (headers) => {
  let parsedHeaders = null;

  try {
    parsedHeaders = JSON.parse(headers);
  } catch (e) {
    return false;
  }

  // parsedHeaders should be an object and have at least one key-value pair
  if (
    typeof parsedHeaders === 'object' &&
    !Array.isArray(parsedHeaders) &&
    Object.keys(parsedHeaders).length > 0
  ) {
    return true;
  }

  return false;
};

const buildEvents = (eventType) => {
  let events = null;

  if (eventType === 'update_annotation_verification_status') {
    events = [{
      event: 'update_annotation_verification_status',
      graphql: 'project_media { dbid last_status }',
    }];
  }

  if (eventType === 'publish_report') {
    events = [{
      event: 'publish_report',
      graphql: 'project_media { dbid fact_check { title summary rating language updated_at url } fact_check_published_on }',
    }];
  }

  return JSON.stringify(events);
};

const WebhookEdit = ({ intl, webhook }) => {
  const selectedEvent = webhook?.events?.length ? webhook.events[0].event : 'update_annotation_verification_status';

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [eventType, setEventType] = React.useState(selectedEvent);
  const [name, setName] = React.useState(webhook ? webhook.name : '');
  const [url, setUrl] = React.useState(webhook ? webhook.request_url : '');
  const [headers, setHeaders] = React.useState(webhook?.headers ? JSON.stringify(webhook.headers) : '');
  const [nameError, setNameError] = React.useState(false);
  const [urlError, setUrlError] = React.useState(false);
  const [headersError, setHeadersError] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const resetForm = () => {
    setName('');
    setHeaders('');
    setUrl('');
    setEventType('update_annotation_verification_status');
    setNameError(false);
    setUrlError(false);
    setHeadersError(false);
  };

  const validateForm = () => {
    setNameError(!name.trim());
    setUrlError(!validateURL(url));
    setHeadersError(headers && !validateHeaders(headers));
  };

  const headersPlaceHolder = '{ "MyHeader": "value", "MyOtherHeader": "value" }';

  const handleSubmit = () => {
    if (nameError || urlError || headersError) {
      return;
    }

    const handleError = (err) => {
      const errorMessage = getErrorMessageForRelayModernProblem(err) || <GenericUnknownErrorMessage />;
      setFlashMessage(errorMessage, 'error');
    };

    commitMutation(Store, {
      mutation: webhook ? updateMutation : createMutation,
      variables: {
        input: {
          id: webhook ? webhook.id : undefined,
          name,
          request_url: url,
          events: buildEvents(eventType),
          headers: headers || null,
        },
      },
      onCompleted: (response, err) => {
        if (err) {
          handleError(err);
        } else {
          setDialogOpen(false);
          if (!webhook) {
            setFlashMessage(
              <FormattedMessage
                defaultMessage="Webhook created"
                description="Success message when a webhook is created"
                id="webhookEdit.createSuccess"
              />,
              'success',
            );
            resetForm();
          } else {
            setFlashMessage(
              <FormattedMessage
                defaultMessage="Webhook updated"
                description="Success message when a webhook is updated"
                id="webhookEdit.updateSuccess"
              />,
              'success',
            );
          }
        }
      },
      onError: (err) => {
        handleError(err);
      },
    });
  };

  let headersHelpContent = null;

  if (!headers) {
    headersHelpContent = (
      <FormattedMessage
        defaultMessage="Use JSON format key-value pairs"
        description="Help content for webhook headers input"
        id="webhookEdit.headersHelp"
      />
    );
  } else if (!headersError) {
    headersHelpContent = (
      <FormattedMessage
        defaultMessage="✓ Valid JSON format"
        description="Help content for valid webhook headers input"
        id="webhookEdit.headersValid"
      />
    );
  } else {
    headersHelpContent = (
      <FormattedMessage
        defaultMessage="Invalid JSON object"
        description="Error message for invalid webhook headers input"
        id="webhookEdit.headersError"
      />
    );
  }

  return (
    <>
      { !webhook && (
        <ButtonMain
          className="webhook-edit__open-dialog-button"
          iconLeft={<AddIcon />}
          label={
            <FormattedMessage
              defaultMessage="New Webhook"
              description="Button that opens the webhook creation dialog"
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
                error={nameError}
                label={
                  <FormattedMessage
                    defaultMessage="Webhook name"
                    description="Label for webhook name input"
                    id="webhookEdit.webhookName"
                  />
                }
                required
                value={name}
                onBlur={validateForm}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className={inputStyles['form-fieldset-field']}>
              <TextField
                className="webhook-edit__url-field"
                error={urlError}
                label={
                  <FormattedMessage
                    defaultMessage="Webhook URL"
                    description="Label for webhook URL input"
                    id="webhookEdit.webhookUrl"
                  />
                }
                required
                value={url}
                onBlur={validateForm}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <div className={inputStyles['form-fieldset-field']}>
              <Select
                className="webhook-edit__event-select"
                label={
                  <FormattedMessage
                    defaultMessage="Event"
                    description="Label for webhook event type select"
                    id="webhookEdit.eventType"
                  />
                }
                required
                value={eventType}
                onBlur={validateForm}
                onChange={e => setEventType(e.target.value)}
              >
                <option value="update_annotation_verification_status">
                  {intl.formatMessage(messages.update_annotation_verification_status)}
                </option>
                <option value="publish_report">
                  {intl.formatMessage(messages.publish_report)}
                </option>
              </Select>
            </div>
            <div className={inputStyles['form-fieldset-field']}>
              <TextField
                className="webhook-edit__headers-field"
                error={headersError}
                helpContent={headersHelpContent}
                label={
                  <FormattedMessage
                    defaultMessage="Headers (Optional)"
                    description="Label for webhook headers input"
                    id="webhookEdit.headers"
                  />
                }
                placeholder={headersPlaceHolder}
                required={false}
                value={headers}
                onBlur={validateForm}
                onChange={(e) => {
                  setHeaders(e.target.value);
                  setHeadersError(e.target.value && !validateHeaders(e.target.value));
                }}
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
              if (!webhook) {
                resetForm();
              }
              setDialogOpen(false);
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
  intl: intlShape.isRequired,
  webhook: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    events: PropTypes.arrayOf(PropTypes.exact({
      event: PropTypes.string,
      graphql: PropTypes.string,
    })),
    headers: PropTypes.object,
    request_url: PropTypes.string.isRequired,
  }),
};

WebhookEdit.defaultProps = {
  webhook: null,
};

export default injectIntl(WebhookEdit);

const WebhookEditContainer = createFragmentContainer(injectIntl(WebhookEdit), graphql`
  fragment WebhookEditContainer_webhook on Webhook {
    id
    name
    events
    headers
    request_url
  }
`);

export { WebhookEdit, WebhookEditContainer, messages }; // eslint-disable-line import/no-unused-modules
