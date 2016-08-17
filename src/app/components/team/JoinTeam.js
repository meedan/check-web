import React, { Component } from 'react';
import { Link } from 'react-router';

class JoinTeam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRequestSent: false
    };
  }

  handleRequestAccess(e) {
    e.preventDefault();
    this.setState({isRequestSent: true});
  }

  render() {
    const team = {
      displayName: 'Meedan',
      subdomain: 'meedan'
    };
    const teamUrl = 'https://' + team.subdomain + '.checkdesk.org/';
    var isLoggedIn = true;
    var isRequestSent = this.state.isRequestSent;

    return (
      <div className='join-team'>
        <h2 className='join-team__main-heading'>Request to Join</h2>
        <div className='join-team__blurb'>
          <p className='join-team__blurb-graf'>To request access to the <a href={teamUrl}>{team.displayName}</a> Checkdesk, {isLoggedIn ? 'click here:' : 'please sign in:'}</p>
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

export default JoinTeam;
