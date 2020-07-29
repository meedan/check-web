import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import { Link, browserHistory } from 'react-router';
import styled from 'styled-components';
import BotRoute from '../relay/BotRoute';
import { units, ContentColumn, black32, black87 } from '../styles/js/shared';
import { LocalizedRole } from './user/UserUtil';
import PageTitle from './PageTitle';
import Message from './Message';
import CheckContext from '../CheckContext';
import { stringHelper } from '../customHelpers';
import CreateTeamBotInstallationMutation from '../relay/mutations/CreateTeamBotInstallationMutation';

const StyledCardText = styled(CardContent)`
  display: flex;

  img {
    height: 150px;
    border: 1px solid ${black32};
    margin-${props => props.theme.dir === 'rtl' ? 'left' : 'right'}: ${units(3)};
  }

  h2 {
    margin-bottom: ${units(1)};
  }

  p {
    margin-top: ${units(3)};
  }
`;

const StyledCardFooter = styled.div`
  display: flex;
  padding-top: ${units(3)};

  div {
    flex-grow: 1;
  }

  span {
    color: ${black32};
  }

  b span {
    color: ${black87};
  }
`;

const CardContainer = styled.div`
  flex: 1 1 auto;
`;

const ButtonContainer = styled.div`
  flex: 0 0 auto;
`;

class BotComponent extends Component {
  constructor(props) {
    super(props);

    this.state = { message: null };
  }

  getTeam() {
    const store = new CheckContext(this).getContextStore();
    let { team } = store;
    if (!team) {
      const user = store.currentUser;
      if (user) {
        team = user.current_team;
      }
    }
    return team;
  }

  handleToggle() {
    const { bot } = this.props;

    const team = this.getTeam();

    const onSuccess = () => {
      if (team) {
        browserHistory.push(`/${team.slug}/settings/bots`);
      }
    };

    const onFailure = () => {
      this.setState({
        message: (
          <FormattedMessage
            id="bot.cantChange"
            defaultMessage="Sorry, an error occurred while updating the bot. Please try again and contact {supportEmail} if the condition persists."
            values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
          />
        ),
      });
    };

    Relay.Store.commitUpdate(
      new CreateTeamBotInstallationMutation({ bot, team }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { bot } = this.props;
    const botDate = new Date(parseInt(bot.updated_at, 10) * 1000);

    return (
      <PageTitle prefix={bot.name}>
        <ContentColumn>
          <Message message={this.state.message} />
          <Card key={`bot-${bot.dbid}`}>
            <StyledCardText>
              <img src={bot.avatar} alt={bot.name} />
              <CardContainer>
                <CardHeader
                  style={{ padding: 0, paddingTop: units(2) }}
                  title={bot.name}
                  subheader={
                    bot.team_author ?
                      <FormattedMessage
                        id="bot.madeBy"
                        defaultMessage="Made by {teamLink}"
                        values={{
                          teamLink: <Link to={`/${bot.team_author.slug}`}>{bot.team_author.name}</Link>,
                        }}
                      /> : null
                  }
                />
                <p>{bot.description}</p>
              </CardContainer>
              <ButtonContainer>
                <Button
                  id="bot__install-button"
                  variant="contained"
                  color="primary"
                  onClick={this.handleToggle.bind(this)}
                  disabled={bot.installed}
                >
                  { bot.installed ?
                    <FormattedMessage id="bot.installed" defaultMessage="Installed" /> :
                    <FormattedMessage id="bot.install" defaultMessage="Install" />
                  }
                </Button>
              </ButtonContainer>
            </StyledCardText>
            <CardContent>
              <p><b><FormattedMessage id="bot.permissions" defaultMessage="Permissions" /></b></p>
              <p>
                <LocalizedRole role={bot.role}>
                  {roleText => (
                    <FormattedMessage
                      id="bot.permissionsText"
                      defaultMessage="This bot has an access level of {role}."
                      values={{ role: roleText }}
                    />
                  )}
                </LocalizedRole>
              </p>
              { bot.source_code_url ?
                <p>
                  <a href={bot.source_code_url} target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="bot.sourceCode" defaultMessage="View source code" />
                  </a>
                </p> : null }
              <Divider />
              <StyledCardFooter>
                <div>
                  <b><FormattedMessage id="bot.updatedAt" defaultMessage="Updated" /></b><br />
                  <span>
                    <FormattedDate value={botDate} day="numeric" month="numeric" year="numeric" />
                  </span>
                </div>
                <div>
                  <b><FormattedMessage id="bot.version" defaultMessage="Version" /></b><br />
                  <span>{bot.version}</span>
                </div>
                <div>
                  <b><FormattedMessage id="bot.installs" defaultMessage="Installs" /></b><br />
                  <span>{bot.installations_count}</span>
                </div>
              </StyledCardFooter>
            </CardContent>
          </Card>
        </ContentColumn>
      </PageTitle>
    );
  }
}

BotComponent.contextTypes = {
  store: PropTypes.object,
};

const BotContainer = Relay.createContainer(BotComponent, {
  fragments: {
    bot: () => Relay.QL`
      fragment on BotUser {
        id
        dbid
        name
        avatar
        description: get_description
        installation {
          id
          team {
            id
            dbid
            name
            permissions
          }
        }
        installed
        source_code_url: get_source_code_url
        updated_at
        version: get_version
        role: get_role
        installations_count
        team_author {
          name
          slug
        }
      }
    `,
  },
});

const Bot = (props) => {
  const botId = props.params.botId || 0;
  const route = new BotRoute({ id: botId });
  return (
    <Relay.RootContainer
      forceFetch
      Component={BotContainer}
      route={route}
    />
  );
};

export default Bot;
