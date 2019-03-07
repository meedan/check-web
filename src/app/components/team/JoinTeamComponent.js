import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import Card, { CardTitle, CardActions, CardText } from 'material-ui/Card';
import PageTitle from '../PageTitle';
import CreateTeamUserMutation from '../../relay/mutations/CreateTeamUserMutation';
import { mapGlobalMessage } from '../MappedMessage';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import { safelyParseJSON } from '../../helpers';
import { ContentColumn } from '../../styles/js/shared';

const messages = defineMessages({
  error: {
    id: 'joinTeamComponent.error',
    defaultMessage: 'Sorry, could not send your request',
  },
  success: {
    id: 'joinTeamComponent.success',
    defaultMessage:
      'Thanks for your interest in joining {team} {appName}! A team leader will review your application soon.',
  },
  autoApprove: {
    id: 'joinTeamComponent.autoApprove',
    defaultMessage: 'Thanks for joining {team} {appName}! You can start contributing right away.',
  },
  title: {
    id: 'joinTeamComponent.title',
    defaultMessage: 'Join Team',
  },
});

class JoinTeamComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requestStatus: '',
      message: '',
    };
  }

  componentWillMount() {
    const { team } = this.props;

    if (!team) {
      this.getContext().history.push('/check/not-found');
      this.setState({ willRedirect: true });
      return;
    }

    this.redirectIfMember();
  }

  componentWillUpdate() {
    this.redirectIfMember();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleRequestAccess(e) {
    e.preventDefault();
    this.setState({ requestStatus: 'requested' });

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.error);
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    const onSuccess = (response) => {
      const appName = mapGlobalMessage(this.props.intl, 'appNameHuman');
      const { createTeamUser: { team_user: { status } } } = response;
      const message = status === 'member' ? messages.autoApprove : messages.success;
      this.setState({
        message: this.props.intl.formatMessage(message, {
          team: this.props.team.name, appName,
        }),
        requestStatus: status,
      });
    };

    Relay.Store.commitUpdate(
      new CreateTeamUserMutation({
        team_id: this.props.team.dbid,
        user_id: this.getContext().currentUser.dbid,
        status: 'requested',
      }),
      { onSuccess, onFailure },
    );
  }

  redirectIfMember() {
    if (this.alreadyMember()) {
      const { team } = this.props;
      const { currentUser: user } = this.getContext();
      const userTeams = JSON.parse(user.teams);
      let redirect = true;
      Object.keys(userTeams).forEach((teamName) => {
        const t = userTeams[teamName];
        if (t.id === team.dbid && team.private && t.status !== 'member') {
          redirect = false;
        }
      });
      if (redirect) {
        this.getContext().history.push(`/${team.slug}`);
      }
    }
  }

  alreadyMember() {
    const teams = [];
    const userTeams = JSON.parse(this.getContext().currentUser.teams);
    Object.keys(userTeams).forEach((teamName) => {
      if (userTeams[teamName].status !== 'invited') {
        teams.push(userTeams[teamName].id);
      }
    });
    return teams.indexOf(this.props.team.dbid) > -1;
  }

  render() {
    const { team } = this.props;
    const appName = mapGlobalMessage(this.props.intl, 'appNameHuman');
    const { requestStatus: isRequestSent } = this.state;
    const disableRequest = isRequestSent !== '';

    if (this.state.willRedirect) {
      return null;
    }

    return (
      <PageTitle
        prefix={this.props.intl.formatMessage(messages.title)}
        skipTeam={false}
        team={team}
      >
        <div>
          <ContentColumn>
            <Message message={this.state.message} />
            <Card>
              <CardTitle
                title={<FormattedMessage
                  id="joinTeamComponent.mainHeading"
                  defaultMessage="Request to Join"
                />}
              />
              <CardText>

                {(() => {
                  if (this.alreadyMember()) {
                    return (
                      <FormattedMessage
                        id="joinTeamComponent.alreadyRequested"
                        defaultMessage="You already requested to join {team} {appName}."
                        values={{ team: <Link to={`/${team.slug}`}>{team.name}</Link>, appName }}
                      />
                    );
                  } else if (isRequestSent === 'requested') {
                    return (
                      <FormattedMessage
                        id="joinTeamComponent.requestHasBeenSent"
                        defaultMessage="Your request has been sent to the project admins for approval."
                      />
                    );
                  }
                  return (
                    <div>
                      <FormattedMessage
                        id="joinTeamComponent.blurbGraf"
                        defaultMessage="To request access to the {link} {appName}, click below:"
                        values={{ link: <Link to={`/${team.slug}`}>{team.name}</Link>, appName }}
                      />
                    </div>
                  );
                })()}
              </CardText>

              {(() => {
                if (!this.alreadyMember()) {
                  return (
                    <CardActions>
                      <RaisedButton
                        primary
                        className={`join-team__button${isRequestSent === ''
                          ? ''
                          : ' join-team__button--submitted'}`}
                        onClick={this.handleRequestAccess.bind(this)}
                        disabled={disableRequest}
                        label={(() => {
                          if (isRequestSent === 'requested') {
                            return (
                              <FormattedMessage
                                id="joinTeamComponent.buttonSubmitted"
                                defaultMessage="Request Sent"
                              />
                            );
                          }
                          return (
                            <FormattedMessage
                              id="joinTeamComponent.buttonSubmit"
                              defaultMessage="Request to Join"
                            />
                          );
                        })()}
                      />
                    </CardActions>
                  );
                }
                return null;
              })()}
            </Card>
          </ContentColumn>
        </div>
      </PageTitle>
    );
  }
}

JoinTeamComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

JoinTeamComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(JoinTeamComponent);
