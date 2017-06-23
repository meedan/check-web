import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import CreateProjectMutation from '../../relay/CreateProjectMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import TextField from 'material-ui/TextField';

const messages = defineMessages({
  addProject: {
    id: 'createProject.addProject',
    defaultMessage: 'Add project +',
  },
  error: {
    id: 'createProject.error',
    defaultMessage: 'Sorry, could not create the project',
  },
});

class CreateProject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      submitDisabled: false
    };
  }

  handleSubmit(e) {
    let that = this,
      title = document.getElementById('create-project-title').value,
      team = this.props.team,
      context = new CheckContext(this),
      history = context.getContextStore().history;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message, submitDisabled: false });
    };

    const onSuccess = (response) => {
      const project = response.createProject.project;
      const path = `/${team.slug}/project/${project.dbid}`;
      history.push(path);
    };

    if (!that.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new CreateProjectMutation({
          title,
          team,
        }),
        { onSuccess, onFailure },
      );
      that.setState({ submitDisabled: true });
    }

    e.preventDefault();
  }

  componentDidMount() {
    if (this.props.autofocus) {
      this.projectInput.focus();
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)} className="create-project">

        <TextField
          id="create-project-title"
          className={this.props.className}
          floatingLabelText={this.props.intl.formatMessage(messages.addProject)}
          ref={input => this.projectInput = input}
        />

        <Message message={this.state.message} />
      </form>
    );
  }
}

CreateProject.propTypes = {
  intl: intlShape.isRequired,
};

CreateProject.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(CreateProject);
