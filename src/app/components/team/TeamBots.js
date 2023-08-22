import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import TeamBot from './TeamBot';
import CreateTeamBotInstallationMutation from '../../relay/mutations/CreateTeamBotInstallationMutation';
import UpdateTeamBotInstallationMutation from '../../relay/mutations/UpdateTeamBotInstallationMutation';
import DeleteTeamBotInstallationMutation from '../../relay/mutations/DeleteTeamBotInstallationMutation';
import { botName } from '../../helpers';
import SettingsIcon from '../../icons/settings.svg';

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

  componentWillMount() {
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
        message: <FormattedMessage id="teamBots.success" defaultMessage="Settings updated!" description="Success message when an integration setting has been updated" />,
      });
    };
    const onFailure = () => {
      this.setState({
        messageBotId,
        message: <FormattedMessage id="teamBots.fail" defaultMessage="Error! Please try again." description="Error message when an integration setting did not update correctly" />,
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
      <div className="team-bots">
        { root.team_bots_listed.edges.map((teamBot) => {
          const bot = teamBot.node;
          const installation = this.getInstallation(bot.id);

          if (bot.default || bot.name === 'Smooch') {
            return null;
          }

          const botExpanded = installation && this.state.expanded === bot.dbid;
          return (
            <Box clone mb={5} key={bot.dbid}>
              <Card key={`bot-${bot.dbid}`}>
                <CardHeader
                  title={botName(bot)}
                  action={
                    <ButtonMain
                      variant="text"
                      size="default"
                      theme="text"
                      disabled={!installation}
                      onClick={this.handleToggleSettings.bind(this, bot.dbid)}
                      className="settingsIcon"
                      iconCenter={<SettingsIcon />}
                    />
                  }
                />
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <div className="typography-body1">
                      {bot.description}
                    </div>
                    <SwitchComponent
                      className={`team-bots__${bot.identifier}-${installation ? 'installed' : 'uninstalled'}`}
                      checked={Boolean(installation)}
                      onChange={this.handleToggle.bind(this, installation, bot, team)}
                      disabled={this.state.saving === bot.id}
                    />
                  </Box>
                </CardContent>
                <Collapse in={botExpanded} timeout="auto">
                  <CardContent>
                    { bot.installation?.json_settings ?
                      <React.Fragment>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <FormattedMessage id="teamBots.settings" defaultMessage="Settings" tagName="h5" description="section title for the settings of an individual integration" />
                          <div>
                            <ButtonMain
                              variant="contained"
                              size="default"
                              theme="brand"
                              onClick={this.handleSubmitSettings.bind(this, installation)}
                              label={
                                <FormattedMessage id="teamBots.save" defaultMessage="Save" description="Save button on an individual integration settings" />
                              }
                            />
                            { this.state.message && this.state.messageBotId === bot.dbid ?
                              <Box component="small" my={0} mx={1}>
                                {this.state.message}
                              </Box> : null }
                          </div>
                        </Box>
                        { botExpanded ?
                          <TeamBot
                            bot={bot}
                            value={this.state.settings[installation.id] || JSON.parse(installation.json_settings || '{}')}
                            onChange={this.handleSettingsUpdated.bind(this, installation)}
                          /> : null
                        }
                      </React.Fragment> :
                      <FormattedMessage
                        id="teamBots.noSettings"
                        defaultMessage="There are no settings for this bot."
                        description="message to the the user that there are no additional settings for an integration"
                      />
                    }
                  </CardContent>
                </Collapse>
              </Card>
            </Box>
          );
        })}
      </div>
    );
  }
}

export default TeamBots;
