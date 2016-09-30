import React, { Component } from 'react';
import TeamMembershipRequestsCell from './TeamMembershipRequestsCell';

class TeamMembershipRequests extends Component {
  render() {
    const usersRequestingMembership = this.props.team_users;
    const usersCount = this.props.team_users.length;

    if (!usersCount) {
      return (<div></div>);
    }

    return (
      <section className='team-membership-requests'>
        <h2 className='team-membership-requests__heading'>Requests to join <span className='team-membership-requests__heading-parens'>({usersCount})</span></h2>

        <ul className='team-membership-requests__requests'>
          {(() => {
            return usersRequestingMembership.map((team_user) => {
              return (
                <TeamMembershipRequestsCell team_user={team_user} />
              );
            });
          })()}
        </ul>
      </section>
    );
  }
}

export default TeamMembershipRequests;
