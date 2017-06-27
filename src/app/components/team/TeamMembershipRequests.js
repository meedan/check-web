import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Card, CardTitle } from 'material-ui/Card';
import { List } from 'material-ui/List';
import TeamMembershipRequestsListItem from './TeamMembershipRequestsListItem';

class TeamMembershipRequests extends Component {
  render() {
    const usersRequestingMembership = this.props.teamUsers;

    if (!usersRequestingMembership.length) {
      return (<div />);
    }

    return (
      <Card style={{ marginBottom: 16 }}>

        <CardTitle
          title={<FormattedMessage
            id="teamMembershipRequests.requestsToJoin"
            defaultMessage={'Requests to join'}
          />}
        />


        <List>
          {(() => usersRequestingMembership.map(teamUser => (
            <TeamMembershipRequestsListItem
              teamUser={teamUser}
              key={teamUser.node.id}
            />
              )))()}
        </List>
      </Card>
    );
  }
}

export default TeamMembershipRequests;
