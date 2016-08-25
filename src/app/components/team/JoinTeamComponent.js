import React, { Component } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import CreateTeamUserMutation from '../../relay/CreateTeamUserMutation';
import Message from '../Message';

class JoinTeamComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRequestSent: false
    };
  }

  handleRequestAccess(e) {
    e.preventDefault();
    this.setState({isRequestSent: true});

    var that = this

    var onFailure = (transaction) => {
      transaction.getError().json().then(function(json) {
        var message = 'Sorry, could not send your request';
        if (json.error) {
          message = json.error;
        }
        that.setState({ message: message });
      });

   };
   var onSuccess = (response) => {

   };

   Relay.Store.commitUpdate(
     new CreateTeamUserMutation({
      team_id: this.props.team.dbid,
      user_id: Checkdesk.currentUser.dbid,
      status: "requested"
    }),
    { onSuccess, onFailure }
  );
  }

  render() {
    const team = this.props.team
    const teamUrl = 'https://' + team.subdomain + '.checkdesk.org/';
    var isLoggedIn = true;
    var isRequestSent = this.state.isRequestSent;

    return (
      <div className='join-team'>
        <Message message={this.state.message} />
        <h2 className='join-team__main-heading'>Request to Join</h2>
        <div className='join-team__blurb'>
          <p className='join-team__blurb-graf'>To request access to the <a href={teamUrl}>{team.name}</a> Checkdesk, {isLoggedIn ? 'click here:' : 'please sign in:'}</p>
          {(() => {
            if (isLoggedIn) {
              return (
                <div>
                  <button
                    className={'join-team__button' + (isRequestSent ? ' join-team__button--submitted' : '')}
                    onClick={this.handleRequestAccess.bind(this)}
                    disabled={isRequestSent}
                  >
                    {isRequestSent ? 'Request Sent' : 'Request to Join'}
                  </button>
                  <p className='join-team__blurb-graf'>Your request {isRequestSent ? 'has been' : 'will be'} sent to the project admins for approval.</p>
                </div>
              );
            } else {
              return (<Link to='/signin' className='join-team__button-link'><button className='join-team__button'>Sign In »</button></Link>);
            }
          })()}
        </div>
      </div>
    );
  }
}

export default JoinTeamComponent;
