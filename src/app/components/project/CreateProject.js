import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CreateProjectMutation from '../../relay/CreateProjectMutation';
import Message from '../Message';

class CreateProject extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null
    };
  }

  handleSubmit(e) {
    var that = this,
        title = document.getElementById('create-project-title').value,
        team = this.props.team;

    var onFailure = (transaction) => {
      let error = transaction.getError();
      let message = 'Sorry, could not create the project';
      try {
        let json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message: message });
    };

    var onSuccess = (response) => {
      var pid = response.createProject.project.dbid;
      window.Checkdesk.history.push('/project/' + pid);
      this.setState({ message: null });
    };

    Relay.Store.commitUpdate(
      new CreateProjectMutation({
        title: title,
        team: team
      }),
      { onSuccess, onFailure }
    );

    e.preventDefault();
  }

  componentDidMount(){
    if (this.props.autofocus) {
      this.projectInput.focus();
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)} className="create-project">
        <input className={this.props.className} placeholder="Add project +" id="create-project-title" ref={(input) => this.projectInput = input} />
        <Message message={this.state.message} />
      </form>
    );
  }
}

export default CreateProject;
