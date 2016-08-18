import React, { Component } from 'react';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import TeamMembershipRequests from './TeamMembershipRequests';

class TeamMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // made this edit mode UI but seems possibly unnecessary now -- leaving isEditing at true for now. Can remove unnecessary code or restore functionality later as needed.
      isEditing: true
    };
  }

  handleEditMembers(e) {
    e.preventDefault();
    this.setState({isEditing: !this.state.isEditing});
  }

  render() {
    const isEditing = this.state.isEditing;
    const team = {displayName: 'Meedan', name:'meedan'};
    var people = [{name:'Karim Ratib',username:'kratib',avatarUrl:'https://pbs.twimg.com/profile_images/434022381770657792/RYsiZ7vR.jpeg'},{name:'An Xioa Mina',username:'axm',avatarUrl:'https://pbs.twimg.com/profile_images/543432219109244928/nuFAV2Ey.jpeg'},{name:'Chris Blow',username:'chris',avatarUrl:'https://pbs.twimg.com/profile_images/750129043429662720/36UDFbwz.jpg'},{name:'Ed Bice',username:'ed',avatarUrl:'https://pbs.twimg.com/profile_images/743824003844837377/oTeU_xyb.jpg'},{name:'Caio Almeida',username:'caiosba',avatarUrl:'https://pbs.twimg.com/profile_images/761634523809472512/9ln-qDZ6.jpg'},{name:'Ahmed Nasser',username:'ahmed',avatarUrl:'https://pbs.twimg.com/profile_images/610557679249981440/2ARl7GLu.png'},{name:'Tom Trewinnard',username:'tom',avatarUrl:'https://pbs.twimg.com/profile_images/752187533153357824/6CZ5qxF3.jpg'}];
    const membershipRequests = people.slice(0, 2);
    const members = people.slice(2);
    const roles = [
      {value: 'contributor', label: 'Contributor'},
      {value: 'journalist', label: 'Journalist'},
      {value: 'editor', label: 'Editor'}
    ];
    const joinUrl = 'https://' + team.name + '.checkdesk.org/join';

    return (
      <div className='team-members'>
        <h1 className='team-members__main-heading'>Members</h1>
        <div className='team-members__blurb'>
          <p className='team-members__blurb-graf'>To invite colleagues to join {team.displayName}, send them this link:</p>
          <p className='team-members__blurb-graf--url'><a href={joinUrl}>{joinUrl}</a></p>
        </div>
        <TeamMembershipRequests users={membershipRequests} />
        <ul className='team-members__list'>

          {(() => {
            if (isEditing) {
              return (
                <button onClick={this.handleEditMembers.bind(this)} className='team-members__edit-button team-members__edit-button--editing'>Done</button>
              );
            } else {
              return (
                <button onClick={this.handleEditMembers.bind(this)} className='team-members__edit-button'>
                  <FontAwesome className='team-members__edit-icon' name='pencil'/> Edit
                </button>
              );
            }
          })()}

          {(() => {
            return members.map((member) => {
              return (
                <li className='team-members__member'>
                  <img src={member.avatarUrl} className='team-members__member-avatar' />
                  <div className='team-members__member-details'>
                    <h3 className='team-members__member-name'>{member.name}</h3>
                    <span className='team-members__member-username'>({member.username})</span>
                  </div>

                  <Select className='team-members__member-role' autosize={true} searchable={false} backspaceRemoves={false} clearable={false} disabled={!isEditing} options={roles} value='contributor'/>
                </li>
              );
            })
          })()}

        </ul>
      </div>
    );
  }
}

export default TeamMembers;
