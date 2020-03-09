import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Card, { CardTitle, CardActions, CardText } from 'material-ui/Card';
import PageTitle from '../PageTitle';
import CreateTeamUserMutation from '../../relay/mutations/CreateTeamUserMutation';
import { mapGlobalMessage } from '../MappedMessage';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { ContentColumn } from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  error: {
    id: 'joinTeamComponent.error',
    defaultMessage: 'Sorry, an error occurred while sending your request. Please try again and contact {supportEmail} if the condition persists.',
  },
  success: {
    id: 'joinTeamComponent.success',
    defaultMessage:
      'Thanks for your interest in joining {team}! A workspace administrator will review your application soon.',
  },
  autoApprove: {
    id: 'joinTeamComponent.autoApprove',
    defaultMessage: 'Thanks for joining {team}! You can start contributing right away.',
  },
  title: {
    id: 'joinTeamComponent.title',
    defaultMessage: 'Join Workspace',
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
      const fallbackMessage = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
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
                  defaultMessage="Request to join"
                />}
              />
              <CardText>

                {(() => {
                  if (this.alreadyMember()) {
                    return (
                      <FormattedMessage
                        id="joinTeamComponent.alreadyRequested"
                        defaultMessage="You already requested to join {team}."
                        values={{ team: <Link to={`/${team.slug}`}>{team.name}</Link> }}
                      />
                    );
                  } else if (isRequestSent === 'requested') {
                    return (
                      <FormattedMessage
                        id="joinTeamComponent.requestHasBeenSent"
                        defaultMessage="Your request has been sent to the workspace administrators for approval."
                      />
                    );
                  }
                  return (
                    <div>
                      <FormattedMessage
                        id="joinTeamComponent.blurbGraf"
                        defaultMessage="To request to join {team}, click below:"
                        values={{ team: <Link to={`/${team.slug}`}>{team.name}</Link> }}
                      />
                    </div>
                  );
                })()}
              </CardText>

              {(() => {
                if (!this.alreadyMember()) {
                  return (
                    <CardActions>
                      <Button
                        variant="contained"
                        primary
                        className={`join-team__button${isRequestSent === ''
                          ? ''
                          : ' join-team__button--submitted'}`}
                        onClick={this.handleRequestAccess.bind(this)}
                        disabled={disableRequest}
                      >
                        {(() => {
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
                      </Button>
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
