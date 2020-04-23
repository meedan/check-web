import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import { Link, browserHistory } from 'react-router';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import BotRoute from '../relay/BotRoute';
import { units, ContentColumn, black32, black87 } from '../styles/js/shared';
import UserUtil from './user/UserUtil';
import PageTitle from './PageTitle';
import Message from './Message';
import CheckContext from '../CheckContext';
import { stringHelper } from '../customHelpers';
import CreateTeamBotInstallationMutation from '../relay/mutations/CreateTeamBotInstallationMutation';

const messages = defineMessages({
  confirmInstall: {
    id: 'bot.confirmInstall',
    defaultMessage: 'Are you sure you want to install bot in {teamName}?',
  },
  confirmUninstall: {
    id: 'bot.confirmUninstall',
    defaultMessage: 'Are you sure you want to uninstall this bot from {teamName}?',
  },
  cantChange: {
    id: 'bot.cantChange',
    defaultMessage: 'Sorry, an error occurred while updating the bot. Please try again and contact {supportEmail} if the condition persists.',
  },
});

const StyledCardText = styled(CardContent)`
  display: flex;

  img {
    height: 150px;
    border: 1px solid ${black32};
    margin-${props => props.direction.to}: ${units(3)};
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

const StyledInstall = styled.div`
  ${props => props.direction.to}: 0;
  margin-${props => props.direction.from}: auto;
  margin-${props => props.direction.to}: 0;
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
      const errorMessage = this.props.intl.formatMessage(messages.cantChange, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      this.setState({ message: errorMessage });
    };

    Relay.Store.commitUpdate(
      new CreateTeamBotInstallationMutation({ bot, team }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { bot } = this.props;

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const botDate = new Date(parseInt(bot.updated_at, 10) * 1000);

    return (
      <PageTitle prefix={bot.name} skipTeam>
        <ContentColumn>
          <Message message={this.state.message} />
          <Card key={`bot-${bot.dbid}`}>
            <StyledCardText direction={direction}>
              <img src={bot.avatar} alt={bot.name} />
              <div>
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
              </div>
              <StyledInstall direction={direction}>
                <Button
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
              </StyledInstall>
            </StyledCardText>
            <CardContent>
              <p><b><FormattedMessage id="bot.permissions" defaultMessage="Permissions" /></b></p>
              <p>
                <FormattedMessage
                  id="bot.permissionsText"
                  defaultMessage="This bot has an access level of {role}."
                  values={{
                    role: UserUtil.localizedRole(bot.role, this.props.intl),
                  }}
                />
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

BotComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

BotComponent.contextTypes = {
  store: PropTypes.object,
};

const BotContainer = Relay.createContainer(injectIntl(BotComponent), {
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
