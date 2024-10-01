import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../../cds/inputs/TextField';
import SettingsHeader from '../SettingsHeader';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import smoochBotStyles from './SmoochBot.module.css';

const messages = defineMessages({
  confirmationMessage: {
    id: 'smoochBotIntegrationButton.confirmationMessage',
    defaultMessage: 'Disconnect {platform}',
    description: 'The word *Disconnect* here is an imperative verb... this is what the user needs to type in a field in order to confirm the disconnection of a platform (Twitter, Facebook, etc.) from the tipline.',
  },
  confirmationMessagePermanent: {
    id: 'smoochBotIntegrationButton.confirmationMessagePermanent',
    defaultMessage: 'Disconnect {platform} permanently',
    description: 'The word *Disconnect* here is an imperative verb... this is what the user needs to type in a field in order to confirm the disconnection of a platform (Twitter, Facebook, etc.) from the tipline.',
  },
});

const SmoochBotIntegrationButton = ({
  deprecationNotice,
  disabled,
  helpUrl,
  icon,
  info,
  installationId,
  intl,
  label,
  online,
  params,
  permanentDisconnection,
  readOnly,
  setFlashMessage,
  skipUrlConfirmation,
  type,
  url,
}) => {
  const [openFormDialog, setOpenFormDialog] = React.useState(false);
  const [openInfoDialog, setOpenInfoDialog] = React.useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [paramValues, setParamValues] = React.useState({});

  const handleClose = () => {
    setOpenFormDialog(false);
    setOpenInfoDialog(false);
    setOpenConfirmDialog(false);
  };

  const handleOpenUrl = () => {
    const win = window.open(url);
    if (win) {
      const timer = window.setInterval(() => {
        if (win.closed) {
          window.clearInterval(timer);
          window.location.reload();
        }
      }, 500);
    }
  };

  const handleClick = () => {
    if (online) {
      setOpenInfoDialog(true);
    } else if (url && skipUrlConfirmation) {
      handleOpenUrl();
    } else if (params) {
      setOpenFormDialog(true);
    }
  };

  const handleParam = (key, value) => {
    const newParamValues = Object.assign({}, paramValues);
    if (value) {
      newParamValues[key] = value;
    } else if (newParamValues[key]) {
      delete newParamValues[key];
    }
    setParamValues(newParamValues);
  };

  const handleError = (errors) => {
    const fallbackMessage = (
      <FormattedMessage
        defaultMessage="Something went wrong"
        description="Default error message"
        id="smoochBotIntegrationButton.defaultErrorMessage"
      />
    );
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || fallbackMessage;
    setFlashMessage(errorMessage, 'error');
    setSaving(false);
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Done"
        description="Button label after a successful save"
        id="smoochBotIntegrationButton.savedSuccessfully"
      />
    ), 'success');
    handleClose();
  };

  const handleDisconnect = () => {
    setSaving(true);

    const mutation = graphql`
      mutation SmoochBotIntegrationButtonSmoochBotRemoveIntegrationMutation($input: SmoochBotRemoveIntegrationInput!) {
        smoochBotRemoveIntegration(input: $input) {
          team_bot_installation {
            id
            smooch_enabled_integrations(force: true)
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          team_bot_installation_id: installationId,
          integration_type: type,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError(error);
        } else {
          handleSuccess(response);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  const handleConnect = () => {
    setSaving(true);

    const mutation = graphql`
      mutation SmoochBotIntegrationButtonSmoochBotAddIntegrationMutation($input: SmoochBotAddIntegrationInput!) {
        smoochBotAddIntegration(input: $input) {
          team_bot_installation {
            id
            smooch_enabled_integrations(force: true)
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          team_bot_installation_id: installationId,
          integration_type: type,
          params: JSON.stringify(paramValues),
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError(error);
        } else {
          handleSuccess(response);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <React.Fragment>
      <ButtonMain
        disabled={disabled || (readOnly && !online)}
        iconLeft={icon}
        label={
          <div className={smoochBotStyles['smoochbot-integration-button-label']}>
            {label}
            {
              (!readOnly || online) ?
                <div
                  className={cx(
                    smoochBotStyles['smoochbot-integration-button-status'],
                    {
                      [smoochBotStyles.smoochBotIntegrationButtonConnected]: online,
                      [smoochBotStyles.smoochBotIntegrationButtonDisconnected]: !online,
                    })
                  }
                >
                  { online ?
                    <FormattedMessage
                      defaultMessage="Online"
                      description="Status of bot when its online"
                      id="smoochBotIntegrationButton.online"
                    /> :
                    <FormattedMessage
                      defaultMessage="Connect"
                      description="Status of bot when its not connected"
                      id="smoochBotIntegrationButton.connect"
                    /> }
                </div> : null
            }
          </div>
        }
        size="default"
        theme="lightText"
        variant="contained"
        onClick={handleClick}
      />

      <ConfirmProceedDialog
        body={(
          <div>
            <FormattedMessage
              defaultMessage="Status: Online"
              description="Button label for online bot"
              id="smoochBotIntegrationButton.status"
              tagName="div"
            />
            <div>
              {info}
            </div>
          </div>
        )}
        cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Button label to cancel connection" id="smoochBotIntegrationButton.cancel" />}
        open={openInfoDialog}
        proceedDisabled={readOnly}
        proceedLabel={<FormattedMessage defaultMessage="Disconnect from this account" description="Button label to disconnect a bot from an account" id="smoochBotIntegrationButton.disconnect" />}
        title={
          <SettingsHeader
            helpUrl={helpUrl}
            title={
              <FormattedMessage
                defaultMessage="{platform} tipline"
                description="Platform name for heading"
                id="smoochBotIntegrationButton.tipline"
                values={{ platform: label }}
              />
            }
          />
        }
        onCancel={() => { setOpenInfoDialog(false); }}
        onProceed={() => { setOpenConfirmDialog(true); }}
      />

      <ConfirmProceedDialog
        body={
          deprecationNotice ?
            <Box>{deprecationNotice}</Box> :
            <Box>
              {params.map(param => (
                <Box key={param.key}>
                  <TextField
                    id={`smooch-bot-integration-button__${type}-${param.key}`}
                    key={param.key}
                    label={param.label}
                    variant="outlined"
                    onChange={(e) => { handleParam(param.key, e.target.value); }}
                  />
                </Box>
              ))}
              <Box>
                { url ?
                  <FormattedMessage
                    defaultMessage="Before proceeding, make sure that you are logged in the {platform} account you wish to connect to the tipline."
                    description="The platform here can be Twitter, Facebook, etc."
                    id="smoochBotIntegrationButton.disclaimerForUrl"
                    tagName="p"
                    values={{ platform: label }}
                  /> :
                  <FormattedMessage
                    defaultMessage="We don't store this information. This is just used to configure the integration."
                    description="Privacy disclaimer statement"
                    id="smoochBotIntegrationButton.disclaimer"
                    tagName="p"
                  />
                }
              </Box>
            </Box>
        }
        cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Button label to cancel connection" id="smoochBotIntegrationButton.cancel" />}
        isSaving={saving}
        open={openFormDialog}
        proceedDisabled={deprecationNotice || Object.keys(paramValues).sort().join(',') !== params.map(p => p.key).sort().join(',')}
        proceedLabel={
          url ?
            <FormattedMessage defaultMessage="I'm ready to connect" description="Button label to indicate user is ready to connect" id="smoochBotIntegrationButton.readyToConnect" /> :
            <FormattedMessage defaultMessage="Connect" description="Button label to connect bot" id="smoochBotIntegrationButton.connectButton" />
        }
        title={
          <SettingsHeader
            helpUrl={helpUrl}
            title={
              <FormattedMessage
                defaultMessage="Connect to {platform} tipline"
                description="Settings header for connecting a platform to a tipline"
                id="smoochBotIntegrationButton.connectTipline"
                values={{ platform: label }}
              />
            }
          />
        }
        onCancel={() => { setOpenFormDialog(false); }}
        onProceed={url ? handleOpenUrl : handleConnect}
      />

      <ConfirmProceedDialog
        body={
          permanentDisconnection ?
            <strong className={smoochBotStyles.smoochBotIntegrationButtonWarning}>
              <FormattedMessage
                defaultMessage="Warning! Disconnecting a WhatsApp number is permanent. You will not be able to reconnect it after it is disconnected."
                description="Explanation displayed on the confirmation modal when a tipline administrator wants to disconnect a WhatsApp number."
                id="smoochBotIntegrationButton.confirmDisconnectTextPermanent"
              />
            </strong> :
            <FormattedMessage
              defaultMessage="Disconnecting this {platform} account will prevent any user to interact with the tipline through that account."
              description="Explanation displayed on the confirmation modal when a tipline administrator wants to disconnect a platform (Twitter, Facebook, etc.)."
              id="smoochBotIntegrationButton.confirmDisconnectText"
              values={{ platform: label }}
            />
        }
        cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Button label to cancel connection" id="smoochBotIntegrationButton.cancel" />}
        isSaving={saving}
        open={openConfirmDialog}
        proceedLabel={<FormattedMessage defaultMessage="Confirm" description="Button label to confirm connection" id="smoochBotIntegrationButton.confirm" />}
        title={
          <FormattedMessage
            defaultMessage="Disconnect {platform} tipline"
            description="Title of the confirmation modal displayed when a tipline administrator wants to disconnect some specific platform (Twitter, Facebook, etc.)."
            id="smoochBotIntegrationButton.confirmDisconnectTitle"
            values={{ platform: label }}
          />
        }
        typeTextToConfirm={
          permanentDisconnection ?
            intl.formatMessage(messages.confirmationMessagePermanent, { platform: label }) :
            intl.formatMessage(messages.confirmationMessage, { platform: label })
        }
        onCancel={() => { setOpenConfirmDialog(false); }}
        onProceed={handleDisconnect}
      />
    </React.Fragment>
  );
};

SmoochBotIntegrationButton.defaultProps = {
  deprecationNotice: null,
  url: null,
  params: [],
  info: null,
  permanentDisconnection: false,
  skipUrlConfirmation: false,
  readOnly: false,
};

SmoochBotIntegrationButton.propTypes = {
  deprecationNotice: PropTypes.node, // or null
  disabled: PropTypes.bool.isRequired,
  helpUrl: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  info: PropTypes.node, // or null
  installationId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  label: PropTypes.string.isRequired,
  online: PropTypes.bool.isRequired,
  params: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.object, // <FormattedMessage />
    key: PropTypes.string,
  })), // if null, "url" must be provided
  permanentDisconnection: PropTypes.bool,
  readOnly: PropTypes.bool,
  skipUrlConfirmation: PropTypes.bool,
  type: PropTypes.string.isRequired,
  url: PropTypes.string, // if null, "params" must be provided
};

export default withSetFlashMessage(injectIntl(SmoochBotIntegrationButton));
