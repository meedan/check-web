import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import PageTitle from '../PageTitle';
import CreateTeamUserMutation from '../../relay/mutations/CreateTeamUserMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { ContentColumn } from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';

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
      browserHistory.push('/check/not-found');
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
      const fallbackMessage = (
        <FormattedMessage
          id="joinTeamComponent.error"
          defaultMessage="Sorry, an error occurred while sending your request. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message });
    };

    const onSuccess = (response) => {
      const { createTeamUser: { team_user: { status } } } = response;
      this.setState({
        message: status === 'member' ? (
          <FormattedMessage
            id="joinTeamComponent.autoApprove"
            defaultMessage="Thanks for joining {team}! You can start contributing right away."
            values={{ team: this.props.team.name }}
          />
        ) : (
          <FormattedMessage
            id="joinTeamComponent.success"
            defaultMessage="Thanks for your interest in joining {team}! A workspace administrator will review your application soon."
            values={{ team: this.props.team.name }}
          />
        ),
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
        browserHistory.push(`/${team.slug}`);
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
        prefix={<FormattedMessage id="joinTeamComponent.title" defaultMessage="Join Workspace" />}
        team={team}
      >
        <div>
          <ContentColumn>
            <Message message={this.state.message} />
            <Card>
              <CardHeader
                title={<FormattedMessage
                  id="joinTeamComponent.mainHeading"
                  defaultMessage="Request to join"
                />}
              />
              <CardContent>

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
              </CardContent>

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

JoinTeamComponent.contextTypes = {
  store: PropTypes.object,
};

export default JoinTeamComponent;
