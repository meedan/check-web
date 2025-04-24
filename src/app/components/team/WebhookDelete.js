import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Checkbox from '../cds/buttons-checkboxes-chips/Checkbox';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const WebhookDelete = ({ webhookId }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [checkboxChecked, setCheckboxChecked] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleSubmit = () => {
    const handleError = (err) => {
      const errorMessage = getErrorMessageForRelayModernProblem(err) || <GenericUnknownErrorMessage />;
      setFlashMessage(errorMessage, 'error');
    };

    const mutation = graphql`
      mutation WebhookDeleteMutation($input: DestroyBotUserInput!) {
        destroyWebhook(input: $input) {
          deletedId
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: webhookId,
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
        className="webhook-delete__open-dialog-button"
        label={
          <FormattedMessage
            defaultMessage="Delete"
            description="Generic label for a button or link for a user to press when they wish to delete content or remove functionality"
            id="global.delete"
          />
        }
        theme="error"
        onClick={() => setDialogOpen(true)}
      />
      <ConfirmProceedDialog
        body={
          <div>
            <FormattedHTMLMessage
              defaultMessage="Are you sure you want to delete this webhook? This action cannot be undone."
              description="Dialog body for API key deletion"
              id="webhookDelete.body"
              tagName="p"
            />
            <Checkbox
              checked={checkboxChecked}
              label={
                <FormattedHTMLMessage
                  defaultMessage="Yes, Delete Webhook"
                  description="Dialog body for webhook deletion"
                  id="webhookDelete.checkboxLabel"
                />
              }
              onChange={() => setCheckboxChecked(!checkboxChecked)}
            />
          </div>
        }
        open={dialogOpen}
        proceedDisabled={!checkboxChecked}
        proceedLabel={
          <FormattedHTMLMessage
            defaultMessage="Delete Webhook"
            description="Dialog submit button label for API key deletion"
            id="webhookDelete.submitLabel"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Delete API Key?"
            description="Dialog title for API key deletion"
            id="webhookDelete.title"
          />
        }
        onCancel={() => setDialogOpen(false)}
        onProceed={handleSubmit}
      />
    </>
  );
};

WebhookDelete.propTypes = {
  webhookId: PropTypes.string.isRequired,
};

export default WebhookDelete;
