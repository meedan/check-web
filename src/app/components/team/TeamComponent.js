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

  cancelEditTeam(e) {
     e.preventDefault();
     this.setState({isEditingNameAndDescription: false});
  }

  handleEditTeam(e) {
     e.preventDefault();
     var that = this,
          name = document.getElementById('team__name-container').value;
     var description = document.getElementById('team__description-container').value;


     var onFailure = (transaction) => {

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
    this.setState({isEditingNameAndDescription: true});
  }
  render() {
    const team = this.props.team;
    const isEditing = this.state.isEditingNameAndDescription;
    return (
      <div className='team'>
        <Message message={this.state.message} />
        <TeamContacts contacts= {this.props.team.contacts.edges[0]}/>
        <section className='team__profile'>

          {(() => {
            if (isEditing) {
              return (
                <div className='team__edit-profile team__edit-profile--editing'>
                  <button onClick={this.cancelEditTeam.bind(this)} className='team__cancel-button'>Cancel</button>
                  <button onClick={this.handleEditTeam.bind(this)} className='team__save-button'>Save</button>
                </div>
              );
            } else {
              return (
                <div className='team__edit-profile'>
                  <button onClick={this.handleEntreEditTeamNameAndDescription.bind(this)} className='team__edit-button'>
                    <FontAwesome className='team__edit-icon' name='pencil'/> Edit profile
                  </button>
                </div>
              );
            }
          })()}

          <img className='team__avatar' src="https://pbs.twimg.com/profile_images/610557679249981440/2ARl7GLu.png" />
          {(() => {
            if (this.state.isEditingNameAndDescription) {

              return (
                <div>
                  <h1 className='team__name team__name--editing'>
                    <input type='text'  id='team__name-container' className='team__name-input' defaultValue={team.name}/>
                  </h1>
                  <div className='team__description'>
                    <input type='text' id='team__description-container' className='team__description-input' defaultValue={team.description}/>
                  </div>
                </div>);
            } else {
              return (
                <div>
                  <h1 className='team__name'>
                    <Link to='#' className='team__name-link'>{team.name}</Link>
                  </h1>
                  <div className='team__description'>
                    <p className='team__description-text'>{team.description}</p>
                  </div>
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
                  return (<span className='team__location-name'>{this.props.team.contacts.edges[0].node.location}</span>);
                }
              })()}
            </span>

            {/* link: iterate through all contact info links user has added; switch spans to inputs on isEditing */}
            {(() => {
              if (isEditing) {
                return (
                  <span>
                  <FontAwesome name='link' className='team__link-icon' />
                  <input type='text' className='team__link-name-input'/>
                  </span>);

              } else {
                return (
                  <Link to='https://bellingcat.com' className='team__link'>
                    <FontAwesome name='link' className='team__link-icon' />
                    <span className='team__link-text'>{this.props.team.contacts.edges[0].node.web}</span>
                  </Link>
                );
              }
            })()}


            {/* add link: show whenever is editing; clicking adds a new link input ^
            <button className='team__add-link'>
              <FontAwesome name='plus' className='team__add-link-icon' />Add link...
            </button>
            */}
          </div>

          {/* controls: probably should only be visible to team members/admins/etc. */}
          <select className='team__permissions' name='teamPermissions'>
            <option value='public'>Public</option>
            <option value='private'>Private</option>
          </select>
        </section>

        <section className='team__content'>
          <h2 className='team__content-tabs'>
            <span className='team__content-tab team__content-tab--active'>28 reports</span>
            <span className='team__content-tab'>4 projects</span>
          </h2>
          <div className='team__content-body'>
            {(() => {
            })()}
          </div>
        </section>
    </div>
    );
  }
}

export default TeamComponent;
