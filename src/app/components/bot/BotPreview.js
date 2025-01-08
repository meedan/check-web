import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { QueryRenderer, commitMutation, graphql, fetchQuery } from 'react-relay/compat';
import { Link } from 'react-router';
import cx from 'classnames/bind';
import LanguageSettings from './LanguageSettings';
import PlatformSelect from './PlatformSelect';
import LinkManagement from './LinkManagement';
import MatchingSettings from './MatchingSettings';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ChatFeed from '../cds/chat/ChatFeed';
import DeviceMockupComponent from '../cds/mockups/DeviceMockupComponent';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import IconArrowDown from '../../icons/arrow_downward.svg';
import IconBot from '../../icons/smart_toy.svg';
import SettingsIcon from '../../icons/settings.svg';
import { getErrorMessageForRelayModernProblem, safelyParseJSON } from '../../helpers';
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
        url
        type
      }
    }
  }
`;

const formattedText = (result) => {
  if (result.url) {
    return `*${result.title}*\n\n${result.body}\n\n${result.url}`;
  }

  return `*${result.title}*\n\n${result.body}`;
};

const platformContactName = (platform, smoochIntegrations) => {
  const contactNameFieldForPlatform = {
    whatsapp: 'phoneNumber',
    messenger: 'username',
    viber: 'uri',
    line: 'channelId',
    '-': 'displayName',
  };

  return smoochIntegrations[platform][contactNameFieldForPlatform[platform]];
};

const submitToggleLanguageDetection = ({
  onFailure,
  onSuccess,
  team,
  value,
}) => {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation BotPreviewToggleLanguageDetectionMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            get_language_detection
          }
        }
      }
    `,
    variables: {
      input: {
        id: team.id,
        language_detection: value,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
};

const submitToggleSendArticlesInSameLanguage = ({
  onFailure,
  onSuccess,
  team,
  value,
}) => {
  const newSettings = {
    ...team.alegre_bot?.alegre_settings,
    single_language_fact_checks_enabled: value,
  };

  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation BotPreviewToggleSendArticlesInSameLanguageMutation($input: UpdateTeamBotInstallationInput!) {
        updateTeamBotInstallation(input: $input) {
          team_bot_installation {
            team {
              alegre_bot: team_bot_installation(bot_identifier: "alegre") {
                id
                alegre_settings
                lock_version
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        id: team.alegre_bot.id,
        json_settings: JSON.stringify(newSettings),
        lock_version: team.alegre_bot.lock_version,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
};

const submitTeamLinkManagement = ({
  onFailure,
  onSuccess,
  team,
  values,
}) => {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation BotPreviewUpdateTeamLinkManagementMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            get_shorten_outgoing_urls
            get_outgoing_urls_utm_code
          }
        }
      }
    `,
    variables: {
      input: {
        id: team.id,
        shorten_outgoing_urls: values.shortenOutgoingUrls,
        outgoing_urls_utm_code: values.utmCode,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
};

const BotPreview = ({ me, team }) => {
  let smoochIntegrations = { '-': { displayName: 'No tiplines enabled' } };

  if (team.smooch_bot?.smooch_enabled_integrations && Object.keys(team.smooch_bot.smooch_enabled_integrations)[0]) {
    smoochIntegrations = team.smooch_bot.smooch_enabled_integrations;
  }
  const firstPlatform = Object.keys(smoochIntegrations)[0];

  const savedHistory = safelyParseJSON(window.storage.getValue('botPreviewMessageHistory'), []);

  // FIXME: When the Feature Flag is removed, we probably should just use:
  // const userRole = UserUtil.myRole(window.Check.store.getState().app.context.currentUser, TeamSlug)
  const { currentUser } = window.Check.store.getState().app.context;
  const teams = safelyParseJSON(currentUser.teams);
  const userRole = teams[teamSlug] && teams[teamSlug].role;
  const isAdmin = userRole === 'admin';

  const [confirmBeforeCommit, setConfirmBeforeCommit] = React.useState(false);
  const [confirmBeforeReset, setConfirmBeforeReset] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [messageHistory, setMessageHistory] = React.useState(savedHistory);
  const [selectedPlatform, setSelectedPlatform] = React.useState(firstPlatform);
  const [languageDetection, setLanguageDetection] = React.useState(team.get_language_detection);
  const [sendArticlesInSameLanguage, setSendArticlesInSameLanguage] = React.useState(team.alegre_bot?.alegre_settings?.single_language_fact_checks_enabled);

  const [shortenOutgoingUrls, setShortenOutgoingUrls] = React.useState(team.get_shorten_outgoing_urls);
  const [utmCode, setUtmCode] = React.useState(team.get_outgoing_urls_utm_code);

  const settings = team.smooch_bot?.json_settings ? JSON.parse(team.smooch_bot.json_settings) : {};

  const [similarityThresholdMatching, setSimilarityTresholdMatching] = React.useState(settings.smooch_search_text_similarity_threshold);
  const [minWordsMatching, setMinWordsMatching] = React.useState(team.alegre_bot?.alegre_settings?.text_length_matching_threshold);

  console.log(similarityThresholdMatching, minWordsMatching); //eslint-disable-line

  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const settingsHaveChanged =
    languageDetection !== team.get_language_detection ||
    sendArticlesInSameLanguage !== team.alegre_bot?.alegre_settings?.single_language_fact_checks_enabled ||
    shortenOutgoingUrls !== team.get_shorten_outgoing_urls ||
    utmCode !== team.get_outgoing_urls_utm_code ||
    similarityThresholdMatching !== settings?.smooch_search_text_similarity_threshold ||
    minWordsMatching !== team.alegre_bot?.alegre_settings?.text_length_matching_threshold;

  const revertAllSettings = () => {
    setLanguageDetection(team.get_language_detection);
    setSendArticlesInSameLanguage(team.alegre_bot?.alegre_settings?.single_language_fact_checks_enabled);
  };

  const saveAllSettings = () => {
    const onFailure = (errors) => {
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    submitToggleLanguageDetection({
      team,
      value: languageDetection,
      onSuccess: () => {},
      onFailure,
    });

    submitToggleSendArticlesInSameLanguage({
      team,
      value: sendArticlesInSameLanguage,
      onSuccess: () => {},
      onFailure,
    });

    submitTeamLinkManagement({
      team,
      values: {
        shortenOutgoingUrls,
        utmCode,
      },
      onSuccess: () => {},
      onFailure,
    });
  };

  const handleReceiveResults = (results) => {
    const resultMessages = results.map(result => ({
      sent_at: Date.now() / 1000,
      event: result.type === 'fact_check' ? 'search_result' : undefined,
      media_url: result.image_url || undefined,
      payload: {
        text: formattedText(result),
      },
    }));

    const newHistory = [
      ...messageHistory,
      ...resultMessages,
    ];

    if (resultMessages.length === 0) {
      const noResultsMessage = {
        sent_at: Date.now() / 1000,
        direction: 'outgoing',
        event: null,
        payload: {
          text: 'No results found for that search term.',
        },
      };

      newHistory.push(noResultsMessage);
    }

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

  const resetHistory = () => {
    setDialogOpen(false);
    setMessageHistory([]);
    window.storage.set('botPreviewMessageHistory', JSON.stringify([]));
  };

  if (!me.is_admin) return null;

  return (
    <>
      { settingsHaveChanged && (
        <Alert
          banner
          buttonLabel={
            <FormattedMessage
              defaultMessage="Apply Changes to Live Bot"
              description="Label for the button to apply changes to the bot settings."
              id="botPreview.applyChangesButton"
            />
          }
          content={
            <FormattedMessage
              defaultMessage="Use the Bot Preview below to see the results of the changes you have made to the settings. When ready, apply changes to publish the settings to the Live Tipline Bot for this workspace."
              description="Description of the alert message displayed on the bot preview page to warn about unsaved changes."
              id="botPreview.changesAlertContent"
            />
          }
          extraActions={
            <ButtonMain
              label="Reset All Changes"
              size="small"
              theme="text"
              variant="outlined"
              onClick={() => setConfirmBeforeReset(true)}
            />
          }
          title={
            <FormattedMessage
              defaultMessage="Changes Made to Bot Settings"
              description="Title of the alert message displayed on the bot preview page to warn about unsaved changes."
              id="botPreview.changesAlertTitle"
            />
          }
          variant="success"
          onButtonClick={() => setConfirmBeforeCommit(true)}
        />
      )}
      { confirmBeforeCommit && (
        <ConfirmProceedDialog
          body={<p>If you proceed, the changes you have made to the bot settings will be applied to the live bot for this workspace.</p>}
          open={confirmBeforeCommit}
          proceedLabel="Apply Changes"
          title="Apply Changes to Live Bot?"
          onCancel={() => setConfirmBeforeCommit(false)}
          onProceed={() => {
            setConfirmBeforeCommit(false);
            saveAllSettings();
          }}
        />
      )}
      { confirmBeforeReset && (
        <ConfirmProceedDialog
          body={<p>If you proceed, the changes you have made to the bot settings will be discarded.</p>}
          open={confirmBeforeReset}
          proceedLabel="Discard Changes"
          title="Discard Changes?"
          onCancel={() => setConfirmBeforeReset(false)}
          onProceed={() => {
            setConfirmBeforeReset(false);
            revertAllSettings();
          }}
        />
      )}
      <div className={styles['bot-preview-wrapper']}>
        <div className={styles['card-and-device-column']}>
          <div className={styles['bot-preview-header']}>
            <div className={styles['bot-preview-title']}>
              <IconBot />{' '}
              <h6>Bot Preview</h6>{' '}
              <sup className={styles.beta}>BETA</sup>
              { messageHistory.length ?
                <>
                  {' - '}
                  <button className={styles.buttonAsLink} onClick={() => setDialogOpen(true)}>reset chat</button>
                </> : null }
              <ConfirmProceedDialog
                body="Are you sure you would like to clear this chat? All messages will be removed"
                open={dialogOpen}
                proceedLabel="Yes, clear chat"
                title="Reset Chat"
                onCancel={() => setDialogOpen(false)}
                onProceed={resetHistory}
              />

            </div>
            <div className={styles['bot-preview-actions-context']}>
              <PlatformSelect
                smoochIntegrations={smoochIntegrations}
                value={selectedPlatform}
                onChange={setSelectedPlatform}
              />
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
              contactAvatar={team.avatar}
              contactId={platformContactName(selectedPlatform, smoochIntegrations)}
              onSendText={handleSendText}
            >
              <ChatFeed
                emptyChatMessage={
                  <div className={styles.emptyChatMessage}>
                    Start chatting with this workspace Tipline Bot by entering a search term into the input below.
                    <IconArrowDown />
                  </div>
                }
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
          { isAdmin ?
            null
            :
            <Alert
              content={
                <FormattedMessage
                  defaultMessage="Contact your workspace admin to make any changes to settings."
                  description="Description of the alert message displayed on settings section of the bot preview page."
                  id="botPreview.readOnlyAlertContent"
                />
              }
              title={
                <FormattedMessage
                  defaultMessage="You must be an admin to change Bot Settings"
                  description="Title of the alert message displayed on settings section of the bot preview page."
                  id="botPreview.readOnlyAlertTitle"
                />
              }
              variant="warning"
            />
          }
          <LanguageSettings
            isAdmin={isAdmin}
            languageDetection={languageDetection}
            sendArticlesInSameLanguage={sendArticlesInSameLanguage}
            onChangeLanguageDetection={setLanguageDetection}
            onChangeSendArticlesInSameLanguage={setSendArticlesInSameLanguage}
          />
          <LinkManagement
            isAdmin={isAdmin}
            shortenOutgoingUrls={shortenOutgoingUrls}
            team={team}
            utmCode={utmCode}
            onChangeEnableLinkShortening={setShortenOutgoingUrls}
            onChangeUTMCode={setUtmCode}
          />
          <MatchingSettings
            isAdmin={isAdmin}
            minWordsMatching={minWordsMatching}
            similarityThresholdMatching={similarityThresholdMatching}
            onChangeMinWordsMatching={setMinWordsMatching}
            onChangeSimilarityTresholdMatching={setSimilarityTresholdMatching}
          />
        </div>
      </div>
    </>
  );
};

BotPreview.propTypes = {
  me: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
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
          id
          avatar
          get_language_detection
          get_shorten_outgoing_urls
          get_outgoing_urls_utm_code
          smooch_bot: team_bot_installation(bot_identifier: "smooch") {
            id
            json_settings
            lock_version
            smooch_enabled_integrations(force: true)
          }
          alegre_bot: team_bot_installation(bot_identifier: "alegre") {
            id
            alegre_settings
            lock_version
          }
          ...LinkManagement_team
        }
      }
    `}
    render={({ error, props }) => {
      if (error) return null;
      if (!props) return null;

      return <BotPreview {...props} />;
    }}
    variables={{ teamSlug }}
  />
);

export default BotPreviewQueryRenderer;
