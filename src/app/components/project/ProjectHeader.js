import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import UpdateProjectMutation from '../../relay/UpdateProjectMutation';
import Message from '../Message';

class ProjectHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      settingsMenuClosed: true,
      message: null,
      title: this.props.project.title,
      description: this.props.project.description
    };
  }

  toggleSettings() {
    this.setState({ settingsMenuClosed: !this.state.settingsMenuClosed });
  }

  enableEdit() {
    this.setState({ isEditing: true, settingsMenuClosed: true });
  }

  updateProject(e) {
    var id = this.props.project.id,
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
    return modifierBoolean ? baseClass : [baseClass, baseClass + modifierSuffix].join(' ');
  }

  render() {
    const project = this.props.project;

    return (
      <div className='project-header'>{/* might will decompose to ProjectHeader.js component later */}
        <Message message={this.state.message} />
        <div className='project-header__project'>
          <i className='project-header__project-icon / fa fa-folder-open'></i>
          <div className={this.bemClass('project-header__project-copy', this.state.isEditing, '--is-editing')}>
            {(() => {
              if (this.state.isEditing) {
                return (
                  <form className='project-header__project-form' onSubmit={this.updateProject.bind(this)}>
                    <input className='project-header__project-name-input' id='project-title-field' name='name' type='text' value={this.state.title} placeholder='New project...' autocomplete='off' onChange={this.handleTitleChange.bind(this)} />
                    <span className='project-header__project-description'>
                      <input
                        className='project-header__project-description-input'
                        name='description'
                        type='text'
                        value={this.state.description}
                        onChange={this.handleDescriptionChange.bind(this)}
                        placeholder='Add a description...'
                        id='project-description-field'
                        autocomplete='off' />
                    </span>
                    <div className='project-header__project-editing-buttons'>
                      <button className='project-header__project-editing-button project-header__project-editing-button--cancel' onClick={this.disableEdit.bind(this)}>Cancel</button>
                      <button className='project-header__project-editing-button project-header__project-editing-button--save'>Save</button>
                    </div>
                  </form>
                );
              } else {
                return (
                  <div className={this.bemClass('project-header__project-copy2', this.state.isEditing, '--is-editing')}>
                    <h2 className='project-header__project-name'>{project.title}</h2>
                    <span className='project-header__project-description'>{project.description}</span>
                  </div>
                );
              }
            })()}
          </div>
          <div className={this.bemClass('project-header__project-settings', this.state.settingsMenuClosed, '--active')}>
            <i className='project-header__project-settings-icon fa fa-gear' onClick={this.toggleSettings.bind(this)}></i>
            <div className={this.bemClass('project-header__project-settings-overlay', this.state.settingsMenuClosed, '--active')}></div>
            <ul className={this.bemClass('project-header__project-settings-panel', this.state.settingsMenuClosed, '--active')}>
              <li className='project-header__project-setting project-header__project-setting--edit' onClick={this.enableEdit.bind(this)}>Edit project...</li>
              <li className='project-header__project-setting project-header__project-setting--delete'>Delete project</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectHeader;
