import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import TextField from 'material-ui/TextField';
import { Card, CardText, CardActions } from 'material-ui/Card';
import Button from '@material-ui/core/Button';
import UpdateProjectMutation from '../../relay/mutations/UpdateProjectMutation';
import PageTitle from '../PageTitle';
import ProjectRoute from '../../relay/ProjectRoute';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { ContentColumn } from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';

const messages = defineMessages({
  error: {
    id: 'projectEdit.error',
    defaultMessage: 'Sorry, an error occurred while updating the list. Please try again and contact {supportEmail} if the condition persists.',
  },
  titleField: {
    id: 'projectEdit.titleField',
    defaultMessage: 'Title',
  },
  descriptionField: {
    id: 'projectEdit.descriptionField',
    defaultMessage: 'Description',
  },
});

class ProjectEditComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: this.props.project.title,
      description: this.props.project.description,
    };
  }

  componentDidMount() {
    this.setContextProject();
  }

  componentDidUpdate() {
    this.setContextProject();
  }

  getContext() {
    return new CheckContext(this);
  }

  setContextProject() {
    const context = this.getContext();
    const currentContext = this.currentContext();
    const newContext = {};

    newContext.project = this.props.project;

    let notFound = false;
    if (!currentContext.team || currentContext.team.slug !== this.props.project.team.slug) {
      newContext.team = this.props.project.team;
      notFound = true;
    }

    context.setContextStore(newContext);

    if (notFound) {
      currentContext.history.push('/check/not-found');
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  handleCancel = () => this.backToProject();

  handleTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  backToProject = () => {
    this.currentContext().history.push(window.location.pathname.match(/.*\/project\/\d+/)[0]);
  };

  canSubmit = () => (
    this.state.title && (
      this.state.title !== this.props.project.title ||
      this.state.description !== this.props.project.description
    )
  );


  updateProject(e) {
    const { project: { id } } = this.props;
    const { title, description } = this.state;

    if (!this.canSubmit()) {
      return;
    }

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.context.setMessage(message);
      this.currentContext().history.push(`${window.location.pathname}/edit`);
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMutation({
        title,
        description,
        id,
      }),
      { onFailure },
    );

    this.backToProject();

    e.preventDefault();
  }

  render() {
    const { project } = this.props;

    return (
      <PageTitle prefix={project.title} skipTeam={false} team={this.currentContext().team}>
        <section className="project-edit">
          <ContentColumn>
            <Card>
              <form className="project-edit__form" onSubmit={this.updateProject.bind(this)}>
                <CardText>
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
                </CardText>
                <CardActions>
                  <div className="project-edit__editing-buttons">
                    <Button
                      onClick={this.handleCancel}
                      className="project-edit__editing-button project-edit__editing-button--cancel"
                    >
                      {this.props.intl.formatMessage(globalStrings.cancel)}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      className="project-edit__editing-button project-edit__editing-button--save"
                      disabled={!this.canSubmit()}
                    >
                      <FormattedMessage id="projectEdit.saveButton" defaultMessage="Save" />
                    </Button>
                  </div>
                </CardActions>
              </form>
            </Card>
          </ContentColumn>
        </section>
      </PageTitle>
    );
  }
}

ProjectEditComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

ProjectEditComponent.contextTypes = {
  setMessage: PropTypes.func,
  store: PropTypes.object,
};

const ProjectEditComponentWithIntl = injectIntl(ProjectEditComponent);

const ProjectEditContainer = Relay.createContainer(ProjectEditComponentWithIntl, {
  initialVariables: {
    contextId: null,
  },
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
          slug
        }
      }
    `,
  },
});

const ProjectEdit = (props) => {
  const route = new ProjectRoute({ contextId: props.params.projectId });
  return (
    <Relay.RootContainer
      Component={ProjectEditContainer}
      route={route}
    />
  );
};

export default ProjectEdit;
export { ProjectEditComponent, ProjectEditComponentWithIntl };
