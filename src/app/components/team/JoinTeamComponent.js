import React, { Component } from 'react';
import Relay from 'react-relay';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import styled from 'styled-components';
import RaisedButton from 'material-ui/RaisedButton';
import Card, { CardTitle, CardActions, CardText } from 'material-ui/Card';
import PageTitle from '../PageTitle';
import CreateTeamUserMutation from '../../relay/CreateTeamUserMutation';
import { mapGlobalMessage } from '../MappedMessage';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';
import { units } from '../../styles/js/variables';

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
    };
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  handleRequestAccess(e) {
    e.preventDefault();
    this.setState({ requestStatus: 'requested' });

    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      that.setState({ message });
    };

    const onSuccess = (response) => {
      const appName = mapGlobalMessage(that.props.intl, 'appNameHuman');
      const status = response.createTeamUser.team_user.status;
      let message = messages.success;
      if (status === 'member') {
        message = messages.autoApprove;
      }
      that.setState({
        message: that.props.intl.formatMessage(message, { team: that.props.team.name, appName }),
        requestStatus: status,
      });
    };

    Relay.Store.commitUpdate(
      new CreateTeamUserMutation({
        team_id: this.props.team.dbid,
        user_id: that.getContext().currentUser.dbid,
        status: 'requested',
      }),
      { onSuccess, onFailure },
    );
  }

  redirectIfMember() {
    if (this.alreadyMember()) {
      const team = this.props.team;
      const user = this.getContext().currentUser;
      const userTeams = JSON.parse(user.teams);
      let redirect = true;
      for (const teamName in userTeams) {
        const t = userTeams[teamName];
        if (t.id == team.dbid && team.private && t.status != 'member') {
          redirect = false;
        }
      }
      if (redirect) {
        this.getContext().history.push(`/${team.slug}`);
      }
    }
  }

  alreadyMember() {
    return this.getContext().currentUser.team_ids.indexOf(this.props.team.dbid) > -1;
  }

  componentWillMount() {
    this.redirectIfMember();
  }

  componentWillUpdate() {
    this.redirectIfMember();
  }

  render() {
    const team = this.props.team;
    const appName = mapGlobalMessage(this.props.intl, 'appNameHuman');
    const isRequestSent = this.state.requestStatus;
    const disableRequest = isRequestSent !== '';

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
                        defaultMessage={'You already requested to join {team} {appName}.'}
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
                        defaultMessage={'To request access to the {link} {appName}, click below:'}
                        values={{ link: <Link to={`/${team.slug}`}>{team.name}</Link>, appName }}
                      />
                    </div>
                  );
                })()}
              </CardText>

              {(() => {
                if (!this.alreadyMember()) {
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
                  </CardActions>;
                }
              })()}
            </Card>
          </ContentColumn>
        </div>
      </PageTitle>
    );
  }
}

JoinTeamComponent.propTypes = {
  intl: intlShape.isRequired,
};

JoinTeamComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(JoinTeamComponent);
