import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';
import { QRCodeCanvas } from 'qrcode.react';
import SmoochBotIntegrationButton from './SmoochBotIntegrationButton';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../../cds/inputs/TextField';
import GetAppIcon from '../../../icons/file_download.svg';
import FileCopyOutlinedIcon from '../../../icons/content_copy.svg';
import FacebookIcon from '../../../icons/facebook.svg';
import LineIcon from '../../../icons/line.svg';
import TelegramIcon from '../../../icons/telegram.svg';
import TwitterIcon from '../../../icons/twitter.svg';
import ViberIcon from '../../../icons/viber.svg';
import WhatsAppIcon from '../../../icons/whatsapp.svg';
import InstagramIcon from '../../../icons/instagram.svg';
import smoochBotStyles from './SmoochBot.module.css';

const SmoochBotIntegrations = ({ enabledIntegrations, installationId, settings }) => {
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
      <div className={smoochBotStyles['smoochbot-integration-buttons']}>
        <SmoochBotIntegrationButton
          disabled={!isEnabled}
          helpUrl="https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot#h_ec472becaf"
          icon={<WhatsAppIcon style={{ color: 'var(--whatsappGreen)' }} />}
          info={
            isOnline('whatsapp') ?
              <Box>
                <FormattedMessage
                  defaultMessage="Connected phone number: {link}"
                  description="Label showing the whatsapp phone number connected to this bot"
                  id="smoochBotIntegrations.phoneNumber"
                  values={{
                    link: (
                      <a href={`https://web.whatsapp.com/send?phone=${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9+]/g, '')}`} rel="noopener noreferrer" target="_blank">
                        {enabledIntegrations.whatsapp.phoneNumber}
                      </a>
                    ),
                  }}
                />
                <Box mb={1} mt={2}>
                  <strong>
                    <FormattedMessage
                      defaultMessage="Entry point"
                      description="Title displayed on WhatsApp tipline settings window, regarding the entry point for WhatsApp"
                      id="smoochBotIntegrations.entryPointTitle"
                    />
                  </strong>
                  <Box mt={1}>
                    <FormattedMessage
                      defaultMessage="Use this address anywhere online to open WhatsApp and start a tipline conversation:"
                      description="Description displayed on WhatsApp tipline settings window, regarding the entry point for WhatsApp"
                      id="smoochBotIntegrations.entryPointDescription"
                    />
                  </Box>
                  <Box alignItems="center" display="flex">
                    <TextField
                      className={smoochBotStyles['smoochbot-component-input']}
                      defaultValue={`https://wa.me/${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}`}
                      inputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                    />
                    <Tooltip
                      PopperProps={{
                        disablePortal: true,
                      }}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      open={copied === 'entrypoint'}
                      title={
                        <FormattedMessage
                          defaultMessage="Copied"
                          description="Tooltip displayed on tipline settings when a code is copied to clipboard"
                          id="smoochBotIntegrations.copied"
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
                        <ButtonMain
                          iconCenter={<FileCopyOutlinedIcon />}
                          size="default"
                          theme="lightText"
                          variant="text"
                        />
                      </CopyToClipboard>
                    </Tooltip>
                  </Box>
                </Box>
                <Box mb={1} mt={2}>
                  <strong>
                    <FormattedMessage
                      defaultMessage="QR code"
                      description="Title displayed on WhatsApp tipline settings window, regarding the QR code for WhatsApp"
                      id="smoochBotIntegrations.qrCodeTitle"
                    />
                  </strong>
                  <Box mb={1} mt={1}>
                    <FormattedMessage
                      defaultMessage="Use this code or download the image to display the QR code on online or offline promotion. Scanning the QR code opens WhatsApp and starts a tipline conversation."
                      description="Description displayed on WhatsApp tipline settings window, regarding the QR code for WhatsApp"
                      id="smoochBotIntegrations.qrCodeDescription"
                    />
                  </Box>
                  <Box>
                    <Box alignItems="flex-start" display="flex">
                      <TextField
                        className={smoochBotStyles['smoochbot-component-input']}
                        defaultValue={`<img src="https://chart.googleapis.com/chart?chs=150x150&amp;cht=qr&amp;chl=https://wa.me/${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}" />`}
                        disabled
                        variant="outlined"
                      />
                      <Tooltip
                        PopperProps={{
                          disablePortal: true,
                        }}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        open={copied === 'embedcode'}
                        title={
                          <FormattedMessage
                            defaultMessage="Copied"
                            description="Tooltip displayed on tipline settings when a code is copied to clipboard"
                            id="smoochBotIntegrations.copied"
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
                          <ButtonMain
                            iconCenter={<FileCopyOutlinedIcon />}
                            size="default"
                            theme="lightText"
                            variant="text"
                          />
                        </CopyToClipboard>
                      </Tooltip>
                    </Box>
                    <Box alignItems="flex-start" display="flex" mt={2}>
                      <QRCodeCanvas id="whatsapp-qr-code-canvas" size={192} value={`https://wa.me/${enabledIntegrations?.whatsapp?.phoneNumber.replace(/[^0-9]/g, '')}`} />
                      <ButtonMain
                        iconCenter={<GetAppIcon />}
                        size="default"
                        theme="lightText"
                        variant="text"
                        onClick={handleDownloadWhatsAppQrCode}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box> : null
          }
          installationId={installationId}
          label="WhatsApp"
          online={isOnline('whatsapp')}
          permanentDisconnection
          readOnly={isWabaSet || isCapiSet}
          skipUrlConfirmation
          type="whatsapp"
          url="https://airtable.com/shrAhYXEFGe7F9QHr"
        />
        <SmoochBotIntegrationButton
          deprecationNotice={
            <FormattedMessage
              defaultMessage="The integration with X is currently not available, following changes to the X API on April 21, 2023."
              description="Disclaimer displayed on X tipline settings page."
              id="smoochBotIntegrations.twitterDisabled"
            />
          }
          disabled={false}
          helpUrl="https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot"
          icon={<TwitterIcon style={{ color: 'var(--xBlack)' }} />}
          installationId={installationId}
          label="X (Twitter)"
          online={false}
          readOnly={false}
          type="twitter"
          url={null}
        />
        <SmoochBotIntegrationButton
          disabled={!isEnabled}
          helpUrl="https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot#h_6adda6c137"
          icon={<FacebookIcon style={{ color: 'var(--facebookBlue)' }} />}
          info={
            isOnline('messenger') ?
              <FormattedMessage
                defaultMessage="Connected page: {link}"
                description="Label for the connected Facebook page for this bot"
                id="smoochBotIntegrations.page"
                values={{
                  link: (
                    <a href={`https://m.me/${enabledIntegrations.messenger.pageId}`} rel="noopener noreferrer" target="_blank">
                      {enabledIntegrations.messenger.pageId}
                    </a>
                  ),
                }}
              /> : null
          }
          installationId={installationId}
          label="Messenger"
          online={isOnline('messenger')}
          readOnly={!isSmoochSet}
          type="messenger"
          url={settings.smooch_facebook_authorization_url.replace('authorize/facebook', 'authorize/messenger')}
        />
        <SmoochBotIntegrationButton
          disabled={!isEnabled}
          helpUrl="https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot#h_ff25899cc2"
          icon={<TelegramIcon style={{ color: 'var(--telegramBlue)' }} />}
          info={
            isOnline('telegram') ?
              <FormattedMessage
                defaultMessage="Connected Telegram bot: {link}"
                description="Label for the connected Telegram link for this bot"
                id="smoochBotIntegrations.telegramBot"
                values={{
                  link: (
                    <a href={`https://t.me/${enabledIntegrations.telegram.username}`} rel="noopener noreferrer" target="_blank">
                      {enabledIntegrations.telegram.username}
                    </a>
                  ),
                }}
              /> : null
          }
          installationId={installationId}
          label="Telegram"
          online={isOnline('telegram')}
          params={[
            {
              key: 'token',
              label: <FormattedMessage defaultMessage="Telegram bot token" description="Output of the telegram bot token" id="smoochBotIntegrations.telegramBotToken" />,
            },
          ]}
          readOnly={!isSmoochSet}
          type="telegram"
        />
        <SmoochBotIntegrationButton
          disabled={!isEnabled}
          helpUrl="https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot#h_71c06164f3"
          icon={<ViberIcon style={{ color: 'var(--viberPurple)' }} />}
          info={
            isOnline('viber') ?
              <FormattedMessage
                defaultMessage="Connected Viber public account: {name}"
                description="Name of the connected viber account for this bot"
                id="smoochBotIntegrations.viberPublicAccount"
                values={{
                  name: enabledIntegrations.viber.uri,
                }}
              /> : null
          }
          installationId={installationId}
          label="Viber"
          online={isOnline('viber')}
          params={[
            {
              key: 'token',
              label: <FormattedMessage defaultMessage="Viber public account token" description="Output of the viber bot token" id="smoochBotIntegrations.viberPublicAccountToken" />,
            },
          ]}
          readOnly={!isSmoochSet}
          type="viber"
        />
        <SmoochBotIntegrationButton
          disabled={!isEnabled}
          helpUrl="https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot#h_6adda6c137"
          icon={<LineIcon style={{ color: 'var(--lineGreen)' }} />}
          info={
            isOnline('line') ?
              <TextField
                InputProps={{
                  readOnly: true,
                }}
                // eslint-disable-next-line no-underscore-dangle
                defaultValue={`https://app.smooch.io:443/api/line/webhooks/${settings.smooch_app_id}/${enabledIntegrations.line._id}`}
                label={
                  <FormattedMessage
                    defaultMessage="Copy this webhook URL to your LINE settings"
                    description="Textfield label for the LINE webhook URL"
                    id="smoochBotIntegrations.lineWebhook"
                  />
                }
                variant="outlined"
              /> : null
          }
          installationId={installationId}
          label="LINE"
          online={isOnline('line')}
          params={[
            {
              key: 'channelAccessToken',
              label: <FormattedMessage defaultMessage="LINE channel access token" description="Output of the LINE bot token" id="smoochBotIntegrations.lineChannelAccessToken" />,
            },
            {
              key: 'channelSecret',
              label: <FormattedMessage defaultMessage="LINE channel secret" description="Output of the LINE channel secret paired with the token" id="smoochBotIntegrations.lineChannelSecret" />,
            },
          ]}
          readOnly={!isSmoochSet}
          type="line"
        />
        <SmoochBotIntegrationButton
          disabled={!isEnabled}
          helpUrl="https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot#h_b872d32c4d"
          icon={<InstagramIcon style={{ color: 'var(--instagramPink)' }} />}
          info={
            isOnline('instagram') ?
              <FormattedMessage
                defaultMessage="Connected profile: {link}"
                description="Label for the connected Instagram profile for this bot"
                id="smoochBotIntegrations.instagram"
                values={{
                  link: (
                    <a href={`https://instagram.com/${enabledIntegrations.instagram.businessUsername}`} rel="noopener noreferrer" target="_blank">
                      {enabledIntegrations.instagram.businessName}
                    </a>
                  ),
                }}
              /> : null
          }
          installationId={installationId}
          label="Instagram"
          online={isOnline('instagram')}
          readOnly={!isSmoochSet}
          type="instagram"
          url={settings.smooch_facebook_authorization_url.replace('authorize/facebook', 'authorize/instagram')}
        />
      </div>
    </React.Fragment>
  );
};

SmoochBotIntegrations.propTypes = {
  enabledIntegrations: PropTypes.object.isRequired,
  installationId: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired,
};

export default SmoochBotIntegrations;
