import React, { Component } from 'react';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import Select from 'react-select';
import DocumentTitle from 'react-document-title';
import 'react-select/dist/react-select.css';
import TeamMembershipRequests from './TeamMembershipRequests';
import TeamMembersCell from './TeamMembersCell';
import config from 'config';
import { pageTitle } from '../../helpers';

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
    const team_users = team.team_users;
    const team_users_requestingMembership = [];
    const team_users_members = [];

    team_users.edges.map((team_user) => {
      if (team_user.node.status === 'requested') {
        team_users_requestingMembership.push(team_user);
      } else {
        if (team_user.node.status === 'banned') {
          team_user.node.role = 'Rejected';
        }
        team_users_members.push(team_user);
      }
    });

    const teamUrl = `${window.location.protocol}//${config.selfHost}/${team.slug}`;
    const joinUrl = `${teamUrl}/join`;

    return (
      <DocumentTitle title={pageTitle('Team Members', false, team)}>
        <div className="team-members">
          <button onClick={this.handleEditMembers.bind(this)} className="team-members__edit-button">
            <FontAwesome className="team-members__edit-icon" name="pencil" />
            {isEditing ? 'Done' : 'Edit'}
          </button>

          <h1 className="team-members__main-heading">Members</h1>

          <div className="team-members__blurb">
            <p className="team-members__blurb-graf">To invite colleagues to join <Link to={teamUrl}>{team.name}</Link>, send them this link:</p>
            <p className="team-members__blurb-graf--url"><a href={joinUrl}>{joinUrl}</a></p>
          </div>

          <TeamMembershipRequests team_users={team_users_requestingMembership} />

          <ul className="team-members__list">
            {(() => team_users_members.map(team_user => (
              <TeamMembersCell team_user={team_user} team_id={team.id} isEditing={isEditing} />
              )))()}
          </ul>
        </div>
      </DocumentTitle>
    );
  }
}

export default TeamMembersComponent;
