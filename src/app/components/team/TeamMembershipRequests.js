import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import TeamMembershipRequestsCell from './TeamMembershipRequestsCell';

class TeamMembershipRequests extends Component {
  render() {
    const usersRequestingMembership = this.props.team_users;
    const usersCount = this.props.team_users.length;

    if (!usersCount) {
      return (<div />);
    }

    return (
      <section className="team-membership-requests">
        <h2 className="team-membership-requests__heading">
          <FormattedMessage id="teamMembershipRequests.requestsToJoin"
                defaultMessage={`Requests to join {count}`}
                values={{count: <span className="team-membership-requests__heading-parens">({usersCount})</span>}} />
        </h2>

        <ul className="team-membership-requests__requests">
          {(() => usersRequestingMembership.map(team_user => (
            <TeamMembershipRequestsCell team_user={team_user} />
              )))()}
        </ul>
      </section>
    );
  }
}

export default TeamMembershipRequests;
