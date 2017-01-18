import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import Message from '../Message';
import UpdateProjectMutation from '../../relay/UpdateProjectMutation';
import DocumentTitle from 'react-document-title';
import ProjectRoute from '../../relay/ProjectRoute';
import ProjectHeader from './ProjectHeader';
import Can from '../Can';
import config from 'config';
import { pageTitle } from '../../helpers';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';
import { bemClass } from '../../helpers';
import TextField from 'material-ui/TextField';

class ProjectEditComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      message: null,
      title: this.props.project.title,
      description: this.props.project.description,
      slackChannel: this.props.project.get_slack_channel,
    };
  }

  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  setContextProject() {
    const context = this.getContext(),
      currentContext = this.currentContext(),
      newContext = {};

    newContext.project = this.props.project;

    let notFound = false;
    if (!currentContext.team || currentContext.team.subdomain != this.props.project.team.subdomain) {
      newContext.team = this.props.project.team;
      notFound = true;
    }

    context.setContextStore(newContext);

    if (notFound) {
      currentContext.history.push('/404');
    }
  }

  componentDidMount() {
    this.setContextProject();
  }

  componentDidUpdate() {
    this.setContextProject();
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
    this.currentContext().history.push(window.location.pathname.match(/^\/project\/\d+/)[0]);
  }

  render() {
    const { project } = this.props;
    const isSlackEnabled = project.team && project.team.get_slack_notifications_enabled === '1';

    return (
      <DocumentTitle title={pageTitle(project.title, false, this.currentContext().team)}>
        <section className='project-edit'>
          <Message message={this.state.message} />
          <ContentColumn>

            <form className="project-edit__form" onSubmit={this.updateProject.bind(this)}>

              <TextField
                name="name"
                id="project-title-field"
                className='project-edit__title-field'
                type="text"
                fullWidth={true}
                value={this.state.title}
                floatingLabelText="Project Title"
                autoComplete="off"
                onChange={this.handleTitleChange.bind(this)}
              />

              <TextField
                name="description"
                id="project-description-field"
                className="project-edit__description-field"
                type="text"
                fullWidth={true}
                multiLine={true}
                value={this.state.description}
                floatingLabelText="Project Description"
                autoComplete="off"
                onChange={this.handleDescriptionChange.bind(this)}
              />
              {isSlackEnabled ?
                <TextField
                  name="slack-channel"
                  className="project-edit__slack-channel-input"
                  id="project-slack-channel-field"
                  type="text"
                  fullWidth={true}
                  value={this.state.slackChannel}
                  placeholder="Add a Slack #channel to be notified about activity in this project"
                  floatingLabelText="Slack #channel"
                  floatingLabelFixed={true}
                  autoComplete="off"
                  onChange={this.handleSlackChannelChange.bind(this)}
                />
              : null }
              <div className="project-edit__editing-buttons">
                <button type='submit' className="project-edit__editing-button project-edit__editing-button--save">Save</button>
              </div>
            </form>

          </ContentColumn>
        </section>
      </DocumentTitle>
    );
  }
}

ProjectEditComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectEditContainer = Relay.createContainer(ProjectEditComponent, {
  initialVariables: {
    contextId: null
  },
  fragments: {
    project: ({ Component, contextId }) => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        team {
          id,
          dbid,
          subdomain
        }
      }
    `,
  },
});

class ProjectEdit extends Component {
  render() {
    const projectId = this.props.params.projectId;
    const route = new ProjectRoute({ contextId: parseInt(projectId) });
    return (
      <Relay.RootContainer
        Component={ProjectEditContainer}
        route={route}
      />
    );
  }
}

export default ProjectEdit;
