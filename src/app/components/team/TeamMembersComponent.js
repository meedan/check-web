import React, { Component } from 'react';
import { Link } from 'react-router';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdCreate from 'react-icons/lib/md/create';
import Select from 'react-select';
import PageTitle from '../PageTitle';
import 'react-select/dist/react-select.css';
import TeamMembershipRequests from './TeamMembershipRequests';
import TeamMembersCell from './TeamMembersCell';
import config from 'config';
import ContentColumn from '../layout/ContentColumn';

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
      <PageTitle prefix={this.props.intl.formatMessage(messages.title)} skipTeam={false} team={team}>
        <div className="team-members">
          <ContentColumn className="card">
            <button onClick={this.handleEditMembers.bind(this)} className="team-members__edit-button">
              <MdCreate className="team-members__edit-icon" />
              {isEditing ? <FormattedMessage id="teamMembersComponent.editDoneButton" defaultMessage="Done" /> : <FormattedMessage id="teamMembersComponent.editButton" defaultMessage="Edit" />}
            </button>

            <h1 className="team-members__main-heading"><FormattedMessage id="teamMembersComponent.mainHeading" defaultMessage="Members" /></h1>

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

            <TeamMembershipRequests team_users={team_users_requestingMembership} />

            <ul className="team-members__list">
              {(() => team_users_members.map(team_user => (
                <TeamMembersCell key={team_user.node.id} team_user={team_user} team_id={team.id} isEditing={isEditing} />
                )))()}
            </ul>
          </ContentColumn>
        </div>
      </PageTitle>
    );
  }
}

TeamMembersComponent.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TeamMembersComponent);
