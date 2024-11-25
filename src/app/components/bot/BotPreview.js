/* eslint-disable relay/unused-fields, no-unused-vars */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, fetchQuery } from 'react-relay/compat';
import { Link } from 'react-router';
import cx from 'classnames/bind';
import ChatFeed from '../cds/chat/ChatFeed';
import Select from '../cds/inputs/Select';
import DeviceMockupComponent from '../cds/mockups/DeviceMockupComponent';
import IconBot from '../../icons/smart_toy.svg';
import SettingsIcon from '../../icons/settings.svg';
import { safelyParseJSON } from '../../helpers';
import createEnvironment from '../../relay/EnvironmentModern';
import styles from './BotPreview.module.css';

const teamSlug = window.location.pathname.split('/')[1];

const query = graphql`
  query BotPreviewTiplineQuery($teamSlug: String!, $searchText: String!) {
    team(slug: $teamSlug) {
      bot_query(searchText: $searchText) {
        title
        body
        image_url
        language
        url
        type
        format
      }
    }
  }
`;

const BotPreview = ({ me }) => {
  const savedHistory = safelyParseJSON(window.storage.getValue('botPreviewMessageHistory'), []);
  const [messageHistory, setMessageHistory] = React.useState(savedHistory);

  const handleReceiveResults = (results) => {
    const resultMessages = results.map(result => ({
      sent_at: Date.now() / 1000,
      event: result.type === 'fact_check' ? 'search_result' : undefined,
      payload: {
        text: `${result.title}\n\n${result.body}`,
      },
    }));

    const newHistory = [
      ...messageHistory,
      ...resultMessages,
    ];

    setMessageHistory(newHistory);
    window.storage.set('botPreviewMessageHistory', JSON.stringify(newHistory));
  };

  const sendQuery = (text) => {
    const environment = createEnvironment(me.token, teamSlug);
    fetchQuery(environment, query, { teamSlug, searchText: text })
      .then((data) => {
        console.log('Fetched data:', data); // eslint-disable-line no-console
        if (Array.isArray(data?.team?.bot_query)) {
          handleReceiveResults(data.team.bot_query);
        }
      });
  };

  // Querying the bot on useEffect is a bit of a hack, but it works for now.
  // The reason is that we need to wait for the messageHistory state to update before
  // sending the last message (the user's query) to the bot otherwise it will be
  // overwritten in the state by the bot's response.
  // So this is essentially to behave as a callback once the user's query is saved to the state.
  React.useEffect(() => {
    // if last element is incoming, then send it to the bot
    if (messageHistory.length > 0 && messageHistory[messageHistory.length - 1].direction === 'incoming') {
      sendQuery(messageHistory[messageHistory.length - 1].payload.text);
    }
  }, [messageHistory]);

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
        <div className={styles['bot-preview-header']}>
          <div className={styles['bot-preview-title']}>
            <IconBot />{' '}<h6>Bot Preview</h6>{' '}<sup className={styles.beta}>BETA</sup>
          </div>
          <div className={styles['bot-preview-actions-context']}>
            <Select>
              <option>Facebook Messenger</option>
              <option>Telegram</option>
              <option>Whatsapp</option>
            </Select>
          </div>
        </div>
        <div className={styles['bot-preview-action-device-wrapper']}>
          <div className={styles['bot-preview-action-panel']}>
            <div className={styles['bot-preview-action-panel-header']}><IconBot /> Welcome</div>
            <div className={cx(styles['bot-preview-action-panel-content'], styles['bot-preview-action-panel-welcome'])}>
              <p>This is a MVP preview of the Tipline bot associated with this workspace.</p>
              <p>No interactions in this preview affect this workspace. You can test out how your bot will respond to commands.</p>
              <p>This preview is only viewable by you <strong>({me.email})</strong></p>
              <p>The only available response by the bot is to search for content on in the workspace.</p>
              <p>At any time you can clear your chat and start over.</p>
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
      </div>
      <div className={styles['settings-column']}>
        <div className={styles['settings-column-header']}>
          <SettingsIcon />
          <h6>Settings</h6> - <Link to={`/${teamSlug}/settings/tipline`}>Tipline Settings</Link>
        </div>
        <div className={styles['settings-card']}>
          <div className={styles['settings-card-header']}>
            <SettingsIcon />
            <span>Settings Widget</span>
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
          token
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
