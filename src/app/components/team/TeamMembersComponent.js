import React, { Component } from 'react';
import { Link } from 'react-router';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdCreate from 'react-icons/lib/md/create';
import config from 'config';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardTitle, CardActions, CardText } from 'material-ui/Card';
import { List } from 'material-ui/List';
import PageTitle from '../PageTitle';
import TeamMembershipRequests from './TeamMembershipRequests';
import TeamMembersListItem from './TeamMembersListItem';
import ContentColumn from '../layout/ContentColumn';
import {
  listItemStyle,
} from '../../../../config-styles';

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

    const teamUrl = `${window.location.protocol}//${config.selfHost}/${team.slug}`;
    const joinUrl = `${teamUrl}/join`;

    return (
      <PageTitle
        prefix={this.props.intl.formatMessage(messages.title)}
        skipTeam={false}
        team={team}
      >
        <ContentColumn>
          <Card style={{ marginBottom: 16 }}>
            <CardText>
              <div className="team-members__blurb">
                <p className="team-members__blurb-graf">
                  <FormattedMessage
                    id="teamMembersComponent.inviteLink"
                    defaultMessage={'To invite colleagues to join {link}, send them this link:'}
                    values={{ link: <Link to={teamUrl}>{team.name}</Link> }}
                  />
                </p>
                <p className="team-members__blurb-graf--url"><a href={joinUrl}>{joinUrl}</a></p>
              </div>
            </CardText>
          </Card>

          <TeamMembershipRequests teamUsers={teamUsersRequestingMembership} />

          <Card>
            <CardTitle title={<FormattedMessage id="teamMembersComponent.mainHeading" defaultMessage="Members" />} />

            <List style={listItemStyle} className="team-members__list">
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
            <CardActions>
              <RaisedButton
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
