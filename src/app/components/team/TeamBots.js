import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Collapse from '@material-ui/core/Collapse';
import cx from 'classnames/bind';
import ApiKeys from './ApiKeys';
import TeamBot from './TeamBot';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import CreateTeamBotInstallationMutation from '../../relay/mutations/CreateTeamBotInstallationMutation';
import UpdateTeamBotInstallationMutation from '../../relay/mutations/UpdateTeamBotInstallationMutation';
import DeleteTeamBotInstallationMutation from '../../relay/mutations/DeleteTeamBotInstallationMutation';
import { botName } from '../../helpers';
import SettingsIcon from '../../icons/settings.svg';
import settingsStyles from './Settings.module.css';
import styles from './Integrations.module.css';

class TeamBots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: null,
      settings: {},
      message: null,
      messageBotId: null,
      saving: false,
    };
  }

  UNSAFE_componentWillMount() {
    const settings = {};
    this.props.root.team_bots_listed.edges.forEach((bot) => {
      const installation = this.getInstallation(bot.node.id);
      if (installation) {
        const value = installation.json_settings || '{}';
        settings[installation.id] = JSON.parse(value);
      }
    });
    this.setState({ settings });
  }

  getInstallation(botId) {
    const installation = this.props.root.current_team.team_bot_installations.edges.find(i => i.node.bot_user.id === botId);
    if (installation) {
      return installation.node;
    }
    return null;
  }

  handleToggle(installation, bot, team) {
    const handleDone = () => { this.setState({ saving: false }); };
    this.setState({ saving: bot.id });
    const callbacks = { onFailure: handleDone, onSuccess: handleDone };
    if (installation) {
      const deleteBot = { id: installation.id, teamId: team.id };
      Relay.Store.commitUpdate(new DeleteTeamBotInstallationMutation(deleteBot), callbacks);
    } else {
      Relay.Store.commitUpdate(new CreateTeamBotInstallationMutation({ bot, team }), callbacks);
    }
  }

  handleSettingsUpdated(installation, data) {
    const settings = Object.assign({}, this.state.settings);
    settings[installation.id] = data;
    this.setState({ settings, message: null, messageBotId: null });
  }

  handleSubmitSettings(installation) {
    const settings = JSON.stringify(this.state.settings[installation.id]);
    const messageBotId = installation.team_bot.dbid;
    const onSuccess = () => {
      this.setState({
        messageBotId,
        message: <FormattedMessage defaultMessage="Settings updated!" description="Success message when an integration setting has been updated" id="teamBots.success" />,
      });
    };
    const onFailure = () => {
      this.setState({
        messageBotId,
        message: <FormattedMessage defaultMessage="Error! Please try again." description="Error message when an integration setting did not update correctly" id="teamBots.fail" />,
      });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamBotInstallationMutation({
        id: installation.id,
        json_settings: settings,
        lock_version: installation.lock_version,
      }),
      { onSuccess, onFailure },
    );
  }

  handleToggleSettings(botId) {
    const expanded = (this.state.expanded === botId) ? null : botId;
    this.setState({ expanded, message: null, messageBotId: null });
  }

  render() {
    const { root } = this.props;
    const team = root.current_team;

    return (
      <>
        <ApiKeys team={team} />
        { root.team_bots_listed.edges.map((teamBot) => {
          const bot = teamBot.node;
          const installation = this.getInstallation(bot.id);

          if (bot.default || bot.name === 'Smooch') {
            return null;
          }

          const botExpanded = installation && this.state.expanded === bot.dbid;
          return (
            <div className={cx(settingsStyles['setting-content-container'], styles['integration-bot'])} key={`bot-${bot.dbid}`}>
              <div className={settingsStyles['setting-content-container-title']}>
                <span>{botName(bot)}</span>
                <div className={settingsStyles['setting-content-container-actions']}>
                  <ButtonMain
                    className="settingsIcon"
                    disabled={!installation}
                    iconCenter={<SettingsIcon />}
                    size="default"
                    theme="text"
                    variant="text"
                    onClick={this.handleToggleSettings.bind(this, bot.dbid)}
                  />
                </div>
              </div>
              <SwitchComponent
                checked={Boolean(installation)}
                disabled={this.state.saving === bot.id}
                inputProps={{
                  id: `team-bots__${bot.identifier}-${installation ? 'installed' : 'uninstalled'}`,
                }}
                label={bot.description}
                labelPlacement="end"
                onChange={this.handleToggle.bind(this, installation, bot, team)}
              />
              <Collapse className={styles['integration-details']} in={botExpanded} timeout="auto">
                { bot.installation?.json_settings ?
                  <React.Fragment>
                    <div className={settingsStyles['setting-content-container-title']}>
                      <FormattedMessage defaultMessage="Settings" description="section title for the settings of an individual integration" id="teamBots.settings" />
                      <div className={settingsStyles['setting-content-container-actions']}>
                        <ButtonMain
                          label={
                            <FormattedMessage defaultMessage="Save" description="Save button on an individual integration settings" id="teamBots.save" />
                          }
                          size="default"
                          theme="info"
                          variant="contained"
                          onClick={this.handleSubmitSettings.bind(this, installation)}
                        />
                        { this.state.message && this.state.messageBotId === bot.dbid ?
                          <div>
                            {this.state.message}
                          </div> : null }
                      </div>
                    </div>
                    { botExpanded ?
                      <TeamBot
                        bot={bot}
                        value={this.state.settings[installation.id] || JSON.parse(installation.json_settings || '{}')}
                        onChange={this.handleSettingsUpdated.bind(this, installation)}
                      /> : null
                    }
                  </React.Fragment> :
                  <FormattedMessage
                    defaultMessage="There are no settings for this bot."
                    description="message to the the user that there are no additional settings for an integration"
                    id="teamBots.noSettings"
                  />
                }
              </Collapse>
            </div>
          );
        })}
      </>
    );
  }
}

export default TeamBots;
