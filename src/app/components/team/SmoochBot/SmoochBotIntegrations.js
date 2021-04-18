import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import TelegramIcon from '@material-ui/icons/Telegram';
import ViberIcon from '../../../icons/ViberIcon';
import LineIcon from '../../../icons/LineIcon';
import SmoochBotIntegrationButton from './SmoochBotIntegrationButton';
import { whatsappGreen, twitterBlue, facebookBlue, telegramBlue, viberPurple, lineGreen } from '../../../styles/js/shared';

const SmoochBotIntegrations = ({ settings, enabledIntegrations, installationId }) => {
  const isSmoochSet = settings.smooch_app_id && settings.smooch_secret_key_key_id && settings.smooch_secret_key_secret && settings.smooch_webhook_secret;

  const isOnline = name => Object.keys(enabledIntegrations).indexOf(name) > -1;

  return (
    <Box display="flex" justifyContent="center" mt={2} flexWrap="wrap">
      <SmoochBotIntegrationButton
        installationId={installationId}
        disabled={!isSmoochSet}
        type="whatsapp"
        label="WhatsApp"
        url="https://airtable.com/shrAhYXEFGe7F9QHr"
        icon={<WhatsAppIcon />}
        color={whatsappGreen}
        online={isOnline('whatsapp')}
        info={
          isOnline('whatsapp') ?
            <FormattedMessage
              id="smoochBotIntegrations.phoneNumber"
              defaultMessage="Connected telephone: {link}"
              values={{
                link: (
                  <a href={`https://web.whatsapp.com/send?phone=${enabledIntegrations.whatsapp.phoneNumber.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noopener noreferrer">
                    {enabledIntegrations.whatsapp.phoneNumber}
                  </a>
                ),
              }}
            /> : null
        }
      />
      <SmoochBotIntegrationButton
        installationId={installationId}
        disabled={!isSmoochSet}
        type="twitter"
        label="Twitter"
        url={settings.smooch_twitter_authorization_url}
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
        label="Facebook Messenger"
        url={settings.smooch_facebook_authorization_url}
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
  );
};

SmoochBotIntegrations.propTypes = {
  settings: PropTypes.object.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  installationId: PropTypes.string.isRequired,
};

export default SmoochBotIntegrations;
