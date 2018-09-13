import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Card, CardText, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Switch from 'material-ui-next/Switch';
import { Emojione } from 'react-emoji-render';
import { Link, browserHistory } from 'react-router';
import styled from 'styled-components';
import TeamRoute from '../../relay/TeamRoute';
import { units, ContentColumn, black32 } from '../../styles/js/shared';
import DeleteTeamBotInstallationMutation from '../../relay/mutations/DeleteTeamBotInstallationMutation';

const messages = defineMessages({
  confirmUninstall: {
    id: 'teamBots.confirmUninstall',
    defaultMessage: 'Are you sure you want to uninstall this bot?',
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

const StyledToggle = styled.div`
  display: inline;

  span.toggleLabel {
    font-weight: bold;
    text-transform: uppercase;
    color: ${black32};
    align-self: center;
  }
`;

class TeamBotsComponent extends Component {
  static handleBotGardenClick() {
    browserHistory.push('/check/bot-garden');
  }

  handleToggle(id, teamId) {
    // eslint-disable-next-line no-alert
    if (window.confirm(this.props.intl.formatMessage(messages.confirmUninstall))) {
      const onSuccess = () => {};
      const onFailure = () => {};

      Relay.Store.commitUpdate(
        new DeleteTeamBotInstallationMutation({
          id,
          teamId,
        }),
        { onSuccess, onFailure },
      );
    }
  }

  render() {
    const { team, direction } = this.props;

    return (
      <ContentColumn>
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
            <Card style={{ marginBottom: units(5) }} key={`bot-${bot.dbid}`}>
              <StyledCardText direction={direction}>
                <img src={bot.avatar} alt={bot.name} />
                <div>
                  <h2>{bot.name}</h2>
                  <p>{bot.description}</p>
                  <p>
                    <Link to={`/check/bot/${bot.dbid}`}>
                      <FormattedMessage id="teamBots.moreInfo" defaultMessage="More info" />
                    </Link>
                  </p>
                </div>
              </StyledCardText>
              <CardActions style={{ padding: 0, textAlign: 'right' }}>
                <StyledToggle style={{ marginRight: 0 }}>
                  <span className="toggleLabel">
                    <FormattedMessage id="teamBots.inUse" defaultMessage="In Use" />
                  </span>
                  <Switch
                    checked
                    onClick={this.handleToggle.bind(this, installation.node.id, team.id)}
                  />
                </StyledToggle>
              </CardActions>
            </Card>
          );
        })}
        <p style={{ textAlign: direction.to }}>
          <FlatButton
            onClick={TeamBotsComponent.handleBotGardenClick}
            label={
              <span>
                <FormattedMessage
                  id="teamBots.botGarden"
                  defaultMessage="Browse the Bot Garden"
                /> <Emojione text="🤖 🌼" />
              </span>
            }
          />
        </p>
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
              team_bot {
                id
                dbid
                avatar
                name
                description
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
