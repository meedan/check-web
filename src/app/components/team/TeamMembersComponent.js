import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import EditIcon from '@material-ui/icons/Edit';
import TeamInviteCard from './TeamInviteCard';
import TeamMembersListItem from './TeamMembersListItem';
import TeamInvitedMemberItem from './TeamInvitedMemberItem';
import TeamInviteMembers from './TeamInviteMembers';
import Can from '../Can';
import LoadMore from '../layout/LoadMore';
import { FlexRow } from '../../styles/js/shared';

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

  render() {
    const { isEditing } = this.state;
    const { team, team: { team_users: teamUsers } } = this.props;
    const teamUsersRequestingMembership = team.join_requests.edges;
    const teamUsersMembers = teamUsers.edges.filter(tu => tu.node.status === 'member');
    const ownerMembers = teamUsers.edges.filter(tu => tu.node.role === 'owner');
    const teamInvitedMails = team.invited_mails;
    const requestingMembership = !!teamUsersRequestingMembership.length;
    const invitedMails = !!teamInvitedMails.length;

    return (
      <div>
        <TeamInviteCard team={team} />

        { invitedMails &&
          <Can permissions={team.permissions} permission="invite Members">
            <Box clone my={2}>
              <Card>
                <CardHeader title={<FormattedMessage
                  id="teamMembersComponent.pendingInvitations"
                  defaultMessage="Pending invitations"
                />}
                />
                <TeamInviteMembers team={team} />
                <List>
                  { teamInvitedMails.map(invitedMail => (
                    <TeamInvitedMemberItem
                      invitedMail={invitedMail}
                      key={invitedMail}
                    />
                  ))}
                </List>
              </Card>
            </Box>
          </Can>
        }

        { requestingMembership &&
          <Can permissions={team.permissions} permission="update Team">
            <Box clone mb={2}>
              <Card>
                <CardHeader
                  title={<FormattedMessage
                    id="teamMembershipRequests.requestsToJoin"
                    defaultMessage="Requests to join"
                  />}
                />
                <List>
                  { teamUsersRequestingMembership.map(teamUser => (
                    <TeamMembersListItem
                      className="team-members__requesting-list-item"
                      team={team}
                      teamUser={teamUser.node}
                      key={teamUser.node.id}
                      requestingMembership
                    />
                  ))}
                </List>
              </Card>
            </Box>
          </Can>
        }

        <Box clone my={2}>
          <Card>
            <CardHeader title={<FormattedMessage id="teamMembersComponent.mainHeading" defaultMessage="Members" />} />
            <FlexRow>
              <Can permissions={team.permissions} permission="update Team">
                <Box clone ml="auto" mr={1}>
                  <Button
                    variant="contained"
                    onClick={this.handleEditMembers.bind(this)}
                    className="team-members__edit-button"
                    icon={<EditIcon className="team-members__edit-icon" />}
                  >
                    { isEditing ?
                      <FormattedMessage
                        id="teamMembersComponent.editDoneButton"
                        defaultMessage="Done"
                      />
                      : <FormattedMessage id="teamMembersComponent.editButton" defaultMessage="Edit" />}
                  </Button>
                </Box>
              </Can>
              <Can permissions={team.permissions} permission="invite Members">
                <TeamInviteMembers team={team} />
              </Can>
            </FlexRow>
            <List className="team-members__list">
              <LoadMore
                relay={this.props.relay}
                pageSize={pageSize}
                currentSize={teamUsers.edges.length}
                total={team.members_count}
              >
                { teamUsersMembers.map(teamUser => (
                  <TeamMembersListItem
                    className="team-members__member-list-item"
                    key={teamUser.node.id}
                    team={team}
                    teamUser={teamUser.node}
                    isEditing={isEditing}
                    singleOwner={ownerMembers.length <= 1}
                  />
                ))}
              </LoadMore>
            </List>
          </Card>
        </Box>
      </div>
    );
  }
}

export default TeamMembersComponent;
