import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TeamMembers from './TeamMembers'
import TeamActivities from './TeamActivities'
import TeamProjects from './TeamProjects'
import Tags from './Tags'
import SocialProfiles from './SocialProfiles'
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import UpdateTeamMutation from '../../relay/UpdateTeamMutation';
import Message from '../Message';
import CreateContactMutation from '../../relay/CreateContactMutation';
import UpdateContactMutation from '../../relay/UpdateContactMutation';
import CreateProject from '../project/CreateProject';

class TeamComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    };
  }

  cancelEditTeam(e) {
     e.preventDefault();
     this.setState({isEditing: false});
  }

  editTeamInfo(){
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
    };

    var onSuccess = (response) => {
      this.setState({ message: null , isEditing: false});
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

  updateTeamContacts(){
    var that = this,
         location = document.getElementById('team__location-container').value,
         link = document.getElementById('team__link-container').value,
         phone = document.getElementById('team__phone-container').value,
         contact = this.props.team.contacts.edges[0];
    var onFailure = (transaction) => {

        transaction.getError().json().then(function(json) {
          var message = 'Sorry, could not edit the team';
          if (json.error) {
            message = json.error;
          }
          that.setState({ message: message });
        });



    };

    var onSuccess = (response) => {
      this.setState({ message: null , isEditing: false});
    };

    Relay.Store.commitUpdate(
      new UpdateContactMutation({
       location: location,
       web: link,
       phone:phone,
       id: contact.node.id,
     }),
     { onSuccess, onFailure }
   );
  }
  createTeamContacts(){
    var that = this,
    location = document.getElementById('team__location-container').value,
    link = document.getElementById('team__link-container').value;
    var onFailure = (transaction) => {

        transaction.getError().json().then(function(json) {
          var message = 'Sorry, could not edit the team';
          if (json.error) {
            message = json.error;
          }
          that.setState({ message: message });
        });
    };

    var onSuccess = (response) => {
      this.setState({ message: null ,isEditing: false});

    };

    Relay.Store.commitUpdate(
      new CreateContactMutation({
       location: location,
       web: link,
       team_id: this.props.team.dbid,
       parent_id: this.props.team.id,
       parent_type: "team"
     }),
     { onSuccess, onFailure }
   );
  }

  handleEditTeam(e) {
     e.preventDefault();
     this.editTeamInfo();
     if (this.props.team.contacts.edges[0]) {
       this.updateTeamContacts();

     } else {
       this.createTeamContacts();
          }
  }
  handleEntreEditTeamNameAndDescription(e) {
    e.preventDefault();
    this.setState({isEditing: true});
  }
  render() {
    const team = this.props.team;
    const isEditing = this.state.isEditing;
    const contact =this.props.team.contacts.edges[0];
    return (
      <div className='team'>
        <Message message={this.state.message} />
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

          <div className='team__avatar' style={{'background-image': 'url(' + team.avatar + ')'}}></div>
          {(() => {
            if (this.state.isEditing) {

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
              {(() => {
                if (isEditing) {
                  if (contact) {
                    return (<span><FontAwesome name='map-marker' className='team__location-icon' />
                            <input type='text' id='team__location-container' defaultValue={this.props.team.contacts.edges[0].node.location} className='team__location-name-input'/>
                            </span>);
                  }else {

                    return (<span><FontAwesome name='map-marker' className='team__location-icon' />
                            <input type='text' id='team__location-container' className='team__location-name-input'/>
                            </span>);
                  }
                } else {
                  if(contact)
                  {
                    return (<span>
                      <FontAwesome name='map-marker' className='team__location-icon' />
                      <span className='team__location-name'>{this.props.team.contacts.edges[0].node.location}</span></span>);

                  }else {
                    return (<span className='team__location-name'></span>);

                  }
                }
              })()}
            </span>
            <span className='team__phone'>
              {(() => {
                if (isEditing) {
                  if (contact) {
                    return ( <span>{/*<FontAwesome name='map-marker' className='team__phone-icon' /> */}
                  <input type='text' id='team__phone-container' defaultValue={this.props.team.contacts.edges[0].node.phone} className='team__location-name-input'/>
                            </span>);
                  }else {

                    return (<span><FontAwesome name='map-marker' className='team__phone-icon' />
                            <input type='text' id='team__phone-container' className='team__location-name-input'/>
                            </span>);
                  }
                } else {
                  if(contact)
                  {
                    return (<span>
                    {/*<FontAwesome name='map-marker' className='team__phone-icon' /> */}
                      <span className='team__phone-name'>{this.props.team.contacts.edges[0].node.phone}</span></span>);

                  }else {
                    return (<span className='team__phone-name'></span>);

                  }
                }
              })()}
            </span>
            {/* link: iterate through all contact info links user has added; switch spans to inputs on isEditing */}
            {(() => {
              if (isEditing) {
                if (contact) {
                  return (
                    <span>
                    <FontAwesome name='link' className='team__link-icon' />
                    <input id='team__link-container' defaultValue={this.props.team.contacts.edges[0].node.web} type='text' className='team__link-name-input'/>
                    </span>);

                }else {
                  return (
                    <span>
                    <FontAwesome name='link' className='team__link-icon' />
                    <input id='team__link-container' type='text' className='team__link-name-input'/>
                    </span>);

                }

              } else {
                if(contact)
                {
                  return (
                    <Link  to= {this.props.team.contacts.edges[0].node.web} className='team__link'>
                      <FontAwesome name='link' className='team__link-icon' />
                      <span className='team__link-text'>{this.props.team.contacts.edges[0].node.web}</span>
                    </Link>
                  );
                }else {
                  return (
                      <span className='team__link-text'></span>

                  );
                }

              }
            })()}
          </div>
        </section>

        <section className='team__content'>
          <div className='team__content-body'>
            <h3 className='team__projects-heading'>Verification Projects</h3>
            <ul className='team__projects-list'>
              {team.projects.edges.map(p => (
                <li className='team__project'>
                  <Link to={'/team/' + team.dbid + '/project/' + p.node.dbid} className='team__project-link'>{p.node.title}</Link>
                </li>
              ))}
              <li className='team__new-project'>
                <CreateProject className='team__new-project-input' team={team} />
              </li>
            </ul>
          </div>
        </section>
    </div>
    );
  }
}

export default TeamComponent;
