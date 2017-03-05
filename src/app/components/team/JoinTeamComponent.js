import React, { Component } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import CreateTeamUserMutation from '../../relay/CreateTeamUserMutation';
import Message from '../Message';
import { pageTitle } from '../../helpers';
import CheckContext from '../../CheckContext';

const messages = defineMessages({
  error: {
    id: 'joinTeamComponent.error',
    defaultMessage: 'Sorry, could not send your request',
  },
  success: {
    id: 'joinTeamComponent.success',
    defaultMessage: 'Thanks for your interest in joining {team} Check! A team leader will review your application soon.',
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
      isRequestSent: false,
    };
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  handleRequestAccess(e) {
    e.preventDefault();
    this.setState({ isRequestSent: true });

    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ message: that.props.intl.formatMessage(messages.success, { team: that.props.team.name }), isRequestSent: true });
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
    return (this.getContext().currentUser.team_ids.indexOf(this.props.team.dbid) > -1);
  }

  componentWillMount() {
    this.redirectIfMember();
  }

  componentWillUpdate() {
    this.redirectIfMember();
  }

  render() {
    const team = this.props.team;

    const isRequestSent = this.state.isRequestSent;

    if (this.alreadyMember()) {
      return (
        <DocumentTitle title={pageTitle(this.props.intl.formatMessage(messages.title), false, team)}>
          <div className="join-team">
            <p className="join-team__blurb-graf">
              <FormattedMessage
                id="joinTeamComponent.alreadyRequested"
                defaultMessage={'You already requested to join {team} Check.'}
                values={{ team: <Link to={`/${team.slug}`}>{team.name}</Link> }}
              />
            </p>
          </div>
        </DocumentTitle>
      );
    }

    return (
      <DocumentTitle title={pageTitle(this.props.intl.formatMessage(messages.title), false, team)}>
        <div className="join-team">
          <Message message={this.state.message} />
          <h2 className="join-team__main-heading"><FormattedMessage id="joinTeamComponent.mainHeading" defaultMessage="Request to Join" /></h2>
          <div className="join-team__blurb">
            <p className="join-team__blurb-graf">
              <FormattedMessage
                id="joinTeamComponent.blurbGraf"
                defaultMessage={'To request access to the {link} Check, click below:'}
                values={{ link: <Link to={`/${team.slug}`}>{team.name}</Link> }}
              />
            </p>
            <div>
              <button
                className={`join-team__button${isRequestSent ? ' join-team__button--submitted' : ''}`}
                onClick={this.handleRequestAccess.bind(this)}
                disabled={isRequestSent}
              >
                {isRequestSent ? <FormattedMessage id="joinTeamComponent.buttonSubmitted" defaultMessage="Request Sent" /> : <FormattedMessage id="joinTeamComponent.buttonSubmit" defaultMessage="Request to Join" />}
              </button>
              <p className="join-team__blurb-graf">
                {isRequestSent ? <FormattedMessage id="joinTeamComponent.requestHasBeenSent" defaultMessage="Your request has been sent to the project admins for approval." /> : <FormattedMessage id="joinTeamComponent.requestWillBeSent" defaultMessage="Your request will be sent to the project admins for approval." />}
              </p>
            </div>
          </div>
        </div>
      </DocumentTitle>
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
