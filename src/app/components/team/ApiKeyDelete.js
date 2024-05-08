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

const ApiKeyDelete = ({ keyId }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [checkboxChecked, setCheckboxChecked] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleSubmit = () => {
    const handleError = (err) => {
      const errorMessage = getErrorMessageForRelayModernProblem(err) || <GenericUnknownErrorMessage />;
      setFlashMessage(errorMessage, 'error');
    };

    const mutation = graphql`
      mutation ApiKeyDeleteMutation($input: DestroyApiKeyInput!) {
        destroyApiKey(input: $input) {
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

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: keyId,
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
        className="api-key-delete__open-dialog-button"
        onClick={() => setDialogOpen(true)}
        theme="error"
        label={
          <FormattedMessage
            id="global.delete"
            defaultMessage="Delete"
            description="Generic label for a button or link for a user to press when they wish to delete content or remove functionality"
          />
        }
      />
      <ConfirmProceedDialog
        open={dialogOpen}
        title={
          <FormattedMessage
            id="apiKeyDelete.title"
            defaultMessage="Delete API Key?"
            description="Dialog title for API key deletion"
          />
        }
        body={
          <div>
            <FormattedHTMLMessage
              tagName="p"
              id="apiKeyDelete.body"
              defaultMessage="This action <strong>CANNOT</strong> be undone. This will permanently delete the API key and if you'd like, you will need to generate a replacement key."
              description="Dialog body for API key deletion"
            />
            <Checkbox
              checked={checkboxChecked}
              onChange={() => setCheckboxChecked(!checkboxChecked)}
              label={
                <FormattedHTMLMessage
                  id="apiKeyDelete.checkboxLabel"
                  defaultMessage="Yes, Delete API Key"
                  description="Dialog body for API key deletion"
                />
              }
            />
          </div>
        }
        proceedDisabled={!checkboxChecked}
        proceedLabel={
          <FormattedHTMLMessage
            id="apiKeyDelete.submitLabel"
            defaultMessage="Delete API Key"
            description="Dialog submit button label for API key deletion"
          />
        }
        onProceed={handleSubmit}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
};

ApiKeyDelete.propTypes = {
  keyId: PropTypes.string.isRequired,
};

export default ApiKeyDelete;
