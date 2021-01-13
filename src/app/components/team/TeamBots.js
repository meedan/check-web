import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import Tooltip from '@material-ui/core/Tooltip';
import { browserHistory } from 'react-router';
import SettingsHeader from './SettingsHeader';
import TeamBot from './TeamBot';
import TeamRoute from '../../relay/TeamRoute';
import { ContentColumn } from '../../styles/js/shared';
import DeleteTeamBotInstallationMutation from '../../relay/mutations/DeleteTeamBotInstallationMutation';
import UpdateTeamBotInstallationMutation from '../../relay/mutations/UpdateTeamBotInstallationMutation';
import ConfirmDialog from '../layout/ConfirmDialog';
import { languageLabel } from '../../LanguageRegistry';
import { botName } from '../../helpers';

class TeamBotsComponent extends Component {
  static handleBotGardenClick() {
    browserHistory.push('/check/bot-garden');
  }

  constructor(props) {
    super(props);
    this.state = {
      expanded: null,
      settings: {},
      message: null,
      messageBotId: null,
      open: false,
      currentInstallation: null,
      confirmedToLeave: false,
      leaveLocation: null,
      smoochBotLanguagesWithError: [],
    };
  }

  componentWillMount() {
    const settings = {};
    this.props.team.team_bot_installations.edges.forEach((installation) => {
      const value = installation.node.json_settings || '{}';
      settings[installation.node.id] = JSON.parse(value);
    });
    this.setState({ settings });
  }

  componentDidMount() {
    this.unregisterLeaveHook = this.props.router.setRouteLeaveHook(
      this.props.route,
      (nextLocation) => {
        if (!this.hasUnsavedChanges || this.state.confirmedToLeave) {
          return true;
        }
        this.setState({ leaveLocation: nextLocation });
        return false;
      },
    );
  }

  get hasUnsavedChanges() {
    const savedSettings = {};
    this.props.team.team_bot_installations.edges.forEach((installation) => {
      const value = installation.node.json_settings || '{}';
      savedSettings[installation.node.id] = JSON.parse(value);
    });
    return JSON.stringify(savedSettings) !== JSON.stringify(this.state.settings);
  }

  componentWillUmount() {
    this.unregisterLeaveHook();
  }

  handleConfirmLeave() {
    this.setState({ confirmedToLeave: true }, () => {
      browserHistory.push(this.state.leaveLocation);
    });
  }

  handleCancelLeave() {
    this.setState({ leaveLocation: null });
  }

  handleClose() {
    this.setState({ open: false, smoochBotLanguagesWithError: [] });
  }

  handleOpen(installation) {
    const smoochBotLanguagesWithError = [];
    const settings = this.state.settings[installation.id];
    settings.smooch_workflows.forEach((workflow) => {
      if (workflow.smooch_state_main && workflow.smooch_state_main.smooch_menu_options) {
        const invalidOption = workflow.smooch_state_main.smooch_menu_options
          .find(o => o.smooch_menu_option_keyword.split(',').find(k => parseInt(k.trim(), 10) === 9));
        if (invalidOption) {
          smoochBotLanguagesWithError.push(languageLabel(workflow.smooch_workflow_language));
        }
      }
    });
    if (smoochBotLanguagesWithError.length > 0) {
      this.setState({ currentInstallation: installation, smoochBotLanguagesWithError });
    } else {
      this.setState({ open: true, currentInstallation: installation });
    }
  }

  handleConfirm() {
    this.handleClose();
    this.handleSubmitSettings(this.state.currentInstallation);
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
        message: <FormattedMessage id="teamBots.success" defaultMessage="Settings updated!" />,
      });
    };
    const onFailure = () => {
      this.setState({
        messageBotId,
        message: <FormattedMessage id="teamBots.fail" defaultMessage="Error! Please try again." />,
      });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamBotInstallationMutation({
        id: installation.id,
        json_settings: settings,
      }),
      { onSuccess, onFailure },
    );
  }

  handleToggleSettings(botId) {
    const expanded = (this.state.expanded === botId) ? null : botId;
    this.setState({ expanded, message: null, messageBotId: null });
  }

  handleToggle(node) {
    const deleteBot = { id: node.id, teamId: this.props.team.id };
    const deleteBotName = botName(node.team_bot);

    this.setState({
      showConfirmDeleteDialog: true,
      deleteBot,
      deleteBotName,
    });
  }

  handleCloseDialog() {
    this.setState({ showConfirmDeleteDialog: false });
  }

  handleDestroy() {
    const { deleteBot } = this.state;
    Relay.Store.commitUpdate(new DeleteTeamBotInstallationMutation(deleteBot));
    this.setState({ showConfirmDeleteDialog: false });
  }

  render() {
    const { team } = this.props;

    return (
      <Box className="team-bots">
        <ContentColumn large>
          <SettingsHeader
            title={
              <FormattedMessage
                id="teamBots.title"
                defaultMessage="Bots"
              />
            }
            subtitle={
              <FormattedMessage
                id="teamBots.subtitle"
                defaultMessage="Dedicated tools to automate archiving and connect a social media to Check tiplines."
              />
            }
            helpUrl="http://help.checkmedia.org/en/articles/3633646-bots-overview"
            actionButton={
              <Button id="team-bots__bot-garden-button" onClick={TeamBotsComponent.handleBotGardenClick} color="primary" variant="contained">
                <FormattedMessage
                  id="teamBots.browserBots"
                  defaultMessage="Browse bots"
                />
              </Button>
            }
          />
          { team.team_bot_installations.edges.length === 0 ?
            <Box commponent="p" pb={5} textAlign="center">
              <FormattedMessage
                id="teamBots.noBots"
                defaultMessage="No bots installed."
              />
            </Box>
            : null }
          { team.team_bot_installations.edges.map((installation) => {
            const bot = installation.node.team_bot;

            if (bot.default) {
              return null;
            }

            const botExpanded = this.state.expanded === bot.dbid;
            return (
              <Box clone mb={5}>
                <Card key={`bot-${bot.dbid}`}>
                  <CardHeader
                    title={botName(bot)}
                    action={
                      <Tooltip
                        title={
                          <FormattedMessage id="teamBots.settingsTooltip" defaultMessage="Bot settings" />
                        }
                      >
                        <IconButton
                          onClick={this.handleToggleSettings.bind(this, bot.dbid)}
                          className="settingsIcon"
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent>
                    {bot.description}
                  </CardContent>
                  <CardActions>
                    <Button
                      color="primary"
                      size="small"
                      className="team-bots__uninstall-button"
                      onClick={this.handleToggle.bind(this, installation.node)}
                    >
                      <FormattedMessage id="teamBots.remove" defaultMessage="Remove" />
                    </Button>
                  </CardActions>
                  <ConfirmDialog
                    open={this.state.showConfirmDeleteDialog}
                    title={
                      <FormattedMessage
                        id="teamBots.confirmDeleteTitle"
                        defaultMessage="You are about to deactivate {botName}"
                        values={{ botName: this.state.deleteBotName }}
                      />
                    }
                    blurb={
                      <FormattedMessage
                        id="teamBots.confirmDeleteBlurb"
                        defaultMessage="All settings will be deleted and cannot be recovered. Are you sure you want to proceed?"
                      />
                    }
                    handleClose={this.handleCloseDialog.bind(this)}
                    handleConfirm={this.handleDestroy.bind(this)}
                  />
                  <ConfirmDialog
                    open={this.state.leaveLocation}
                    title={
                      <FormattedMessage
                        id="teamBots.confirmLeaveTitle"
                        defaultMessage="Leave without saving?"
                      />
                    }
                    blurb={
                      <FormattedMessage
                        id="teamBots.confirmLeaveText"
                        defaultMessage="If you leave, you will lose your changes."
                      />
                    }
                    continueButtonLabel={
                      <FormattedMessage
                        id="teamBots.confirmLeaveButtonLabel"
                        defaultMessage="Leave"
                      />
                    }
                    handleClose={this.handleCancelLeave.bind(this)}
                    handleConfirm={this.handleConfirmLeave.bind(this)}
                  />
                  <Divider />
                  <Collapse in={botExpanded} timeout="auto">
                    <CardContent>
                      { bot.settings_as_json_schema ?
                        <React.Fragment>
                          { bot.name !== 'Fetch' ?
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <h3><FormattedMessage id="teamBots.settings" defaultMessage="Settings" /></h3>
                              <div>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={
                                    bot.name === 'Smooch' ?
                                      this.handleOpen.bind(this, installation.node) :
                                      this.handleSubmitSettings.bind(this, installation.node)
                                  }
                                >
                                  <FormattedMessage
                                    id="teamBots.save"
                                    defaultMessage="Save"
                                  />
                                </Button>
                                <Box component="small" my={0} mx={1}>
                                  { this.state.message && this.state.messageBotId === bot.dbid ?
                                    this.state.message : null
                                  }
                                </Box>
                              </div>
                            </Box> : null }
                          { botExpanded ?
                            <TeamBot
                              team={team}
                              bot={bot}
                              installationId={installation.node.id}
                              schema={JSON.parse(bot.settings_as_json_schema)}
                              uiSchema={JSON.parse(bot.settings_ui_schema)}
                              value={this.state.settings[installation.node.id]}
                              onChange={this.handleSettingsUpdated.bind(this, installation.node)}
                            /> : null
                          }
                        </React.Fragment> :
                        <FormattedMessage
                          id="teamBots.noSettings"
                          defaultMessage="There are no settings for this bot."
                        />
                      }
                    </CardContent>
                  </Collapse>
                </Card>
              </Box>
            );
          })}
          <ConfirmDialog
            open={this.state.open}
            title={<FormattedMessage id="teamBots.confirmationTitle" defaultMessage="Confirm" />}
            blurb={<FormattedMessage
              id="teamBots.confirmationMessage"
              defaultMessage="You are about to make the changes to your bot live. All the users on your tipline will see those changes. Are you sure you want to proceed?"
            />}
            handleClose={this.handleClose.bind(this)}
            handleConfirm={this.handleConfirm.bind(this)}
          />
          <ConfirmDialog
            open={this.state.smoochBotLanguagesWithError.length}
            title={<FormattedMessage id="teamBots.smoochErrorTitle" defaultMessage="Unavailable option" />}
            blurb={<FormattedMessage
              id="teamBots.smoochErrorMessage"
              defaultMessage="You cannot use '9' as a scenario option in the main menu. Please choose another value for the following languages: {languages}"
              values={{
                languages: this.state.smoochBotLanguagesWithError.join(', '),
              }}
            />}
            handleClose={this.handleClose.bind(this)}
            cancelButtonLabel={
              <FormattedMessage
                id="teamBots.close"
                defaultMessage="Close"
              />
            }
          />
        </ContentColumn>
      </Box>
    );
  }
}

const TeamBotsContainer = Relay.createContainer(TeamBotsComponent, {
  initialVariables: {
    teamSlug: /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null,
  },
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
        get_language
        get_languages
        team_bot_installations(first: 10000) {
          edges {
            node {
              id
              json_settings
              team_bot: bot_user {
                id
                dbid
                avatar
                name
                identifier
                default
                settings_as_json_schema(team_slug: $teamSlug)
                settings_ui_schema
                description: get_description
              }
            }
          }
        }
      }
    `,
  },
});

const TeamBots = (props) => {
  const route = new TeamRoute({ teamSlug: props.team.slug });
  const params = { propTeam: props.team };
  return (
    <Relay.RootContainer
      Component={TeamBotsContainer}
      route={route}
      renderFetched={data =>
        <TeamBotsContainer {...data} {...params} route={props.route} router={props.router} />}
    />
  );
};

export default TeamBots;
