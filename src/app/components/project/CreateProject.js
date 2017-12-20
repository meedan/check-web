import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import TextField from 'material-ui/TextField';
import CreateProjectMutation from '../../relay/mutations/CreateProjectMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';

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
      submitDisabled: false,
    };
  }

  componentDidMount() {
    if (this.props.autofocus) {
      this.projectInput.focus();
    }
  }

  handleSubmit(e) {
    const title = this.projectInput.getValue();
    const team = this.props.team;
    const context = new CheckContext(this);
    const history = context.getContextStore().history;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (ex) {
        // Do nothing.
      }
      this.setState({ message, submitDisabled: false });
    };

    const onSuccess = (response) => {
      const project = response.createProject.project;
      const path = `/${team.slug}/project/${project.dbid}`;
      history.push(path);
    };

    if (!this.state.submitDisabled) {
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
    return (
      <form onSubmit={this.handleSubmit.bind(this)} className="create-project">

        <TextField
          id="create-project-title"
          className={this.props.className || 'team__new-project-input'}
          floatingLabelText={this.props.intl.formatMessage(messages.addProject)}
          ref={(i) => { this.projectInput = i; }}
          style={this.props.style || { marginLeft: '8px' }}
          autoFocus={this.props.autoFocus}
        />

        <Message message={this.state.message} />
      </form>
    );
  }
}

CreateProject.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
};

CreateProject.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(CreateProject);
