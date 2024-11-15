/* eslint-disable relay/unused-fields, no-unused-vars */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import ChatHistory from '../layout/ChatHistory';
import IconBot from '../../icons/smart_toy.svg';
import styles from './BotPreview.module.css';

const fakeData = [
  {
    sent_at: '1731310000',
    event: 'custom_message',
    payload: {
      text: 'Goodbye',
    },
  },
  {
    sent_at: '1731485507',
    direction: 'incoming',
    payload: {
      text: 'BloBloBlo?',
    },
    media_url: 'http://www.meedan.com',
  },
  {
    sent_at: '1731485508',
    payload: {
      text: 'Beep Boop, Standard Bot Interaction engaged! Ding! Ding!',
    },
  },
  {
    sent_at: '1731485509',
    event: 'search_result',
    payload: {
      text: 'Here is what I know about Meedan BloBloBlo:',
    },
  },
];

const BotPreview = ({ me }) => me.is_admin ? (
  <div className={styles['bot-preview-wrapper']}>
    <div className={styles['card-and-device-column']}>
      <div>
        <div className={styles['bot-preview-actions']}>
          <IconBot />{' '}Bot Preview{' '}<span className={styles.beta}>BETA</span>
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
      <div className={styles['device-placeholder']}>
        {/* <ChatHistory
          handleClose={() => {}}
          history={fakeData}
          title="bli"
        /> */}
      </div>
    </div>
    <div className={styles['settings-column']}>
      <div><span className="typography-h6">Settings</span> - Tipline Settings</div>
      <div className={styles['settings-card']}>Settings Widget</div>
    </div>
  </div>
) : null;

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
    variables={{ teamSlug: window.location.pathname.split('/')[1] }}
  />
);

export default BotPreviewQueryRenderer;
