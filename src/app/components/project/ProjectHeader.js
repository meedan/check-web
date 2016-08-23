import React, { Component, PropTypes } from 'react';

class ProjectHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false
    };
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? baseClass : [baseClass, baseClass + modifierSuffix].join(' ');
  }

  render() {
    // dummy data
    var project = {
      name: 'Project 1'
    }
    this.props.project = project;

    return (
      <div className='project-header'>{/* might will decompose to ProjectHeader.js component later */}
        <div className='project-header__project'>
          <i className='project-header__project-icon / fa fa-folder-open'></i>
          <div className={this.bemClass('project-header__project-copy', this.state.isEditing, '--is-editing')}>
            {(() => {
              if (this.state.isEditing) {
                return (
                  <form className='project-header__project-form'>
                    <div className={this.bemClass('project-header__project-form-overlay', this.state.isEditing, '--is-editing')}></div>
                    <h2 className='project-header__project-name'>
                      <input className='project-header__project-name-input' name='name' type='text' value={project.name} placeholder='New project...' />
                    </h2>
                    <span className='project-header__project-description'>
                      <input
                        className='project-header__project-description-input'
                        name='description'
                        type='text' value={project.description}
                        placeholder='Add a description...'
                        autocomplete='off' />
                    </span>
                    <div className='project-header__project-editing-buttons'>
                      <button className='project-header__project-editing-button project-header__project-editing-button--cancel'>Cancel</button>
                      <button className='project-header__project-editing-button project-header__project-editing-button--save'>Save</button>
                    </div>
                  </form>
                );
              } else {
                return (
                  <div className={this.bemClass('project-header__project-copy2', this.state.isEditing, '--is-editing')}>
                    <h2 className='project-header__project-name'>{project.name}</h2>
                    <span className='project-header__project-description'>{project.description}</span>
                  </div>
                );
              }
            })()}
          </div>
          <div className='project-header__project-settings {{projectSettingsActiveClass "project-header__project-settings"}}'>
            <i className='project-header__project-settings-icon / fa fa-gear'></i>
            <div className='project-header__project-settings-overlay {{projectSettingsActiveClass "project-header__project-settings-overlay"}}'></div>
            <ul className='project-header__project-settings-panel {{projectSettingsActiveClass "project-header__project-settings-panel"}}'>
              <li className='project-header__project-setting project-header__project-setting--edit'>Edit project...</li>
              <li className='project-header__project-setting project-header__project-setting--delete'>Delete project</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectHeader;
