import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import UpdateProjectMutation from '../../relay/mutations/UpdateProjectMutation';
import PageTitle from '../PageTitle';
import ProjectRoute from '../../relay/ProjectRoute';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { ContentColumn } from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';
import { withSetFlashMessage } from '../FlashMessage';
import { FormattedGlobalMessage } from '../MappedMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

class ProjectEditComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: this.props.project.title,
      description: this.props.project.description,
      showConfirmUpdateProjectDialog: false,
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
      browserHistory.push('/check/not-found');
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
    browserHistory.push(window.location.pathname.match(/.*\/project\/\d+/)[0]);
  };

  canSubmit = () => (
    this.state.title && (
      this.state.title !== this.props.project.title ||
      this.state.description !== this.props.project.description
    )
  );

  confirmUpdateProject(e) {
    this.setState({ showConfirmUpdateProjectDialog: true });
    e.preventDefault();
  }

  updateProject() {
    const { project: { id } } = this.props;
    const { title, description } = this.state;

    if (!this.canSubmit()) {
      return;
    }

    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          id="projectEdit.error"
          defaultMessage="Sorry, an error occurred while updating the list. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.props.setFlashMessage(message, 'error');
      browserHistory.push(`${window.location.pathname}/edit`);
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
  }

  render() {
    const { project } = this.props;

    return (
      <PageTitle prefix={project.title} team={this.currentContext().team}>
        <section className="project-edit">
          <ContentColumn>
            <Card>
              <form className="project-edit__form" onSubmit={this.confirmUpdateProject.bind(this)}>
                <CardContent>
                  <TextField
                    name="name"
                    id="project-title-field"
                    className="project-edit__title-field"
                    label={<FormattedMessage id="projectEdit.titleField" defaultMessage="Title" />}
                    type="text"
                    fullWidth
                    value={this.state.title}
                    autoComplete="off"
                    onChange={this.handleTitleChange.bind(this)}
                    margin="normal"
                    variant="outlined"
                  />

                  <TextField
                    name="description"
                    id="project-description-field"
                    className="project-edit__description-field"
                    type="text"
                    fullWidth
                    multiline
                    value={this.state.description}
                    label={
                      <FormattedMessage
                        id="projectEdit.descriptionField"
                        defaultMessage="Description"
                      />
                    }
                    autoComplete="off"
                    onChange={this.handleDescriptionChange.bind(this)}
                    margin="normal"
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    onClick={this.handleCancel}
                    className="project-edit__editing-button project-edit__editing-button--cancel"
                  >
                    <FormattedGlobalMessage messageKey="cancel" />
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
                </CardActions>
              </form>
            </Card>
          </ContentColumn>
        </section>
        <ConfirmProceedDialog
          open={this.state.showConfirmUpdateProjectDialog}
          title={
            <FormattedMessage
              id="projectEdit.confirmProceedTitle"
              defaultMessage="Are you sure you want to change this list?"
            />
          }
          body={(
            <div>
              <Typography variant="body1" component="p" paragraph>
                <FormattedMessage
                  id="projectEdit.confirmProceedBody"
                  defaultMessage="Changes made to this list will be reflected for everyone in this workspace."
                />
              </Typography>
            </div>
          )}
          proceedLabel={<FormattedMessage id="projectEdit.confirmProceedLabel" defaultMessage="Save changes" />}
          onProceed={this.updateProject.bind(this)}
          cancelLabel={<FormattedMessage id="projectEdit.confirmCancelLabel" defaultMessage="Go back" />}
          onCancel={() => { this.setState({ showConfirmUpdateProjectDialog: false }); }}
        />
      </PageTitle>
    );
  }
}

ProjectEditComponent.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

ProjectEditComponent.contextTypes = {
  store: PropTypes.object,
};

const ConnectedProjectEditComponent = withSetFlashMessage(ProjectEditComponent);

const ProjectEditContainer = Relay.createContainer(ConnectedProjectEditComponent, {
  initialVariables: {
    projectId: null,
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
  const route = new ProjectRoute({ projectId: props.params.projectId });
  return (
    <Relay.RootContainer
      Component={ProjectEditContainer}
      route={route}
    />
  );
};

export default ProjectEdit;
export { ProjectEditComponent, ConnectedProjectEditComponent };
