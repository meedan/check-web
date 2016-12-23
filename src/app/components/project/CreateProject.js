import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CreateProjectMutation from '../../relay/CreateProjectMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';

class CreateProject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
    };
  }

  handleSubmit(e) {
    let that = this,
        title = document.getElementById('create-project-title').value,
        team = this.props.team,
        history = new CheckContext(this).getContextStore().history;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = 'Sorry, could not create the project';
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      const pid = response.createProject.project.dbid;
      history.push(`/project/${pid}`);
      this.setState({ message: null });
    };

    Relay.Store.commitUpdate(
      new CreateProjectMutation({
        title,
        team,
      }),
      { onSuccess, onFailure },
    );

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
        <input className={this.props.className} placeholder="Add project +" id="create-project-title" ref={input => this.projectInput = input} />
        <Message message={this.state.message} />
      </form>
    );
  }
}

CreateProject.contextTypes = {
  store: React.PropTypes.object
};

export default CreateProject;
