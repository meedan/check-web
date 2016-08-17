import React, { Component } from 'react';

class TeamMembershipRequests extends Component {

  render() {
    const usersRequestingMembership = this.props.users;
    const usersCount = this.props.users.length;

    if (!usersCount) {
      return;
    }

    return (
      <section className='team-membership-requests'>
        <h2 className='team-membership-requests__heading'>Requests to Join <span className='team-membership-requests__heading-parens'>({usersCount})</span></h2>
        <ul className='team-membership-requests__requests'>
          {(() => {
            return usersRequestingMembership.map((user) => {
              return (
                <li className='team-membership-requests__user'>
                  <img src={user.avatarUrl} className='team-membership-requests__user-avatar' />
                  <div className='team-membership-requests__user-details'>
                    <h3 className='team-membership-requests__user-name'>{user.name}</h3>
                    <span className='team-membership-requests__user-username'>({user.username})</span>
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
