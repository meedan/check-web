import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CopyToClipboard from 'react-copy-to-clipboard';
import { QRCodeCanvas } from 'qrcode.react';
import GetAppIcon from '../../../icons/file_download.svg';
import FileCopyOutlinedIcon from '../../../icons/content_copy.svg';
import FacebookIcon from '../../../icons/facebook.svg';
import LineIcon from '../../../icons/line.svg';
import TelegramIcon from '../../../icons/telegram.svg';
import TwitterIcon from '../../../icons/twitter.svg';
import ViberIcon from '../../../icons/viber.svg';
import WhatsAppIcon from '../../../icons/whatsapp.svg';
import SettingsHeader from '../SettingsHeader';
import SmoochBotIntegrationButton from './SmoochBotIntegrationButton';

const useStyles = makeStyles(() => ({
  smoochBotIntegrationsHeader: {
    marginBottom: 0,
  },
}));

const SmoochBotIntegrations = ({ settings, enabledIntegrations, installationId }) => {
  const classes = useStyles();
  const [copied, setCopied] = React.useState(null);

  const isWabaSet = settings.turnio_host && settings.turnio_secret && settings.turnio_token;
  const isSmoochSet = settings.smooch_app_id && settings.smooch_secret_key_key_id && settings.smooch_secret_key_secret && settings.smooch_webhook_secret;
  const isCapiSet = settings.capi_phone_number && settings.capi_phone_number_id && settings.capi_permanent_token && settings.capi_verify_token && settings.capi_whatsapp_business_account_id;
  const isEnabled = isWabaSet || isSmoochSet || isCapiSet;

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
          <div className="typography-subtitle2">
            <FormattedMessage id="smoochBotIntegrations.title" defaultMessage="Messaging services" description="Title of Settings tab in the tipline settings page" />
          </div>
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
          icon={<WhatsAppIcon style={{ color: 'var(--whatsappGreen)' }} />}
          online={isOnline('whatsapp')}
          readOnly={isWabaSet || isCapiSet}
          info={
            isOnline('whatsapp') ?
              <Box>
                <FormattedMessage
                  id="smoochBotIntegrations.phoneNumber"
                  defaultMessage="Connected phone number: {link}"
                  description="Label showing the whatsapp phone number connected to this bot"
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
          disabled={false}
          readOnly={false}
          online={false}
          installationId={installationId}
          type="twitter"
          label="Twitter"
          url={null}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_5cfcbe09c7"
          icon={<TwitterIcon style={{ color: 'var(--twitterBlue)' }} />}
          deprecationNotice={
            <FormattedMessage
              id="smoochBotIntegrations.twitterDisabled"
              defaultMessage="The integration with Twitter is currently not available, following changes to the Twitter API on April 21, 2023."
              description="Disclaimer displayed on Twitter tipline settings page."
            />
          }
        />
        <SmoochBotIntegrationButton
          installationId={installationId}
          disabled={!isEnabled}
          type="messenger"
          label="Messenger"
          url={settings.smooch_facebook_authorization_url}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_7e76e39cac"
          icon={<FacebookIcon style={{ color: 'var(--facebookBlue)' }} />}
          online={isOnline('messenger')}
          readOnly={!isSmoochSet}
          info={
            isOnline('messenger') ?
              <FormattedMessage
                id="smoochBotIntegrations.page"
                defaultMessage="Connected page: {link}"
                description="Label for the connected facebook page for this bot"
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
          icon={<TelegramIcon style={{ color: 'var(--telegramBlue)' }} />}
          online={isOnline('telegram')}
          readOnly={!isSmoochSet}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_6aa3557c62"
          params={[
            {
              key: 'token',
              label: <FormattedMessage id="smoochBotIntegrations.telegramBotToken" defaultMessage="Telegram bot token" description="Output of the telegram bot token" />,
            },
          ]}
          info={
            isOnline('telegram') ?
              <FormattedMessage
                id="smoochBotIntegrations.telegramBot"
                defaultMessage="Connected Telegram bot: {link}"
                description="Label for the connected Telegram link for this bot"
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
          icon={<ViberIcon style={{ color: 'var(--viberPurple)' }} />}
          online={isOnline('viber')}
          readOnly={!isSmoochSet}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_895bbda0a6"
          params={[
            {
              key: 'token',
              label: <FormattedMessage id="smoochBotIntegrations.viberPublicAccountToken" defaultMessage="Viber public account token" description="Output of the viber bot token" />,
            },
          ]}
          info={
            isOnline('viber') ?
              <FormattedMessage
                id="smoochBotIntegrations.viberPublicAccount"
                defaultMessage="Connected Viber public account: {name}"
                description="Name of the connected viber account for this bot"
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
          icon={<LineIcon style={{ color: 'var(--lineGreen)' }} />}
          online={isOnline('line')}
          readOnly={!isSmoochSet}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_351dd4f960"
          params={[
            {
              key: 'channelAccessToken',
              label: <FormattedMessage id="smoochBotIntegrations.lineChannelAccessToken" defaultMessage="LINE channel access token" description="Output of the LINE bot token" />,
            },
            {
              key: 'channelSecret',
              label: <FormattedMessage id="smoochBotIntegrations.lineChannelSecret" defaultMessage="LINE channel secret" description="Output of the LINE channel secret paired with the token" />,
            },
          ]}
          info={
            isOnline('line') ?
              <TextField
                label={
                  <FormattedMessage
                    id="smoochBotIntegrations.lineWebhook"
                    defaultMessage="Copy this webhook URL to your LINE settings"
                    description="Textfield label for the LINE webhook URL"
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
