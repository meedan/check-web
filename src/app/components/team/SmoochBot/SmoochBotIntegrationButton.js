import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import SettingsHeader from '../SettingsHeader';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { black05, black87, alertRed, completedGreen } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';

const useStyles = makeStyles(theme => ({
  smoochBotIntegrationButton: {
    margin: theme.spacing(1),
    background: black05,
    flex: '1 1 0px',
    minWidth: 250,
    justifyContent: 'space-between',
    '&:hover': {
      background: black05,
    },
  },
  smoochBotIntegrationButtonIcon: {
    color: 'white',
    padding: theme.spacing(0.5),
    display: 'flex',
    borderRadius: theme.spacing(1),
  },
  smoochBotIntegrationButtonLabel: {
    textAlign: 'left',
    width: '100%',
    whiteSpace: 'nowrap',
  },
  smoochBotIntegrationButtonFlag: {
    border: '1px solid transparent',
    borderRadius: 3,
    padding: theme.spacing(0.5),
    fontSize: '10px !important',
    fontWeight: 'bold',
    minWidth: 80,
  },
  smoochBotIntegrationButtonConnected: {
    color: 'white',
    backgroundColor: completedGreen,
  },
  smoochBotIntegrationButtonDisconnected: {
    color: black87,
    borderColor: black87,
  },
  smoochBotIntegrationButtonWarning: {
    color: alertRed,
  },
  smoochBotIntegrationButtonHeader: {
    marginBottom: 0,
  },
}));

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
  installationId,
  type,
  label,
  url,
  params,
  info,
  icon,
  color,
  online,
  disabled,
  permanentDisconnection,
  skipUrlConfirmation,
  helpUrl,
  intl,
  setFlashMessage,
}) => {
  const classes = useStyles();
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
    const timer = window.setInterval(() => {
      if (win.closed) {
        window.clearInterval(timer);
        window.location.reload();
      }
    }, 500);
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
        id="smoochBotIntegrationButton.defaultErrorMessage"
        defaultMessage="Something went wrong"
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
        id="smoochBotIntegrationButton.savedSuccessfully"
        defaultMessage="Done"
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
      <Button
        variant="contained"
        startIcon={
          <Box className={classes.smoochBotIntegrationButtonIcon} style={{ backgroundColor: color }}>
            {icon}
          </Box>
        }
        endIcon={
          <Typography
            variant="caption"
            className={[
              classes.smoochBotIntegrationButtonFlag,
              online ? classes.smoochBotIntegrationButtonConnected : classes.smoochBotIntegrationButtonDisconnected,
            ].join(' ')}
          >
            { online ?
              <FormattedMessage
                id="smoochBotIntegrationButton.online"
                defaultMessage="Online"
              /> :
              <FormattedMessage
                id="smoochBotIntegrationButton.connect"
                defaultMessage="Connect"
              /> }
          </Typography>
        }
        onClick={handleClick}
        className={classes.smoochBotIntegrationButton}
        disabled={disabled}
      >
        <Box className={classes.smoochBotIntegrationButtonLabel}>
          {label}
        </Box>
      </Button>

      <ConfirmProceedDialog
        open={openInfoDialog}
        title={
          <SettingsHeader
            title={
              <FormattedMessage
                id="smoochBotIntegrationButton.tipline"
                defaultMessage="{platform} tipline"
                values={{ platform: label }}
              />
            }
            helpUrl={helpUrl}
            className={classes.smoochBotIntegrationButtonHeader}
          />
        }
        body={(
          <Box>
            <Typography variant="body1" component="div" paragraph>
              <FormattedMessage
                id="smoochBotIntegrationButton.status"
                defaultMessage="Status: Online"
              />
            </Typography>
            <Typography variant="body1" component="div" paragraph>
              {info}
            </Typography>
          </Box>
        )}
        proceedLabel={<FormattedMessage id="smoochBotIntegrationButton.disconnect" defaultMessage="Disconnect from this account" />}
        onProceed={() => { setOpenConfirmDialog(true); }}
        cancelLabel={<FormattedMessage id="smoochBotIntegrationButton.cancel" defaultMessage="Cancel" />}
        onCancel={() => { setOpenInfoDialog(false); }}
      />

      <ConfirmProceedDialog
        open={openFormDialog}
        title={
          <SettingsHeader
            title={
              <FormattedMessage
                id="smoochBotIntegrationButton.connectTipline"
                defaultMessage="Connect to {platform} tipline"
                values={{ platform: label }}
              />
            }
            helpUrl={helpUrl}
            className={classes.smoochBotIntegrationButtonHeader}
          />
        }
        body={
          <Box>
            {params.map(param => (
              <Box key={param.key}>
                <TextField
                  key={param.key}
                  label={param.label}
                  id={`smooch-bot-integration-button__${type}-${param.key}`}
                  onChange={(e) => { handleParam(param.key, e.target.value); }}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
              </Box>
            ))}
            <Box>
              <Typography variant="body1" component="p" paragraph>
                { url ?
                  <FormattedMessage
                    id="smoochBotIntegrationButton.disclaimerForUrl"
                    defaultMessage="Before proceeding, make sure that you are logged in the {platform} account you wish to connect to the tipline."
                    values={{ platform: label }}
                    description="The platform here can be Twitter, Facebook, etc."
                  /> :
                  <FormattedMessage
                    id="smoochBotIntegrationButton.disclaimer"
                    defaultMessage="We don't store this information. This is just used to configure the integration."
                  />
                }
              </Typography>
            </Box>
          </Box>
        }
        proceedDisabled={Object.keys(paramValues).sort().join(',') !== params.map(p => p.key).sort().join(',')}
        proceedLabel={
          url ?
            <FormattedMessage id="smoochBotIntegrationButton.readyToConnect" defaultMessage="I'm ready to connect" /> :
            <FormattedMessage id="smoochBotIntegrationButton.connect" defaultMessage="Connect" />
        }
        onProceed={url ? handleOpenUrl : handleConnect}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="smoochBotIntegrationButton.cancel" defaultMessage="Cancel" />}
        onCancel={() => { setOpenFormDialog(false); }}
      />

      <ConfirmProceedDialog
        open={openConfirmDialog}
        title={
          <FormattedMessage
            id="smoochBotIntegrationButton.confirmDisconnectTitle"
            defaultMessage="Disconnect {platform} tipline"
            values={{ platform: label }}
            description="Title of the confirmation modal displayed when a tipline administrator wants to disconnect some specific platform (Twitter, Facebook, etc.)."
          />
        }
        body={
          permanentDisconnection ?
            <strong className={classes.smoochBotIntegrationButtonWarning}>
              <FormattedMessage
                id="smoochBotIntegrationButton.confirmDisconnectTextPermanent"
                defaultMessage="Warning! Disconnecting a WhatsApp number is permanent. You will not be able to reconnect it after it is disconnected."
                description="Explanation displayed on the confirmation modal when a tipline administrator wants to disconnect a WhatsApp number."
              />
            </strong> :
            <FormattedMessage
              id="smoochBotIntegrationButton.confirmDisconnectText"
              defaultMessage="Disconnecting this {platform} account will prevent any user to interact with the tipline through that account."
              values={{ platform: label }}
              description="Explanation displayed on the confirmation modal when a tipline administrator wants to disconnect a platform (Twitter, Facebook, etc.)."
            />
        }
        typeTextToConfirm={
          permanentDisconnection ?
            intl.formatMessage(messages.confirmationMessagePermanent, { platform: label }) :
            intl.formatMessage(messages.confirmationMessage, { platform: label })
        }
        proceedLabel={<FormattedMessage id="smoochBotIntegrationButton.confirm" defaultMessage="Confirm" />}
        onProceed={handleDisconnect}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="smoochBotIntegrationButton.cancel" defaultMessage="Cancel" />}
        onCancel={() => { setOpenConfirmDialog(false); }}
      />
    </React.Fragment>
  );
};

SmoochBotIntegrationButton.defaultProps = {
  url: null,
  params: [],
  info: null,
  permanentDisconnection: false,
  skipUrlConfirmation: false,
};

SmoochBotIntegrationButton.propTypes = {
  installationId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  url: PropTypes.string, // if null, "params" must be provided
  skipUrlConfirmation: PropTypes.bool,
  params: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.object, // <FormattedMessage />
    key: PropTypes.string,
  })), // if null, "url" must be provided
  online: PropTypes.bool.isRequired,
  info: PropTypes.node, // or null
  disabled: PropTypes.bool.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  permanentDisconnection: PropTypes.bool,
  helpUrl: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default withSetFlashMessage(injectIntl(SmoochBotIntegrationButton));
