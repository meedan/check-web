import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import UpdateProjectMutation from '../../relay/UpdateProjectMutation';
import DeleteProjectMutation from '../../relay/DeleteProjectMutation';
import Message from '../Message';
import Can from '../Can';
import ProjectRoute from '../../relay/ProjectRoute';
import UserMenuRelay from '../../relay/UserMenuRelay';
import { Link } from 'react-router';
import { logout } from '../../actions/actions';

class ProjectHeaderComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      isSettingsMenuOpen: false,
      message: null,
      title: this.props.project.title,
      description: this.props.project.description
    };
  }

  toggleSettings() {
    this.setState({ isSettingsMenuOpen: !this.state.isSettingsMenuOpen });
  }

  enableEdit() {
    this.setState({ isEditing: true, isSettingsMenuOpen: false });
  }

  updateProject(e) {
    var that = this,
        id = this.props.project.id,
        title = this.state.title,
        description = this.state.description;

    this.setState({ title: title, description: description });

    var onFailure = (transaction) => {
      transaction.getError().json().then(function(json) {
        var message = 'Sorry, could not update the project';
        if (json.error) {
          message = json.error;
        }
        that.setState({ message: message });
      });
    };

    var onSuccess = (response) => {
      this.setState({ message: null, isEditing: false });
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMutation({
        title: title,
        description: description,
        id: id
      }),
      { onSuccess, onFailure }
    );

    e.preventDefault();
  }

  disableEdit(e) {
    this.setState({ isEditing: false });
    e.preventDefault();
  }

  handleTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  deleteProject() {
    var that = this,
        id = this.props.project.id,
        teamId = this.props.project.team.id;

    if (window.confirm("Are you sure? This can't be undone later!")) {
      var onFailure = (transaction) => {
        transaction.getError().json().then(function(json) {
          var message = 'Sorry, could not delete the project';
          if (json.error) {
            message = json.error;
          }
          that.setState({ message: message });
        });
      };

      var onSuccess = (response) => {
        Checkdesk.history.push('/');
      };

      Relay.Store.commitUpdate(
        new DeleteProjectMutation({
          id: id,
          teamId: teamId
        }),
        { onSuccess, onFailure }
      );
    }
  }

  contactHuman() {
    window.location.href = 'mailto:check@meedan.com?subject=Support Request for Check';
  }

  render() {
    const project = this.props.project;

    return (
      <div className='project-header'>
        <Message message={this.state.message} />
        <div className='project-header__project'>
          {(() => {
            if (this.state.isEditing) {
              return (
                <form className='project-header__project-form' onSubmit={this.updateProject.bind(this)}>
                  <div className={this.bemClass('project-header__project-copy', true, '--is-editing')}>
                    <input className='project-header__project-name-input' id='project-title-field' name='name' type='text' value={this.state.title} placeholder='Add project +' autocomplete='off' onChange={this.handleTitleChange.bind(this)} />
                    <input
                      className='project-header__project-description-input'
                      name='description'
                      type='text'
                      value={this.state.description}
                      onChange={this.handleDescriptionChange.bind(this)}
                      placeholder='Add description'
                      id='project-description-field'
                      autocomplete='off' />
                  </div>
                  <div className='project-header__project-editing-buttons'>
                    <button className='project-header__project-editing-button project-header__project-editing-button--save'>Save</button>
                    <button className='project-header__project-editing-button project-header__project-editing-button--cancel' onClick={this.disableEdit.bind(this)}>Cancel</button>
                  </div>
                </form>
              );
            } else {
              return (
                <div className='project-header__project-copy'>
                  <h2 className='project-header__project-name'>{project.title}</h2>
                  <span className='project-header__project-description'>{project.description}</span>
                </div>
              );
            }
          })()}

          {/* DEPRECATED – replace with HeaderActions */}
          <div className={this.bemClass('project-header__project-settings', this.state.isSettingsMenuOpen, '--active')}>
            <i className='project-header__project-search-icon fa fa-search'></i>
            <i className='project-header__project-settings-icon fa fa-ellipsis-h' onClick={this.toggleSettings.bind(this)}></i>
            <div className={this.bemClass('project-header__project-settings-overlay', this.state.isSettingsMenuOpen, '--active')} onClick={this.toggleSettings.bind(this)}></div>

            <ul className={this.bemClass('project-header__project-settings-panel', this.state.isSettingsMenuOpen, '--active')}>
              
              <li className='TODO project-header__project-setting'>
                <UserMenuRelay {...this.props} />
              </li>
              
              <Can permissions={project.permissions} permission="update Project">
                <li className='project-header__project-setting project-header__project-setting--edit' onClick={this.enableEdit.bind(this)}>Edit project...</li>
              </Can>
              
              <Can permissions={project.team.permissions} permission="update Team">
                <li className='project-header__project-setting project-header__project-setting--manage-team' onClick={Checkdesk.history.push.bind(this, '/members')}>Manage team...</li>
              </Can>
              
              {/*<li className='project-header__project-setting project-header__project-setting--delete' onClick={this.deleteProject.bind(this)}>Delete project</li>*/}
              
              <li className='TODO project-header__project-setting' onClick={this.contactHuman.bind(this)}>Contact a Human</li>

              <li className='TODO project-header__project-setting project-header__logout' onClick={logout}>Sign Out</li>
              <li className='header-actions__setting'><a className='header-actions__link' href='/tos'>Terms of Service</a></li>
              <li className='header-actions__setting'><a className='header-actions__link' href='/privacy'>Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        team {
          id,
          dbid,
          subdomain,
          permissions
        }
      }
    `
  }
});


class ProjectHeader extends Component {
  render() {
    var route = new ProjectRoute({ projectId: this.props.params.projectId });
    return (<Relay.RootContainer Component={ProjectHeaderContainer} route={route} />);
  }
}

export default ProjectHeader;
