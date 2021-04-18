import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { black05, black87, completedGreen } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';

const useStyles = makeStyles(theme => ({
  smoochBotIntegrationButtonIcon: {
    color: 'white',
    padding: theme.spacing(0.5),
    display: 'flex',
    borderRadius: theme.spacing(1),
  },
  smoochBotIntegrationButton: {
    margin: theme.spacing(1),
    background: black05,
  },
  smoochBotIntegrationButtonFlag: {
    border: '2px solid transparent',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(0.5),
    fontSize: '10px !important',
    fontWeight: 'bold',
  },
  smoochBotIntegrationButtonConnected: {
    color: completedGreen,
    borderColor: completedGreen,
  },
  smoochBotIntegrationButtonDisconnected: {
    color: black87,
    borderColor: black87,
  },
}));

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

  const handleClick = () => {
    if (online) {
      setOpenInfoDialog(true);
    } else if (url) {
      const win = window.open(url);
      const timer = window.setInterval(() => {
        if (win.closed) {
          window.clearInterval(timer);
          window.location.reload();
        }
      }, 500);
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

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="smoochBotIntegrationButton.defaultErrorMessage"
        defaultMessage="Something went wrong"
      />
    ), 'error');
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
            smooch_enabled_integrations
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
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
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
            smooch_enabled_integrations
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
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
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
        {label}
      </Button>

      <ConfirmProceedDialog
        open={openInfoDialog}
        title={
          <FormattedMessage
            id="smoochBotIntegrationButton.tipline"
            defaultMessage="{platform} tipline"
            values={{ platform: label }}
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
          <FormattedMessage
            id="smoochBotIntegrationButton.connectTipline"
            defaultMessage="Connect tipline to {platform}"
            values={{ platform: label }}
          />
        }
        body={
          <Box>
            {params.map(param => (
              <Box mb={1} key={param.key}>
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
            <Box mt={3}>
              <Typography variant="body1" component="p" paragraph>
                <FormattedMessage
                  id="smoochBotIntegrationButton.disclaimer"
                  defaultMessage="We don't store this information. This is just used to configure the integration."
                />
              </Typography>
            </Box>
          </Box>
        }
        proceedDisabled={Object.keys(paramValues).sort().join(',') !== params.map(p => p.key).sort().join(',')}
        proceedLabel={<FormattedMessage id="smoochBotIntegrationButton.connect" defaultMessage="Connect" />}
        onProceed={handleConnect}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="smoochBotIntegrationButton.cancel" defaultMessage="Cancel" />}
        onCancel={() => { setOpenFormDialog(false); }}
      />

      <ConfirmProceedDialog
        open={openConfirmDialog}
        title={
          <FormattedMessage
            id="smoochBotIntegrationButton.confirmDisconnectTitle"
            defaultMessage="Confirm disconnection of {platform} tipline"
            values={{ platform: label }}
          />
        }
        body={
          <FormattedMessage
            id="smoochBotIntegrationButton.confirmDisconnectText"
            defaultMessage="This cannot be undone."
            values={{ platform: label }}
          />
        }
        typeTextToConfirm={label}
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
};

SmoochBotIntegrationButton.propTypes = {
  installationId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  url: PropTypes.string, // if null, "params" must be provided
  params: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.object, // <FormattedMessage />
    key: PropTypes.string,
  })), // if null, "url" must be provided
  online: PropTypes.bool.isRequired,
  info: PropTypes.node, // or null
  disabled: PropTypes.bool.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
};

export default withSetFlashMessage(SmoochBotIntegrationButton);
