import React, { Component } from 'react';
import { Link } from 'react-router';

class JoinTeam extends Component {
  render() {
    return (
      <div className='join-team'>
        <h2 className='join-team__heading'>Request to Join</h2>

        Request to join

        > bellingcat.checkdesk.org/join


        <h3 className='join-team__join-requests'>Join requests</h3>

        // * John Smith (2 public teams, 8 public reports)  accept / ignore

        <h3 className='join-team__join-requests'>Members</h3>

      </div>
    );
  }
}

export default JoinTeam;
