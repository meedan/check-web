import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Card, CardText, CardActions } from 'material-ui/Card';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import RaisedButton from 'material-ui/RaisedButton';
import Settings from '@material-ui/icons/Settings';
import Tooltip from '@material-ui/core/Tooltip';
import { Emojione } from 'react-emoji-render';
import { browserHistory } from 'react-router';
import styled from 'styled-components';
import TeamBot from './TeamBot';
import TeamRoute from '../../relay/TeamRoute';
import { units, title1, ContentColumn, black32 } from '../../styles/js/shared';
import DeleteTeamBotInstallationMutation from '../../relay/mutations/DeleteTeamBotInstallationMutation';
import UpdateTeamBotInstallationMutation from '../../relay/mutations/UpdateTeamBotInstallationMutation';
import ConfirmDialog from '../layout/ConfirmDialog';

const messages = defineMessages({
  confirmUninstall: {
    id: 'teamBots.confirmUninstall',
    defaultMessage: 'Are you sure you want to uninstall this bot?',
  },
  settingsTooltip: {
    id: 'teamBots.settingsTooltip',
    defaultMessage: 'Bot settings',
  },
});

const StyledCardText = styled(CardText)`
  display: flex;

  img {
    height: 100px;
    border: 1px solid ${black32};
    margin-${props => props.direction.to}: ${units(3)};
  }

  h2 {
    margin-bottom: ${units(1)};
  }
`;

const StyledSettings = styled.div`
  display: inline;

  .settingsIcon {
    vertical-align: middle;
    cursor: pointer;
    color: ${black32};
    margin: ${units(1)};
  }
`;

const StyledSchemaForm = styled.div`
  div {
    padding: 0 !important;
    box-shadow: none !important;
  }

  fieldset {
    border: 0;
    padding: 0;
  }

  button {
    display: none;
  }

  label + div {
    margin-top: 36px;
  }

  fieldset fieldset {
    padding: ${units(1)};
    margin-top: ${units(1)};
    border: 1px solid ${black32};
  }

  fieldset fieldset button {
    display: block !important;
    width: 32px !important;
    background: #fff !important;
    border-radius: 5px !important;
    color: ${black32} !important;
  }
`;

class TeamBotsComponent extends Component {
  static handleBotGardenClick() {
    browserHistory.push('/check/bot-garden');
  }

  constructor(props) {
    super(props);
    this.state = {
      expanded: {},
      settings: {},
      message: null,
      messageBotId: null,
      open: false,
      currentInstallation: null,
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

  handleClose() {
    this.setState({ open: false });
  }

  handleOpen(installation) {
    this.setState({ open: true, currentInstallation: installation });
  }

  handleConfirm() {
    this.handleClose();
    this.handleSubmitSettings(this.state.currentInstallation);
  }

  handleSettingsUpdated(installation, data) {
    const settings = Object.assign({}, this.state.settings);
    settings[installation.id] = data.formData;
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
    const expanded = Object.assign({}, this.state.expanded);
    expanded[botId] = !this.state.expanded[botId];
    this.setState({ expanded, message: null, messageBotId: null });
  }

  handleToggle(node) {
    const deleteBot = { id: node.id, teamId: this.props.team.id };
    const deleteBotName = node.team_bot.identifier !== 'smooch' ?
      node.team_bot.name : 'Check Message';

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
    const { team, direction } = this.props;

    return (
      <ContentColumn style={{ maxWidth: 900 }}>
        { team.team_bot_installations.edges.length === 0 ?
          <p style={{ paddingBottom: units(5), textAlign: 'center' }}>
            <FormattedMessage
              id="teamBots.noBots"
              defaultMessage="No bots installed."
            />
          </p>
          : null }
        { team.team_bot_installations.edges.map((installation) => {
          const bot = installation.node.team_bot;

          return (
            <Card
              style={{ marginBottom: units(5) }}
              key={`bot-${bot.dbid}`}
              expanded={this.state.expanded[bot.dbid]}
            >
              <StyledCardText direction={direction}>
                <img src={bot.avatar} alt={bot.name} />
                <div>
                  <h2 style={{ font: title1 }}>{bot.name}</h2>
                  <p>{bot.description}</p>
                  <div>
                    <Button onClick={() => browserHistory.push(`/check/bot/${bot.dbid}`)}>
                      <FormattedMessage id="teamBots.moreInfo" defaultMessage="More info" />
                    </Button>
                    <Button
                      className="team-bots__uninstall-button"
                      onClick={this.handleToggle.bind(this, installation.node)}
                    >
                      <FormattedMessage id="teamBots.remove" defaultMessage="Remove" />
                    </Button>
                  </div>
                </div>
              </StyledCardText>
              <CardActions style={{ padding: 0, textAlign: 'right' }}>
                <StyledSettings style={{ marginRight: 0 }}>
                  <Tooltip title={this.props.intl.formatMessage(messages.settingsTooltip)}>
                    <Settings
                      onClick={this.handleToggleSettings.bind(this, bot.dbid)}
                      className="settingsIcon"
                    />
                  </Tooltip>
                </StyledSettings>
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
              <Divider />
              <CardText expandable>
                { bot.settings_as_json_schema ?
                  <StyledSchemaForm>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3><FormattedMessage id="teamBots.settings" defaultMessage="Settings" /></h3>
                      <div>
                        <RaisedButton
                          primary
                          onClick={
                            bot.name === 'Smooch' ?
                              this.handleOpen.bind(this, installation.node) :
                              this.handleSubmitSettings.bind(this, installation.node)
                          }
                          label={
                            <FormattedMessage
                              id="teamBots.save"
                              defaultMessage="Save"
                            />
                          }
                        />
                        <small style={{ margin: `0 ${units(1)}` }}>
                          { this.state.message && this.state.messageBotId === bot.dbid ?
                            this.state.message : null
                          }
                        </small>
                      </div>
                    </div>
                    <TeamBot
                      bot={bot}
                      schema={JSON.parse(bot.settings_as_json_schema)}
                      uiSchema={JSON.parse(bot.settings_ui_schema)}
                      formData={this.state.settings[installation.node.id]}
                      onChange={this.handleSettingsUpdated.bind(this, installation.node)}
                    />
                  </StyledSchemaForm> :
                  <FormattedMessage
                    id="teamBots.noSettings"
                    defaultMessage="There are no settings for this bot."
                  />
                }
              </CardText>
            </Card>
          );
        })}
        <p style={{ textAlign: direction.to }}>
          <Button id="team-bots__bot-garden-button" onClick={TeamBotsComponent.handleBotGardenClick}>
            <span>
              <FormattedMessage
                id="teamBots.botGarden"
                defaultMessage="Browse the Bot Garden"
              /> <Emojione text="🤖 🌼" />
            </span>
          </Button>
        </p>
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
      </ContentColumn>
    );
  }
}

TeamBotsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

const TeamBotsContainer = Relay.createContainer(injectIntl(TeamBotsComponent), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
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
                settings_as_json_schema
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
  const params = { propTeam: props.team, direction: props.direction };
  return (
    <Relay.RootContainer
      Component={TeamBotsContainer}
      route={route}
      renderFetched={data => <TeamBotsContainer {...data} {...params} />}
    />
  );
};

export default TeamBots;
