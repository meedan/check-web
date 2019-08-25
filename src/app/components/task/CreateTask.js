import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import Can from '../Can';
import CreateTaskMutation from '../../relay/mutations/CreateTaskMutation';
import CheckContext from '../../CheckContext';
import CreateTaskMenu from './CreateTaskMenu';
import EditTaskDialog from './EditTaskDialog';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';

class CreateTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: null,
      message: null,
    };
  }

  static getAssignment() {
    const assignment = document.getElementById('attribution-new');
    if (assignment) {
      return assignment.value;
    }
    return null;
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleOpenDialog(type) {
    this.setState({ type });
  }

  handleTeamwideTasks() {
    const { team } = this.getContext();
    browserHistory.push(`/${team.slug}/settings`);
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
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
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
        assigned_to_ids: CreateTask.getAssignment(),
      }),
      { onSuccess, onFailure },
    );
  }

  handleSelectType = (type) => {
    if (type === 'teamwide') {
      this.handleTeamwideTasks();
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

export default injectIntl(CreateTask);
