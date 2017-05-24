import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
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

const messages = defineMessages({
  error: {
    id: 'projectEdit.error',
    defaultMessage: 'Sorry, could not update the project',
  },
  titleField: {
    id: 'projectEdit.titleField',
    defaultMessage: 'Project Title',
  },
  descriptionField: {
    id: 'projectEdit.descriptionField',
    defaultMessage: 'Project Description',
  },
  slackChannelField: {
    id: 'projectEdit.slackChannelField',
    defaultMessage: 'Slack #channel',
  },
  slackChannelPlaceholder: {
    id: 'projectEdit.slackChannelPlaceholder',
    defaultMessage: 'Add a Slack #channel to be notified about activity in this project',
  },
});

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
    if (!currentContext.team || currentContext.team.slug != this.props.project.team.slug) {
      newContext.team = this.props.project.team;
      notFound = true;
    }

    context.setContextStore(newContext);

    if (notFound) {
      currentContext.history.push('/check/404');
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
      let message = that.props.intl.formatMessage(messages.error);
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
    this.currentContext().history.push(window.location.pathname.match(/.*\/project\/\d+/)[0]);
  }

  render() {
    const { project } = this.props;
    const isSlackEnabled = project.team && project.team.get_slack_notifications_enabled === '1';

    return (
      <DocumentTitle title={pageTitle(project.title, false, this.currentContext().team)}>
        <section className="project-edit">
          <Message message={this.state.message} />
          <ContentColumn className="card">

            <form className="project-edit__form" onSubmit={this.updateProject.bind(this)}>

              <TextField
                name="name"
                id="project-title-field"
                className="project-edit__title-field"
                type="text"
                fullWidth
                value={this.state.title}
                floatingLabelText={this.props.intl.formatMessage(messages.titleField)}
                autoComplete="off"
                onChange={this.handleTitleChange.bind(this)}
              />

              <TextField
                name="description"
                id="project-description-field"
                className="project-edit__description-field"
                type="text"
                fullWidth
                multiLine
                value={this.state.description}
                floatingLabelText={this.props.intl.formatMessage(messages.descriptionField)}
                autoComplete="off"
                onChange={this.handleDescriptionChange.bind(this)}
              />
              {isSlackEnabled ?
                <TextField
                  name="slack-channel"
                  className="project-edit__slack-channel-input"
                  id="project-slack-channel-field"
                  type="text"
                  fullWidth
                  value={this.state.slackChannel}
                  placeholder={this.props.intl.formatMessage(messages.slackChannelPlaceholder)}
                  floatingLabelText={this.props.intl.formatMessage(messages.slackChannelField)}
                  floatingLabelFixed
                  autoComplete="off"
                  onChange={this.handleSlackChannelChange.bind(this)}
                />
              : null }
              <div className="project-edit__editing-buttons">
                <button type="submit" className="project-edit__editing-button project-edit__editing-button--save">
                  <FormattedMessage id="projectEdit.saveButton" defaultMessage="Save" />
                </button>
              </div>
            </form>

          </ContentColumn>
        </section>
      </DocumentTitle>
    );
  }
}

ProjectEditComponent.propTypes = {
  intl: intlShape.isRequired,
};

ProjectEditComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectEditContainer = Relay.createContainer(injectIntl(ProjectEditComponent), {
  initialVariables: {
    contextId: null,
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
          slug
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
