import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import TelegramIcon from '@material-ui/icons/Telegram';
import QRCode from 'qrcode.react';
import ViberIcon from '../../../icons/ViberIcon';
import LineIcon from '../../../icons/LineIcon';
import SettingsHeader from '../SettingsHeader';
import SmoochBotIntegrationButton from './SmoochBotIntegrationButton';
import { whatsappGreen, twitterBlue, facebookBlue, telegramBlue, viberPurple, lineGreen } from '../../../styles/js/shared';

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

  const isSmoochSet = settings.smooch_app_id && settings.smooch_secret_key_key_id && settings.smooch_secret_key_secret && settings.smooch_webhook_secret;

  const isOnline = name => Object.keys(enabledIntegrations).indexOf(name) > -1;

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
          disabled={!isSmoochSet}
          type="whatsapp"
          label="WhatsApp"
          url="https://airtable.com/shrAhYXEFGe7F9QHr"
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_7122ffbcd0"
          icon={<WhatsAppIcon />}
          color={whatsappGreen}
          online={isOnline('whatsapp')}
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
                      id="smoochBotIntegrations.qrCodeTitle"
                      defaultMessage="Quickstart QR code"
                      description="Title displayed on WhatsApp tipline settings window, regarding the QR code for WhatsApp"
                    />
                  </strong>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box flex="1">
                    <FormattedMessage
                      id="smoochBotIntegrations.qrCodeDescription"
                      defaultMessage="Scan this QR code to quickly try out your WhatsApp integration and to share and promote it."
                      description="Description displayed on WhatsApp tipline settings window, regarding the QR code for WhatsApp"
                    />
                  </Box>
                  <QRCode value={`https://wa.me/${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}`} renderAs="canvas" />
                </Box>
              </Box> : null
          }
          permanentDisconnection
          skipUrlConfirmation
        />
        <SmoochBotIntegrationButton
          installationId={installationId}
          disabled={!isSmoochSet}
          type="twitter"
          label="Twitter"
          url={settings.smooch_twitter_authorization_url}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_5cfcbe09c7"
          icon={<TwitterIcon />}
          color={twitterBlue}
          online={isOnline('twitter')}
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
          disabled={!isSmoochSet}
          type="messenger"
          label="Messenger"
          url={settings.smooch_facebook_authorization_url}
          helpUrl="http://help.checkmedia.org/en/articles/5189362-connecting-a-new-tipline#h_7e76e39cac"
          icon={<FacebookIcon />}
          color={facebookBlue}
          online={isOnline('messenger')}
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
          disabled={!isSmoochSet}
          type="telegram"
          label="Telegram"
          icon={<TelegramIcon />}
          color={telegramBlue}
          online={isOnline('telegram')}
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
          disabled={!isSmoochSet}
          type="viber"
          label="Viber"
          icon={<ViberIcon />}
          color={viberPurple}
          online={isOnline('viber')}
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
          disabled={!isSmoochSet}
          type="line"
          label="LINE"
          icon={<LineIcon />}
          color={lineGreen}
          online={isOnline('line')}
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
