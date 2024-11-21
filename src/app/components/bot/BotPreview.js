/* eslint-disable relay/unused-fields, no-unused-vars */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { Link } from 'react-router';
import ChatFeed from '../cds/chat/ChatFeed';
import Select from '../cds/inputs/Select';
import DeviceMockupComponent from '../cds/mockups/DeviceMockupComponent';
import IconBot from '../../icons/smart_toy.svg';
import SettingsIcon from '../../icons/settings.svg';
import { safelyParseJSON } from '../../helpers';
import styles from './BotPreview.module.css';

const teamSlug = window.location.pathname.split('/')[1];

const BotPreview = ({ me }) => {
  const savedHistory = safelyParseJSON(window.storage.getValue('botPreviewMessageHistory'), []);
  const [messageHistory, setMessageHistory] = React.useState(savedHistory);

  const handleSendText = (text) => {
    const newHistory = [
      ...messageHistory,
      {
        sent_at: Date.now() / 1000,
        direction: 'incoming',
        payload: {
          text,
        },
      },
    ];
    setMessageHistory(newHistory);
    window.storage.set('botPreviewMessageHistory', JSON.stringify(newHistory));
  };

  if (!me.is_admin) return null;

  return (
    <div className={styles['bot-preview-wrapper']}>
      <div className={styles['card-and-device-column']}>
        <div>
          <div className={styles['bot-preview-actions']}>
            <IconBot />{' '}Bot Preview{' '}<span className={styles.beta}>BETA</span>
          </div>
          <div>
            <Select>
              <option>Facebook Messenger</option>
              <option>Telegram</option>
              <option>Whatsapp</option>
            </Select>
          </div>
          <div className={styles['bot-preview-welcome']}>
            <div className={styles['bot-preview-welcome-header']}><IconBot /> Welcome</div>
            <div className={styles['bot-preview-welcome-content']}>
              <p>This is a MVP preview of the Tipline bot associated with this workspace.</p>
              <p>No interactions in this preview affect this workspace. You can test out how your bot will respond to commands.</p>
              <p>This preview is only viewable by you <strong>({me.email})</strong></p>
              <p>The only available response by the bot is to search for content on in the workspace.</p>
              <p>At any time you can clear your chat and start over.</p>
            </div>
          </div>
        </div>
        <DeviceMockupComponent
          contactAvatar="https://placekitten.com/300/300"
          contactId="+1 (555) 555-1212"
          onSendText={handleSendText}
        >
          <ChatFeed
            history={messageHistory}
            userOnRight
          />
        </DeviceMockupComponent>
      </div>
      <div className={styles['settings-column']}>
        <div className={styles['settings-column-header']}>
          <SettingsIcon />
          <span className="typography-h6">Settings</span> - <Link to={`/${teamSlug}/settings/tipline`}>Tipline Settings</Link>
        </div>
        <div className={styles['settings-card']}>
          <div className={styles['settings-card-header']}>
            <SettingsIcon />
            <h6>Settings Widget</h6>
          </div>
          <p>
            Future iterations of this Bot Preview builder experience will integrate Tipline settings into this page. This is a placeholder for future settings.
          </p>
        </div>
      </div>
    </div>
  );
};

const BotPreviewQueryRenderer = () => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query BotPreviewQueryRendererQuery($teamSlug: String!) {
        me {
          email
          is_admin
        }
        team(slug: $teamSlug) {
          smooch_bot: team_bot_installation(bot_identifier: "smooch") {
            json_settings
            smooch_enabled_integrations(force: true)
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (error) return null;
      if (!props) return null;

      console.log('props', JSON.parse(props.team.smooch_bot.json_settings)); // eslint-disable-line no-console
      console.log('integrations', props.team.smooch_bot.smooch_enabled_integrations); // eslint-disable-line no-console

      return <BotPreview {...props} />;
    }}
    variables={{ teamSlug }}
  />
);

export default BotPreviewQueryRenderer;
