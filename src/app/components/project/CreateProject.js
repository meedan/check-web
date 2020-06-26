import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CreateProjectMutation from '../../relay/mutations/CreateProjectMutation';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import {
  units,
} from '../../styles/js/shared';

class CreateProject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      name: null,
      submitDisabled: false,
    };
  }

  handleChange = (e) => {
    this.setState({ name: e.target.value });
  };

  handleKeyDown = (e) => {
    if (e.key === 'Escape' && this.props.onBlur) {
      this.props.onBlur();
    }
  };

  handleSubmit(e) {
    const title = this.state.name ? this.state.name.trim() : null;
    const { team } = this.props;

    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          id="createProject.error"
          defaultMessage="Sorry, an error occurred while updating the list. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message, submitDisabled: false });
    };

    const onSuccess = (response) => {
      const { createProject: { project } } = response;
      const path = `/${team.slug}/project/${project.dbid}`;
      browserHistory.push(path);
      if (this.props.onCreate) {
        this.props.onCreate();
      }
    };

    if (!this.state.submitDisabled && title) {
      Relay.Store.commitUpdate(
        new CreateProjectMutation({
          title,
          team,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ submitDisabled: true });
    }

    e.preventDefault();
  }

  render() {
    const textInput = (
      <FormattedMessage id="createProject.newProjectName" defaultMessage="List name">
        {placeholder => (
          <TextField
            id="create-project-title"
            className={this.props.className}
            placeholder={placeholder /* TODO make it `label`? */}
            style={this.props.style}
            autoFocus={this.props.autoFocus}
            label={this.state.message}
            error={this.state.message}
            value={this.state.name}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            fullWidth
          />
        )}
      </FormattedMessage>
    );

    const submitButton = (
      <Button
        id="create-project-submit-button"
        onClick={this.handleSubmit.bind(this)}
        color="primary"
        disabled={!this.state.name}
      >
        <FormattedMessage id="createProject.addProject" defaultMessage="Create list" />
      </Button>
    );

    const form = (
      <form onSubmit={this.handleSubmit.bind(this)} className="create-project">
        {textInput}
        {submitButton}
      </form>
    );

    const { team } = this.props;

    if (this.props.renderCard) {
      return (
        <Card
          style={{ marginBottom: units(2) }}
        >
          <CardHeader
            title={team.projects.edges.length
              ? <FormattedMessage id="createProject.title" defaultMessage="Add a list" />
              : <FormattedMessage id="createProject.titleBlank" defaultMessage="Add your first list" />
            }
          />
          <CardContent>
            <form onSubmit={this.handleSubmit.bind(this)} className="create-project">
              {textInput}
            </form>
          </CardContent>
          <CardActions>
            {submitButton}
          </CardActions>
        </Card>
      );
    }

    return form;
  }
}
CreateProject.defaultProps = {
  onBlur: null,
  className: 'team__new-project-input',
};
CreateProject.propTypes = {
  className: PropTypes.string, // default "team__new-project-input"
  autoFocus: PropTypes.bool.isRequired,
  onBlur: PropTypes.func, // or null
  onCreate: PropTypes.func.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    projects: PropTypes.shape({
      edges: PropTypes.array.isRequired,
    }).isRequired,
  }).isRequired,
};

export default CreateProject;
