import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MdCreate from 'react-icons/lib/md/create';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import { List } from 'material-ui/List';
import TeamInviteCard from './TeamInviteCard';
import TeamMembersListItem from './TeamMembersListItem';
import TeamInvitedMemberItem from './TeamInvitedMemberItem';
import TeamInviteMembers from './TeamInviteMembers';
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
            <Card style={{ marginTop: units(2), marginBottom: units(2) }}>
              <StyledMdCardTitle title={<FormattedMessage
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
          </Can>
        }

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
          <StyledMdCardTitle title={<FormattedMessage id="teamMembersComponent.mainHeading" defaultMessage="Members" />} />
          <FlexRow>
            <Can permissions={team.permissions} permission="update Team">
              <Button
                variant="contained"
                style={{ marginLeft: 'auto', marginRight: units(1) }}
                onClick={this.handleEditMembers.bind(this)}
                className="team-members__edit-button"
                icon={<MdCreate className="team-members__edit-icon" />}
              >
                { isEditing ?
                  <FormattedMessage
                    id="teamMembersComponent.editDoneButton"
                    defaultMessage="Done"
                  />
                  : <FormattedMessage id="teamMembersComponent.editButton" defaultMessage="Edit" />}
              </Button>
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
                  key={teamUser.node.id}
                  teamUser={teamUser}
                  isEditing={isEditing}
                  singleOwner={ownerMembers.length <= 1}
                />
              ))}
            </LoadMore>
          </List>
        </Card>
      </div>
    );
  }
}

export default injectIntl(TeamMembersComponent);
