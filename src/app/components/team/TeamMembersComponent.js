import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdCreate from 'react-icons/lib/md/create';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions } from 'material-ui/Card';
import { List } from 'material-ui/List';
import TeamInviteCard from './TeamInviteCard';
import PageTitle from '../PageTitle';
import TeamMembersListItem from './TeamMembersListItem';
import ContentColumn from '../layout/ContentColumn';
import {
  cardInCardGroupStyle,
  listItemStyle,
  StyledMdCardTitle,
} from '../../styles/js/variables';

const messages = defineMessages({
  title: {
    id: 'teamMembersComponent.title',
    defaultMessage: 'Team Members',
  },
});

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
      <PageTitle
        prefix={this.props.intl.formatMessage(messages.title)}
        skipTeam={false}
        team={team}
      >
        <ContentColumn>
          <TeamInviteCard team={team} />

          {(() => {
            if (requestingMembership) {
              return (
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
              );
            }

            return (null);
          })()}

          <Card>
            <StyledMdCardTitle title={<FormattedMessage id="teamMembersComponent.mainHeading" defaultMessage="Members" />} />

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
            <CardActions style={listItemStyle} >
              <RaisedButton
                style={{ marginLeft: 'auto' }}
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
            </CardActions>
          </Card>
        </ContentColumn>
      </PageTitle>
    );
  }
}

TeamMembersComponent.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TeamMembersComponent);
