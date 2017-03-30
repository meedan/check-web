import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Message from '../Message';
import SingleChoiceTask from './SingleChoiceTask';
import MultiSelectTask from './MultiSelectTask';
import Task from './Task';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Can from '../Can';
import CreateTaskMutation from '../../relay/CreateTaskMutation';
import { FormattedMessage } from 'react-intl';
import { MdCancel, MdShortText, MdRadioButtonChecked, MdCheckBox } from 'react-icons/lib/md';
import MdAddCircle from 'react-icons/lib/md/add-circle';

class CreateTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false,
      dialogOpen: false,
      type: null,
      label: null,
      description: null,
      message: null,
      submitDisabled: true
    };
  }

  handleClick(event) {
    event.preventDefault();

    this.setState({
      menuOpen: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose() {
    this.setState({
      menuOpen: false,
    });
  }

  handleOpenDialog(type) {
    this.setState({ dialogOpen: true, menuOpen: false, type, submitDisabled: true });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false, type: null });
  }

  handleSubmitTask() {
    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ dialogOpen: false, label: '', description: '', type: null, message: null });
    };

    if (!that.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new CreateTaskMutation({
          label: that.state.label,
          type: that.state.type,
          description: that.state.description,
          annotated_type: 'ProjectMedia',
          annotated_id: that.props.media.id,
          annotated_dbid: `${that.props.media.dbid}`,
        }),
        { onSuccess, onFailure },
      );
    }
  }

  handleSubmitTask2(label, description, jsonoptions) {
    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ dialogOpen: false, type: null, message: null });
    };

    Relay.Store.commitUpdate(
      new CreateTaskMutation({
        label,
        type: that.state.type,
        jsonoptions,
        description,
        annotated_type: 'ProjectMedia',
        annotated_id: that.props.media.id,
        annotated_dbid: `${that.props.media.dbid}`,
      }),
      { onSuccess, onFailure },
    );
  }

  handleLabelChange(e) {
    this.setState({ label: e.target.value });

    if (this.state.type === 'free_text') {
      this.validateShortText(e.target.value);
    }
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  validateShortText(label) {
    const valid =  !!(label && label.trim());
    this.setState({ submitDisabled: !valid });
    return valid;
  }

  renderDialog() {
    if (this.state.dialogOpen) {
      return (
        <div>
          { this.state.type === 'single_choice' ? <SingleChoiceTask mode="create" onSubmit={this.handleSubmitTask2.bind(this)} onDismiss={this.handleCloseDialog.bind(this)} /> : null }
          { this.state.type === 'multiple_choice' ? <MultiSelectTask mode="create" onSubmit={this.handleSubmitTask2.bind(this)} onDismiss={this.handleCloseDialog.bind(this)} /> : null }
        </div>
      );
    }
  }

  render() {
    const { media } = this.props;

    const actions = [
      <FlatButton label={<FormattedMessage id="tasks.cancelAdd" defaultMessage="Cancel" />} primary onClick={this.handleCloseDialog.bind(this)} />,
      <FlatButton className="create-task__dialog-submit-button" label={<FormattedMessage id="tasks.add" defaultMessage="Add" />} primary keyboardFocused onClick={this.handleSubmitTask.bind(this)} disabled={this.state.submitDisabled}/>,
    ];

    return (
      <div className="create-task">

        <Can permissions={media.permissions} permission="create Task">
          { this.props.plusIcon ?
            <MdAddCircle className="create-task__add-button create-task__add-button--plus" onClick={this.handleClick.bind(this)} label={<FormattedMessage id="tasks.addTask" defaultMessage="Add task" />}/> :
            <FlatButton className="create-task__add-button create-task__add-button--default" onClick={this.handleClick.bind(this)} label={<FormattedMessage id="tasks.addTask" defaultMessage="Add task" />} />
          }
        </Can>

        <Popover open={this.state.menuOpen} anchorEl={this.state.anchorEl} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} targetOrigin={{ horizontal: 'left', vertical: 'top' }} onRequestClose={this.handleRequestClose.bind(this)}>
          <Menu>
            <MenuItem className="create-task__add-short-answer" onClick={this.handleOpenDialog.bind(this, 'free_text')} leftIcon={<MdShortText />} primaryText={<FormattedMessage id="tasks.shortAnswer" defaultMessage="Short answer" />} />
            <MenuItem className="create-task__add-choose-one" onClick={this.handleOpenDialog.bind(this, 'single_choice')} leftIcon={<MdRadioButtonChecked />} primaryText={<FormattedMessage id="tasks.chooseOne" defaultMessage="Choose one" />} />
            <MenuItem className="create-task__add-choose-multiple" onClick={this.handleOpenDialog.bind(this, 'multiple_choice')} leftIcon={<MdCheckBox/>} primaryText={<FormattedMessage id="tasks.chooseMultiple" defaultMessage="Choose multiple" />} />
          </Menu>
        </Popover>

        <Dialog actionsContainerClassName="create-task__action-container" actions={actions} modal={false} open={this.state.dialogOpen && (this.state.type === 'free_text')} onRequestClose={this.handleCloseDialog.bind(this)}>
          <Message message={this.state.message} />

          {this.state.type === 'free_text' ? <TextField id="task-label-input" className="create-task__task-label-input" floatingLabelText={<FormattedMessage id="tasks.taskLabel" defaultMessage="Task label" />} onChange={this.handleLabelChange.bind(this)} multiLine /> : null}

          <input className="create-task__add-task-description" id="create-task__add-task-description" type="checkbox" />
          <TextField id="task-description-input" className="create-task__task-description-input" floatingLabelText={<FormattedMessage id="tasks.description" defaultMessage="Description" />} onChange={this.handleDescriptionChange.bind(this)} multiLine />
          <label className="create-task__add-task-description-label" htmlFor="create-task__add-task-description">
            <span className="create-task__add-task-description-icon">+</span> <FormattedMessage id="tasks.addDescription" defaultMessage="Add a description" />
          </label>
        </Dialog>

        { this.renderDialog() }
      </div>
    );
  }
}

export default CreateTask;
