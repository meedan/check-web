import React, { Component } from 'react';

class TeamMembershipRequests extends Component {

  render() {
    const usersRequestingMembership = this.props.team_users;
    const usersCount = this.props.team_users.length;

    if (!usersCount) {
      return;
    }

    return (
      <section className='team-membership-requests'>
        <h2 className='team-membership-requests__heading'>Requests to Join <span className='team-membership-requests__heading-parens'>({usersCount})</span></h2>
        <ul className='team-membership-requests__requests'>
          {(() => {
            return usersRequestingMembership.map((team_user) => {
              return (
                <li className='team-membership-requests__user'>
                  <img src={team_user.node.user.profile_image} className='team-membership-requests__user-avatar' />
                  <div className='team-membership-requests__user-details'>
                    <h3 className='team-membership-requests__user-name'>{team_user.node.user.name}</h3>
                    <span className='team-membership-requests__user-username'>({team_user.node.user.name})</span>
                  </div>
                  <button className='team-member-requests__user-button team-member-requests__user-button--approve '>Approve</button>
                  <button className='team-member-requests__user-button team-member-requests__user-button--deny'>Ignore</button>
                </li>
              );
            });
          })()}
        </ul>
      </section>
    );
  }
}

export default TeamMembershipRequests;
