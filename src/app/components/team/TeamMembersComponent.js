import React, { Component } from 'react';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import TeamMembershipRequests from './TeamMembershipRequests';
import TeamMembersCell from './TeamMembersCell';

class TeamMembersComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    };
  }

  handleEditMembers(e) {
    e.preventDefault();
    this.setState({isEditing: !this.state.isEditing});
  }

  render() {
    const isEditing = this.state.isEditing;
    const team = this.props.team;
    const team_users = team.team_users
    var team_users_requestingMembership= []
    var team_users_members= []

    team_users.edges.map((team_user) => {
      if(team_user.node.status == "requested")
      {
        team_users_requestingMembership.push(team_user);
      }else {
        team_users_members.push(team_user)
      }

    })
    var people = [{name:'Karim Ratib',username:'kratib',avatarUrl:'https://pbs.twimg.com/profile_images/434022381770657792/RYsiZ7vR.jpeg'},{name:'An Xioa Mina',username:'axm',avatarUrl:'https://pbs.twimg.com/profile_images/543432219109244928/nuFAV2Ey.jpeg'},{name:'Chris Blow',username:'chris',avatarUrl:'https://pbs.twimg.com/profile_images/750129043429662720/36UDFbwz.jpg'},{name:'Ed Bice',username:'ed',avatarUrl:'https://pbs.twimg.com/profile_images/743824003844837377/oTeU_xyb.jpg'},{name:'Caio Almeida',username:'caiosba',avatarUrl:'https://pbs.twimg.com/profile_images/761634523809472512/9ln-qDZ6.jpg'},{name:'Ahmed Nasser',username:'ahmed',avatarUrl:'https://pbs.twimg.com/profile_images/610557679249981440/2ARl7GLu.png'},{name:'Tom Trewinnard',username:'tom',avatarUrl:'https://pbs.twimg.com/profile_images/752187533153357824/6CZ5qxF3.jpg'}];
    const membershipRequests = people.slice(0, 2);
    const members = people.slice(2);
    const joinUrl = 'https://checkdesk.org/team/' + team.dbid + '/join';

    return (
      <div className='team-members'>
        <button onClick={this.handleEditMembers.bind(this)} className='team-members__edit-button'>
          <FontAwesome className='team-members__edit-icon' name='pencil'/>
          {isEditing ? 'Done' : 'Edit'}
        </button>
        <h1 className='team-members__main-heading'>Members</h1>
        <div className='team-members__blurb'>
          <p className='team-members__blurb-graf'>To invite colleagues to join {team.name}, send them this link:</p>
          <p className='team-members__blurb-graf--url'><a href={joinUrl}>{joinUrl}</a></p>
        </div>
        <TeamMembershipRequests team_users={team_users_requestingMembership} />
        <ul className='team-members__list'>
          {(() => {
            return team_users_members.map((team_user) => {
              return (
                <TeamMembersCell team_user={team_user} isEditing={isEditing}/>
              );
            })
          })()}
        </ul>
      </div>
    );
  }
}

export default TeamMembersComponent;
