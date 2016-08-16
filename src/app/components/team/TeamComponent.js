import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TeamMembers from './TeamMembers'
import TeamActivities from './TeamActivities'
import TeamProjects from './TeamProjects'
import TeamContacts from './TeamContacts'
import Tags from './Tags'
import SocialProfiles from './SocialProfiles'
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import UpdateTeamMutation from '../../relay/UpdateTeamMutation';
import Message from '../Message';


class TeamComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isEditingNameAndDescription: false
    };
  }

  handleEditTeam(e) {
     e.preventDefault();
     console.log("Handle Edit");
     var that = this,
          name = document.getElementById('team__name-container').value;
     var description = document.getElementById('team__description-container').value;

         console.log("HandleSubmit")

     var onFailure = (transaction) => {

         console.log("onFailure")
         transaction.getError().json().then(function(json) {
           var message = 'Sorry, could not edit the team';
           if (json.error) {
             message = json.error;
           }
           that.setState({ message: message });
         });

         this.setState({isEditingNameAndDescription: false});


     };

     var onSuccess = (response) => {
       console.log("onSuccess")
      //  var tid = response.createTeam.team.id;
      //  var decodedId = base64.decode(tid);
      //  this.props.history.push('/' + decodedId);
       this.setState({ message: null });
       this.setState({isEditingNameAndDescription: false});

     };

     Relay.Store.commitUpdate(
       new UpdateTeamMutation({
        name: name,
        description: description,
        id: this.props.team.id
      }),
      { onSuccess, onFailure }
    );
  }
  handleEntreEditTeamNameAndDescription(e) {
    e.preventDefault();
    console.log("handleEntreEditTeamNameAndDescription");
    this.setState({isEditingNameAndDescription: true});
  }
  render() {
    const team = this.props.team;
    var isEditing = false; // or this.state.isEditing...
     return (
      <div className='team'>
        <Message message={this.state.message} />

        <section className='team__profile'>
          <img className='team__avatar' src="https://pbs.twimg.com/profile_images/610557679249981440/2ARl7GLu.png" />
          {(() => {
            if (this.state.isEditingNameAndDescription) {
              console.log('aywa true');

              return (
                <div>
                  <h1>  <input type='text' id='team__name-container' defaultValue={team.name} className='team__name-input'></input> </h1>
                <p>  <input type='text' id='team__description-container' defaultValue={team.description}  className='team__description-input'/>
                  <button onClick={this.handleEditTeam.bind(this)} className='team__edit'>Save</button></p>
                </div>);
            } else {
              console.log('aywa false');
              return (
                <div>
                  <h1 className='team__name'><Link to='#' className='team__name-link'>{team.name}</Link></h1>
                  <p className='team__description'>{team.description}
                  <button onClick={this.handleEntreEditTeamNameAndDescription.bind(this)} className='team__edit'>Edit</button></p>
                </div>);
            }
          })()}

          <div className='team__contact-info'>

            {/* location: show this span if location entered, hide if not; always show when isEditing */}
            <span className='team__location'>
              <FontAwesome name='map-marker' className='team__location-icon' />
              {(() => {
                if (isEditing) {
                  return (<input type='text' className='team__location-name-input'/>);
                } else {
                  return (<span className='team__location-name'>Cairo</span>);
                }
              })()}
            </span>

            {/* links: iterate through all contact info links user has added; switch spans to inputs on isEditing */}
            <Link to='https://bellingcat.com' className='team__link'>
              <FontAwesome name='link' className='team__link-icon' />
              <span className='team__link-text'>bellingcat.com</span>
            </Link>

            {/* add link: show whenever is editing; clicking adds a new link input ^ */}
            <button className='team__add-link'>
              <FontAwesome name='plus' className='team__add-link-icon' />Add link...
            </button>
          </div>

          {/* controls: probably should only be visible to team members/admins/etc. */}
          <select className='team__permissions' name='teamPermissions'>
            <option value='public'>Public</option>
            <option value='private'>Private</option>
          </select>
          <button   className='team__edit'>Edit</button>
        </section>

        <section className='team__request-access'>
          <h2 className='team__request-access-header'>Join {team.name}</h2>
          To request to join this team, please log in below. Your request will be sent to the team admins for approval.
          {/* if logged out, show "log in" button; else show "request access" button */}
          <button className='team__request-access-button'>Request Access</button>
        </section>

        <section className='team__content'>
          <h2 className='team__content-tabs'>
            <span className='team__content-tab team__content-tab--active'>28 stories</span>
            <span className='team__content-tab'>4 projects</span>
            <span className='team__content-tab'>12 members</span>
          </h2>
          <div className='team__content-body'>
            {(() => {
              // // maybe something like this
              // switch (this.state.activeContentTab) {
              //   case 'stories';
              //     return (<StoriesList stories={team.stories}/>);
              //     break;
              //   case 'projects';
              //     return (<ProjectsList stories={team.stories}/>)
              //     break;
              //   case 'members'
              //     return (<TeamMembers users = {team.users.edges}/>)
              //     break;
              // }
            })()}
          </div>
        </section>
    </div>
    );
  }
}

export default TeamComponent;
