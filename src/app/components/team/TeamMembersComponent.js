import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MdCreate from 'react-icons/lib/md/create';
import RaisedButton from 'material-ui/RaisedButton';
import { Card } from 'material-ui/Card';
import { List } from 'material-ui/List';
import TeamInviteCard from './TeamInviteCard';
import TeamMembersListItem from './TeamMembersListItem';
import Can from '../Can';
import LoadMore from '../layout/LoadMore';
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
    const { isEditing } = this.state;
    const { team, team: { team_users: teamUsers } } = this.props;
    const teamUsersRequestingMembership = team.join_requests.edges;
    const teamUsersMembers = [];

    teamUsers.edges.map((teamUser_) => {
      const teamUser = teamUser_;
      if (teamUser.node.status === 'requested') {
        return null;
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

        { requestingMembership &&
          <Can permissions={team.permissions} permission="update Team">
            <Card style={cardInCardGroupStyle}>
              <StyledMdCardTitle
                title={<FormattedMessage
                  id="teamMembershipRequests.requestsToJoin"
                  defaultMessage="Requests to join"
                />}
              />
              <List>
                { teamUsersRequestingMembership.map(teamUser => (
                  <TeamMembersListItem
                    teamUser={teamUser}
                    key={teamUser.node.id}
                    requestingMembership
                  />
                ))}
              </List>
            </Card>
          </Can>
        }

        <Card style={{ marginTop: units(2), marginBottom: units(2) }}>
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
          <LoadMore
            hasMore={teamUsers.edges.length < team.members_count}
            loadMore={this.loadMore.bind(this)}
          >
            <List
              className="team-members__list"
              style={{ maxHeight: '500px' }}
            >
              { teamUsersMembers.map(teamUser => (
                <TeamMembersListItem
                  key={teamUser.node.id}
                  teamUser={teamUser}
                  isEditing={isEditing}
                />
              ))}
            </List>
          </LoadMore>
        </Card>
      </div>
    );
  }
}

export default injectIntl(TeamMembersComponent);
