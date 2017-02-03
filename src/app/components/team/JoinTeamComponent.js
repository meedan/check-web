import React, { Component } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import { Link } from 'react-router';
import CreateTeamUserMutation from '../../relay/CreateTeamUserMutation';
import Message from '../Message';
import { pageTitle } from '../../helpers';
import CheckContext from '../../CheckContext';

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
      let message = 'Sorry, could not send your request';
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ message: `Thanks for your interest in joining ${this.props.team.name} Check! A team leader will review your application soon.`, isRequestSent: true });
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

  render() {
    const team = this.props.team;

    const isRequestSent = this.state.isRequestSent;

    if (this.getContext().currentUser.team_ids.indexOf(team.dbid) > -1) {
      return (
        <DocumentTitle title={pageTitle('Join Team', false, team)}>
          <div className="join-team">
            <p className="join-team__blurb-graf">You already requested to join <Link to={`/${team.slug}`}>{team.name}</Link> Check.</p>
          </div>
        </DocumentTitle>
      );
    }

    return (
      <DocumentTitle title={pageTitle('Join Team', false, team)}>
        <div className="join-team">
          <Message message={this.state.message} />
          <h2 className="join-team__main-heading">Request to Join</h2>
          <div className="join-team__blurb">
            <p className="join-team__blurb-graf">To request access to the <Link to={`/${team.slug}`}>{team.name}</Link> Check, click below:</p>
            <div>
              <button
                className={`join-team__button${isRequestSent ? ' join-team__button--submitted' : ''}`}
                onClick={this.handleRequestAccess.bind(this)}
                disabled={isRequestSent}
              >
                {isRequestSent ? 'Request Sent' : 'Request to Join'}
              </button>
              <p className="join-team__blurb-graf">Your request {isRequestSent ? 'has been' : 'will be'} sent to the project admins for approval.</p>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

JoinTeamComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default JoinTeamComponent;
