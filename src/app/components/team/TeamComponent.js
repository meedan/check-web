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
      message: null,
      isEditing: false,
      values: {}
    };
  }

  setContextTeam() {
    if (Checkdesk.context.team.subdomain != this.props.team.subdomain) {
      Checkdesk.context.team = this.props.team;
      var path = window.location.protocol + '//' + Checkdesk.context.team.subdomain + '.' + config.selfHost;
      window.location.href = path;
    }
  }

  componentDidMount() {
    this.setContextTeam();
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

  cancelEditTeam(e) {
    e.preventDefault();
    this.setState({isEditing: false});
  }

  editTeamInfo() {
    var that = this;

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
      this.setState({ message: 'Team information updated successfully!', isEditing: false});
    };

    var values = that.state.values;
    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        name: values.name,
        description: values.description,
        set_slack_notifications_enabled: values.slackNotificationsEnabled,
        set_slack_webhook: values.slackWebhook,
        set_slack_channel: values.slackChannel,
        contact: JSON.stringify({ location: values.contact_location, phone: values.contact_phone, web: values.contact_web }),
        id: that.props.team.id
      }),
      { onSuccess, onFailure }
    );
  }

  handleEditTeam() {
    this.editTeamInfo();
  }

  handleEntreEditTeamNameAndDescription(e) {
    this.setState({ isEditing: true });
    e.preventDefault();
  }

  handleChange(key, e) {
    var value = e.target.value;
    if (e.target.type === 'checkbox' && !e.target.checked) {
      value = '0';
    }
    var values = this.state.values;
    values[key] = value;
    this.setState({ values: values });
  }

  render() {
    const team = this.props.team;
    const isEditing = this.state.isEditing;
    const contact = team.contacts.edges[0];

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

          <div className='team__avatar' style={{'background-image': 'url(' + team.avatar + ')'}} title="You can't change this right now, but we're hard at work to enable it soon!"></div>

          {(() => {
            if (this.state.isEditing) {
              return (
                <div>
                  <h1 className='team__name team__name--editing'>
                    <input type='text'  id='team__name-container' className='team__name-input' defaultValue={team.name} value={this.state.values.name} onChange={this.handleChange.bind(this, 'name')} placeholder='Team name' />
                  </h1>
                  <div className='team__description'>
                    <input type='text' id='team__description-container' className='team__description-input' defaultValue={team.description} placeholder='Team description' value={this.state.values.description} onChange={this.handleChange.bind(this, 'description')} />
                  </div>
                </div>
              );
            }
            else {
              return (
                <div>
                  <h1 className='team__name'>
                    <Link to='#' className='team__name-link'>{team.name}</Link>
                  </h1>
                  <div className='team__description'>
                    <p className='team__description-text'>{team.description}</p>
                  </div>
                </div>
              );
            }
          })()}

          <div className='team__contact-info'>
            <span className='team__location'>
              {(() => {
                if (isEditing) {
                    return (<span><FontAwesome name='map-marker' className='team__location-icon' />
                            <input type='text' id='team__location-container' defaultValue={contact ? contact.node.location : ''} 
                             className='team__location-name-input' placeholder='Location' value={this.state.values.contact_location}
                             onChange={this.handleChange.bind(this, 'contact_location')} /></span>);
                }
                else {
                  if (contact && !!contact.node.location) {
                    return (<span><FontAwesome name='map-marker' className='team__location-icon' />
                            <span className='team__location-name'>{contact.node.location}</span></span>);
                  }
                  else {
                    return (<span className='team__location-name'></span>);
                  }
                }
              })()}
            </span>
            <span className='team__phone'>
              {(() => {
                if (isEditing) {
                  return (<span><FontAwesome name='phone' className='team__phone-icon' />
                          <input type='text' id='team__phone-container' defaultValue={contact ? contact.node.phone : ''}
                           className='team__location-name-input' placeholder='Phone number' value={this.state.values.contact_phone}
                           onChange={this.handleChange.bind(this, 'contact_phone')} /></span>);
                } else {
                  if (contact && !!contact.node.phone) {
                    return (<span><FontAwesome name='phone' className='team__phone-icon' />
                            <span className='team__phone-name'>{contact.node.phone}</span></span>);
                  }
                  else {
                    return (<span className='team__phone-name'></span>);
                  }
                }
              })()}
            </span>
            <span className='team__web'>
              {(() => {
                if (isEditing) {
                  return (<span><FontAwesome name='link' className='team__link-icon' />
                          <input type='text' id='team__link-container' defaultValue={contact ? contact.node.web : ''}
                           className='team__location-name-input' placeholder='Website' value={this.state.values.contact_web}
                           onChange={this.handleChange.bind(this, 'contact_web')} /></span>);
                } else {
                  if (contact && !!contact.node.web) {
                    return (<span><FontAwesome name='link' className='team__link-icon' />
                            <span className='team__link-name'>{contact.node.web}</span></span>);
                  }
                  else {
                    return (<span className='team__link-name'></span>);
                  }
                }
              })()}
            </span>
          </div>
        </section>

        {(() => {
          if (isEditing) {
            return(
              <section className='team__settings'>
                <span><input type='checkbox' id='team__settings-slack-notifications-enabled' value='1' defaultChecked={team.get_slack_notifications_enabled === '1'} onChange={this.handleChange.bind(this, 'slackNotificationsEnabled')} /> <label htmlFor='team__settings-slack-notifications-enabled'>Enable Slack notifications</label></span>
                <span><input type='text' id='team__settings-slack-webhook' defaultValue={team.get_slack_webhook} placeholder='Slack webhook' value={this.state.values.slackWebhook} onChange={this.handleChange.bind(this, 'slackWebhook')} /></span>
                <span><input type='text' id='team__settings-slack-channel' defaultValue={team.get_slack_channel} placeholder='Slack default #channel' value={this.state.values.slackChannel} onChange={this.handleChange.bind(this, 'slackChannel')} /></span>
              </section>
            );
          }
        })()}

        <section className='team__content'>
          <div className='team__content-body'>
            <h3 className='team__projects-heading'>Verification Projects</h3>
            <ul className='team__projects-list'>
              {team.projects.edges.map(p => (
                <li className='team__project'>
                  <Link to={'/project/' + p.node.dbid} className='team__project-link'>{p.node.title}</Link>
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
