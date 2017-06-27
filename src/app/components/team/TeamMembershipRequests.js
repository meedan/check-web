import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import TeamMembershipRequestsCell from './TeamMembershipRequestsCell';

class TeamMembershipRequests extends Component {
  render() {
    const usersRequestingMembership = this.props.teamUsers;

    if (!usersRequestingMembership.length) {
      return (<div />);
    }

    return (
      <section>
        <h2>
          <FormattedMessage
            id="teamMembershipRequests.requestsToJoin"
            defaultMessage={'Requests to join'}
          />
        </h2>

        <ul>
          {(() => usersRequestingMembership.map(teamUser => (
            <TeamMembershipRequestsCell
              teamUser={teamUser}
              key={teamUser.node.id}
            />
              )))()}
        </ul>
      </section>
    );
  }
}

export default TeamMembershipRequests;
