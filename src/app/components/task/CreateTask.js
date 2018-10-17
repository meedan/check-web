import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Can from '../Can';
import CreateTaskMutation from '../../relay/mutations/CreateTaskMutation';
import CheckContext from '../../CheckContext';
import CreateTaskMenu from './CreateTaskMenu';
import EditTaskDialog from './EditTaskDialog';
import TeamwideTasksNudgeDialog from './TeamwideTasksNudgeDialog';
import { safelyParseJSON } from '../../helpers';

class CreateTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: null,
      message: null,
      nudgeDialogOpen: false,
    };
  }

  static getAssignment() {
    let assignment = document.getElementById('attribution-new');
    if (assignment) {
      assignment = parseInt(assignment.value, 10);
    } else {
      assignment = 0;
    }
    return assignment;
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleOpenDialog(type) {
    this.setState({ type });
  }

  handleTeamwideNudgeDialog() {
    const { team } = this.getContext();
    if (team.plan === 'pro') {
      this.setState({ nudgeDialogOpen: false });
      window.open(config.restBaseUrl.replace('/api/', `/admin/team/${team.dbid}/edit`), '_blank');
    } else {
      this.setState({ nudgeDialogOpen: true });
    }
  }

  handleCloseTeamwideNudgeDialog() {
    this.setState({ nudgeDialogOpen: false });
  }

  handleCloseDialog() {
    this.setState({ type: null });
  }

  handleSubmitTaskObj(task) {
    const {
      label,
      description,
      required,
      jsonoptions,
    } = task;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    const onSuccess = () => {
      this.setState({
        type: null,
        message: null,
      });
    };

    Relay.Store.commitUpdate(
      new CreateTaskMutation({
        label,
        description,
        required,
        type: this.state.type,
        jsonoptions,
        annotated_type: 'ProjectMedia',
        annotated_id: this.props.media.id,
        annotated_dbid: `${this.props.media.dbid}`,
        assigned_to_id: CreateTask.getAssignment(),
      }),
      { onSuccess, onFailure },
    );
  }

  handleSelectType = (type) => {
    if (type === 'teamwide') {
      this.handleTeamwideNudgeDialog();
    } else {
      this.handleOpenDialog(type);
    }
  };

  render() {
    const { media } = this.props;

    if (media.archived) {
      return null;
    }

    return (
      <div>
        <Can permissions={media.permissions} permission="create Task">
          <CreateTaskMenu onSelect={this.handleSelectType} />
        </Can>
        <TeamwideTasksNudgeDialog
          open={this.state.nudgeDialogOpen}
          onDismiss={this.handleCloseTeamwideNudgeDialog.bind(this)}
        />
        { this.state.type ?
          <EditTaskDialog
            media={media}
            message={this.state.message}
            taskType={this.state.type}
            onDismiss={this.handleCloseDialog.bind(this)}
            onSubmit={this.handleSubmitTaskObj.bind(this)}
            allowAssignment
          />
          : null
        }
      </div>
    );
  }
}

CreateTask.contextTypes = {
  store: PropTypes.object,
};

export default CreateTask;
