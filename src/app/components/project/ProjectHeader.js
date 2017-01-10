import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import UpdateProjectMutation from '../../relay/UpdateProjectMutation';
import DeleteProjectMutation from '../../relay/DeleteProjectMutation';
import Message from '../Message';
import Can from '../Can';
import ProjectRoute from '../../relay/ProjectRoute';
import UserMenuRelay from '../../relay/UserMenuRelay';
import CheckContext from '../../CheckContext';
import { Link } from 'react-router';
import { logout } from '../../actions/actions';
import FontAwesome from 'react-fontawesome';

class ProjectHeaderComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      isSettingsMenuOpen: false,
      message: null,
      title: this.props.project.title,
      description: this.props.project.description,
      slackChannel: this.props.project.get_slack_channel,
    };
  }

  toggleSettings() {
    this.setState({ isSettingsMenuOpen: !this.state.isSettingsMenuOpen });
  }

  enableEdit() {
    this.setState({ isEditing: true, isSettingsMenuOpen: false });
  }

  updateProject(e) {
    let that = this,
      id = this.props.project.id,
      title = this.state.title,
      description = this.state.description,
      slackChannel = this.state.slackChannel;

    this.setState({ title, description, slackChannel });

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = 'Sorry, could not update the project';
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      this.setState({ message: null, isEditing: false });
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMutation({
        title,
        description,
        slackChannel,
        id,
      }),
      { onSuccess, onFailure },
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

  handleSlackChannelChange(e) {
    this.setState({ slackChannel: e.target.value });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  deleteProject() {
    let that = this,
      id = this.props.project.id,
      teamId = this.props.project.team.id,
      history = new CheckContext(this).getContextStore().history;

    if (window.confirm("Are you sure? This can't be undone later!")) {
      const onFailure = (transaction) => {
        const error = transaction.getError();
        let message = 'Sorry, could not delete the project';
        try {
          const json = JSON.parse(error.source);
          if (json.error) {
            message = json.error;
          }
        } catch (e) { }
        that.setState({ message });
      };

      const onSuccess = (response) => {
        history.push('/');
      };

      Relay.Store.commitUpdate(
        new DeleteProjectMutation({
          id,
          teamId,
        }),
        { onSuccess, onFailure },
      );
    }
  }

  contactHuman() {
    window.location.href = 'mailto:check@meedan.com?subject=Support Request for Check';
  }

  render() {
    const project = this.props.project;

    return (
      <div className="project-header">
        <Message message={this.state.message} />
        {(() => {
          if (this.state.isEditing) {
            return (
              <div className="project-header__project">
                <form className="project-header__project-form" onSubmit={this.updateProject.bind(this)}>
                  <div className={this.bemClass('project-header__project-copy', true, '--is-editing')}>
                    <input className="project-header__project-name-input" id="project-title-field" name="name" type="text" value={this.state.title} placeholder="Project name" autoComplete="off" onChange={this.handleTitleChange.bind(this)} />
                    <input
                      className="project-header__project-description-input"
                      name="description"
                      type="text"
                      value={this.state.description}
                      onChange={this.handleDescriptionChange.bind(this)}
                      placeholder="Add description"
                      id="project-description-field"
                      autoComplete="off"
                    />
                    { project.team.get_slack_notifications_enabled === '1' ?
                      <input
                        className="project-header__project-slack-channel-input"
                        name="slack-channel"
                        type="text"
                        value={this.state.slackChannel}
                        onChange={this.handleSlackChannelChange.bind(this)}
                        placeholder="Add a Slack #channel to be notified about activity in this project"
                        id="project-slack-channel-field"
                        autoComplete="off"
                      />
                    : null }
                  </div>
                  <div className="project-header__project-editing-buttons">
                    <button className="project-header__project-editing-button project-header__project-editing-button--save">Save</button>
                    <button className="project-header__project-editing-button project-header__project-editing-button--cancel" onClick={this.disableEdit.bind(this)}>Cancel</button>
                  </div>
                </form>
              </div>
            );
          } else {
            return (
              <div className="project-header__project">
                <div className="project-header__project-copy">
                  <h2 className="project-header__project-name">{project.title}</h2>
                  <span className="project-header__project-description">{project.description}</span>
                </div>
                {/* DEPRECATED – replace with HeaderActions */}
                <div className={this.bemClass('project-header__project-settings', this.state.isSettingsMenuOpen, '--active')}>
                  <Link to="/search"><FontAwesome name="search" className="header-actions__search-icon" /></Link>
                  <i className="project-header__project-settings-icon fa fa-ellipsis-h" onClick={this.toggleSettings.bind(this)} />
                  <div className={this.bemClass('project-header__project-settings-overlay', this.state.isSettingsMenuOpen, '--active')} onClick={this.toggleSettings.bind(this)} />

                  <ul className={this.bemClass('project-header__project-settings-panel', this.state.isSettingsMenuOpen, '--active')}>

                    <li className="TODO project-header__project-setting">
                      <UserMenuRelay {...this.props} />
                    </li>

                    <Can permissions={project.permissions} permission="update Project">
                      <li className="project-header__project-setting project-header__project-setting--edit" onClick={this.enableEdit.bind(this)}>Edit project...</li>
                    </Can>

                    {/* <li className='project-header__project-setting project-header__project-setting--delete' onClick={this.deleteProject.bind(this)}>Delete project</li>*/}

                    <li className="TODO project-header__project-setting" onClick={this.contactHuman.bind(this)}>Contact a Human</li>

                    <li className="TODO project-header__project-setting project-header__logout" onClick={logout}>Sign Out</li>
                    <li className="header-actions__menu-item"><Link className="header-actions__link" to="/tos" >Terms of Service</Link></li>
                    <li className="header-actions__menu-item"><Link className="header-actions__link" to="/privacy">Privacy Policy</Link></li>
                    <li className="header-actions__menu-item"><a className="header-actions__link" target="_blank" rel="noopener noreferrer" href="http://meedan.com/check">About Check</a></li>
                  </ul>
                </div>
              </div>
            );
          }
        })()}
      </div>
    );
  }
}

ProjectHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        get_slack_channel,
        team {
          id,
          dbid,
          subdomain,
          permissions,
          get_slack_notifications_enabled
        }
      }
    `,
  },
});


class ProjectHeader extends Component {
  render() {
    const route = new ProjectRoute({ contextId: this.props.params.projectId });
    return (<Relay.RootContainer Component={ProjectHeaderContainer} route={route} />);
  }
}

export default ProjectHeader;
