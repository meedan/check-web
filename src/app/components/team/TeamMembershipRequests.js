import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import TeamMembershipRequestsCell from './TeamMembershipRequestsCell';

class TeamMembershipRequests extends Component {
  render() {
    const usersRequestingMembership = this.props.teamUsers;
    const usersCount = this.props.teamUsers.length;

    if (!usersCount) {
      return (<div />);
    }

    return (
      <section className="team-membership-requests">
        <h2 className="team-membership-requests__heading">
          <FormattedMessage
            id="teamMembershipRequests.requestsToJoin"
            defaultMessage={'Requests to join {count}'}
            values={{ count: <span className="team-membership-requests__heading-parens">({usersCount})</span> }}
          />
        </h2>

        <ul className="team-membership-requests__requests">
          {(() => usersRequestingMembership.map(teamUser => (
            <TeamMembershipRequestsCell teamUser={teamUser} />
              )))()}
        </ul>
      </section>
    );
  }
}

export default TeamMembershipRequests;
