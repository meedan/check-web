/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import TelegramIcon from '@material-ui/icons/Telegram';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import GetAppIcon from '@material-ui/icons/GetApp';
import CopyToClipboard from 'react-copy-to-clipboard';
import { QRCodeCanvas } from 'qrcode.react';
import ViberIcon from '../../../icons/viber.svg';
import LineIcon from '../../../icons/line.svg';
import SettingsHeader from '../SettingsHeader';
import SmoochBotIntegrationButton from './SmoochBotIntegrationButton';

const useStyles = makeStyles(() => ({
  smoochBotIntegrationsTitle: {
    fontWeight: 'bold',
  },
  smoochBotIntegrationsHeader: {
    marginBottom: 0,
  },
}));

const SmoochBotIntegrations = ({ settings, enabledIntegrations, installationId }) => {
  const classes = useStyles();
  const [copied, setCopied] = React.useState(null);

  const isWabaSet = settings.turnio_host && settings.turnio_secret && settings.turnio_token;
  const isSmoochSet = settings.smooch_app_id && settings.smooch_secret_key_key_id && settings.smooch_secret_key_secret && settings.smooch_webhook_secret;
  const isEnabled = isWabaSet || isSmoochSet;

  const isOnline = name => Object.keys(enabledIntegrations).indexOf(name) > -1;

  const handleDownloadWhatsAppQrCode = () => {
    const canvas = document.getElementById('whatsapp-qr-code-canvas');
    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'); // The "replace" avoids a DOM 18 exception
    const link = document.createElement('a');
    link.download = 'whatsapp-qr-code.png';
    link.href = image;
    link.click();
  };

  return (
    <React.Fragment>
      <SettingsHeader
        title={
          <Typography variant="subtitle1" component="div" className={classes.smoochBotIntegrationsTitle}>
            <FormattedMessage id="smoochBotIntegrations.title" defaultMessage="Messaging services" description="Title of Settings tab in the tipline settings page" />
          </Typography>
        }
        helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipeline"
        className={classes.smoochBotIntegrationsHeader}
      />
      <Box display="flex" justifyContent="space-between" flexWrap="wrap">
        <SmoochBotIntegrationButton
          installationId={installationId}
          disabled={!isEnabled}
          type="whatsapp"
          label="WhatsApp"
          url="https://airtable.com/shrAhYXEFGe7F9QHr"
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_7122ffbcd0"
          icon={<WhatsAppIcon />}
          color="var(--whatsappGreen)"
          online={isOnline('whatsapp')}
          readOnly={isWabaSet}
          info={
            isOnline('whatsapp') ?
              <Box>
                <FormattedMessage
                  id="smoochBotIntegrations.phoneNumber"
                  defaultMessage="Connected phone number: {link}"
                  values={{
                    link: (
                      <a href={`https://web.whatsapp.com/send?phone=${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noopener noreferrer">
                        {enabledIntegrations.whatsapp.phoneNumber}
                      </a>
                    ),
                  }}
                />
                <Box mt={2} mb={1}>
                  <strong>
                    <FormattedMessage
                      id="smoochBotIntegrations.entryPointTitle"
                      defaultMessage="Entry point"
                      description="Title displayed on WhatsApp tipline settings window, regarding the entry point for WhatsApp"
                    />
                  </strong>
                  <Box mt={1}>
                    <FormattedMessage
                      id="smoochBotIntegrations.entryPointDescription"
                      defaultMessage="Use this address anywhere online to open WhatsApp and start a tipline conversation:"
                      description="Description displayed on WhatsApp tipline settings window, regarding the entry point for WhatsApp"
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <TextField
                      variant="outlined"
                      margin="normal"
                      defaultValue={`https://wa.me/${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}`}
                      InputProps={{
                        readOnly: true,
                      }}
                      fullWidth
                    />
                    <Tooltip
                      PopperProps={{
                        disablePortal: true,
                      }}
                      open={copied === 'entrypoint'}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      title={
                        <FormattedMessage
                          id="smoochBotIntegrations.copied"
                          defaultMessage="Copied"
                          description="Tooltip displayed on tipline settings when a code is copied to clipboard"
                        />
                      }
                    >
                      <CopyToClipboard
                        text={`https://wa.me/${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}`}
                        onCopy={() => {
                          setCopied('entrypoint');
                          setTimeout(() => { setCopied(null); }, 1000);
                        }}
                      >
                        <IconButton>
                          <FileCopyOutlinedIcon />
                        </IconButton>
                      </CopyToClipboard>
                    </Tooltip>
                  </Box>
                </Box>
                <Box mt={2} mb={1}>
                  <strong>
                    <FormattedMessage
                      id="smoochBotIntegrations.qrCodeTitle"
                      defaultMessage="QR code"
                      description="Title displayed on WhatsApp tipline settings window, regarding the QR code for WhatsApp"
                    />
                  </strong>
                  <Box mt={1} mb={1}>
                    <FormattedMessage
                      id="smoochBotIntegrations.qrCodeDescription"
                      defaultMessage="Use this code or download the image to display the QR code on online or offline promotion. Scanning the QR code opens WhatsApp and starts a tipline conversation."
                      description="Description displayed on WhatsApp tipline settings window, regarding the QR code for WhatsApp"
                    />
                  </Box>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box display="flex" alignItems="flex-start">
                      <TextField
                        variant="outlined"
                        margin="none"
                        defaultValue={`<img src="https://chart.googleapis.com/chart?chs=150x150&amp;cht=qr&amp;chl=https://wa.me/${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}" />`}
                        InputProps={{
                          readOnly: true,
                        }}
                        multiline
                        rows={8}
                      />
                      <Tooltip
                        PopperProps={{
                          disablePortal: true,
                        }}
                        open={copied === 'embedcode'}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        title={
                          <FormattedMessage
                            id="smoochBotIntegrations.copied"
                            defaultMessage="Copied"
                            description="Tooltip displayed on tipline settings when a code is copied to clipboard"
                          />
                        }
                      >
                        <CopyToClipboard
                          text={`<img src="https://chart.googleapis.com/chart?chs=150x150&amp;cht=qr&amp;chl=https://wa.me/${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}" />`}
                          onCopy={() => {
                            setCopied('embedcode');
                            setTimeout(() => { setCopied(null); }, 1000);
                          }}
                        >
                          <IconButton>
                            <FileCopyOutlinedIcon />
                          </IconButton>
                        </CopyToClipboard>
                      </Tooltip>
                    </Box>
                    <Box ml={4} display="flex" alignItems="flex-start">
                      <QRCodeCanvas size={192} value={`https://wa.me/${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}`} id="whatsapp-qr-code-canvas" />
                      <IconButton onClick={handleDownloadWhatsAppQrCode}>
                        <GetAppIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box> : null
          }
          permanentDisconnection
          skipUrlConfirmation
        />
        <SmoochBotIntegrationButton
          installationId={installationId}
          disabled={!isEnabled}
          type="twitter"
          label="Twitter"
          url={settings.smooch_twitter_authorization_url}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_5cfcbe09c7"
          icon={<TwitterIcon />}
          color="var(--twitterBlue)"
          online={isOnline('twitter')}
          readOnly={!isSmoochSet}
          info={
            isOnline('twitter') ?
              <FormattedMessage
                id="smoochBotIntegrations.account"
                defaultMessage="Connected account: {link}"
                values={{
                  link: (
                    <a href={`https://twitter.com/messages/compose?recipient_id=${enabledIntegrations.twitter.userId}`} target="_blank" rel="noopener noreferrer">
                      {enabledIntegrations.twitter.username}
                    </a>
                  ),
                }}
              /> : null
          }
        />
        <SmoochBotIntegrationButton
          installationId={installationId}
          disabled={!isEnabled}
          type="messenger"
          label="Messenger"
          url={settings.smooch_facebook_authorization_url}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_7e76e39cac"
          icon={<FacebookIcon />}
          color="var(--facebookBlue)"
          online={isOnline('messenger')}
          readOnly={!isSmoochSet}
          info={
            isOnline('messenger') ?
              <FormattedMessage
                id="smoochBotIntegrations.page"
                defaultMessage="Connected page: {link}"
                values={{
                  link: (
                    <a href={`https://m.me/${enabledIntegrations.messenger.pageId}`} target="_blank" rel="noopener noreferrer">
                      {enabledIntegrations.messenger.pageId}
                    </a>
                  ),
                }}
              /> : null
          }
        />
        <SmoochBotIntegrationButton
          installationId={installationId}
          disabled={!isEnabled}
          type="telegram"
          label="Telegram"
          icon={<TelegramIcon />}
          color="var(--telegramBlue)"
          online={isOnline('telegram')}
          readOnly={!isSmoochSet}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_6aa3557c62"
          params={[
            {
              key: 'token',
              label: <FormattedMessage id="smoochBotIntegrations.telegramBotToken" defaultMessage="Telegram bot token" />,
            },
          ]}
          info={
            isOnline('telegram') ?
              <FormattedMessage
                id="smoochBotIntegrations.telegramBot"
                defaultMessage="Connected Telegram bot: {link}"
                values={{
                  link: (
                    <a href={`https://t.me/${enabledIntegrations.telegram.username}`} target="_blank" rel="noopener noreferrer">
                      {enabledIntegrations.telegram.username}
                    </a>
                  ),
                }}
              /> : null
          }
        />
        <SmoochBotIntegrationButton
          installationId={installationId}
          disabled={!isEnabled}
          type="viber"
          label="Viber"
          icon={<ViberIcon />}
          color="var(--viberPurple)"
          online={isOnline('viber')}
          readOnly={!isSmoochSet}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_895bbda0a6"
          params={[
            {
              key: 'token',
              label: <FormattedMessage id="smoochBotIntegrations.viberPublicAccountToken" defaultMessage="Viber public account token" />,
            },
          ]}
          info={
            isOnline('viber') ?
              <FormattedMessage
                id="smoochBotIntegrations.viberPublicAccount"
                defaultMessage="Connected Viber public account: {name}"
                values={{
                  name: enabledIntegrations.viber.uri,
                }}
              /> : null
          }
        />
        <SmoochBotIntegrationButton
          installationId={installationId}
          disabled={!isEnabled}
          type="line"
          label="LINE"
          icon={<LineIcon />}
          color="var(--lineGreen)"
          online={isOnline('line')}
          readOnly={!isSmoochSet}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_351dd4f960"
          params={[
            {
              key: 'channelAccessToken',
              label: <FormattedMessage id="smoochBotIntegrations.lineChannelAccessToken" defaultMessage="LINE channel access token" />,
            },
            {
              key: 'channelSecret',
              label: <FormattedMessage id="smoochBotIntegrations.lineChannelSecret" defaultMessage="LINE channel secret" />,
            },
          ]}
          info={
            isOnline('line') ?
              <TextField
                label={
                  <FormattedMessage
                    id="smoochBotIntegrations.lineWebhook"
                    defaultMessage="Copy this webhook URL to your LINE settings"
                  />
                }
                variant="outlined"
                margin="normal"
                // eslint-disable-next-line no-underscore-dangle
                defaultValue={`https://app.smooch.io:443/api/line/webhooks/${settings.smooch_app_id}/${enabledIntegrations.line._id}`}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              /> : null
          }
        />
      </Box>
    </React.Fragment>
  );
};

SmoochBotIntegrations.propTypes = {
  settings: PropTypes.object.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  installationId: PropTypes.string.isRequired,
};

export default SmoochBotIntegrations;
