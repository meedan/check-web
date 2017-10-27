import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import InfiniteScroll from 'react-infinite-scroller';
import MdCreate from 'react-icons/lib/md/create';
import RaisedButton from 'material-ui/RaisedButton';
import { Card } from 'material-ui/Card';
import { List } from 'material-ui/List';
import TeamInviteCard from './TeamInviteCard';
import TeamMembersListItem from './TeamMembersListItem';
import Can from '../Can';
import {
  FlexRow,
  StyledMdCardTitle,
  cardInCardGroupStyle,
  units,
} from '../../styles/js/shared';

const pageSize = 20;

class TeamMembersComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    };
  }

  handleEditMembers(e) {
    e.preventDefault();
    this.setState({ isEditing: !this.state.isEditing });
  }

  loadMore() {
    this.props.relay.setVariables({ pageSize: this.props.team.team_users.edges.length + pageSize });
  }

  render() {
    const isEditing = this.state.isEditing;
    const team = this.props.team;
    const teamUsers = team.team_users;
    const teamUsersRequestingMembership = [];
    const teamUsersMembers = [];

    teamUsers.edges.map((teamUser) => {
      if (teamUser.node.status === 'requested') {
        return teamUsersRequestingMembership.push(teamUser);
      }
      if (teamUser.node.status === 'banned') {
        teamUser.node.role = 'Rejected';
      }
      return teamUsersMembers.push(teamUser);
    });

    const requestingMembership = !!teamUsersRequestingMembership.length;

    return (

      <div>
        <TeamInviteCard team={team} />
        {(() => {
          if (requestingMembership) {
            return (
              <Can permissions={team.permissions} permission="update Team">
                <Card style={cardInCardGroupStyle}>

                  <StyledMdCardTitle
                    title={<FormattedMessage
                      id="teamMembershipRequests.requestsToJoin"
                      defaultMessage={'Requests to join'}
                    />}
                  />

                  <List>
                    {(() => teamUsersRequestingMembership.map(teamUser => (
                      <TeamMembersListItem
                        teamUser={teamUser}
                        key={teamUser.node.id}
                        className=""
                        requestingMembership
                      />
                        )))()}
                  </List>
                </Card>
              </Can>
            );
          }

          return (null);
        })()}

        <Card>
          <FlexRow>
            <StyledMdCardTitle title={<FormattedMessage id="teamMembersComponent.mainHeading" defaultMessage="Members" />} />
            <Can permissions={team.permissions} permission="update Team">
              <RaisedButton
                style={{ marginLeft: 'auto', marginRight: units(2) }}
                onClick={this.handleEditMembers.bind(this)}
                className="team-members__edit-button"
                icon={<MdCreate className="team-members__edit-icon" />}
                label={isEditing
                      ? <FormattedMessage
                        id="teamMembersComponent.editDoneButton"
                        defaultMessage="Done"
                      />
                      : <FormattedMessage id="teamMembersComponent.editButton" defaultMessage="Edit" />}
              />
            </Can>
          </FlexRow>
          <InfiniteScroll hasMore loadMore={this.loadMore.bind(this)} threshold={500}>
            <List className="team-members__list">
              {(() =>
                  teamUsersMembers.map(teamUser =>
                    <TeamMembersListItem
                      key={teamUser.node.id}
                      teamUser={teamUser}
                      team_id={team.id}
                      isEditing={isEditing}
                    />,
                  ))()}
            </List>
          </InfiniteScroll>
        </Card>
      </div>
    );
  }
}

export default injectIntl(TeamMembersComponent);
