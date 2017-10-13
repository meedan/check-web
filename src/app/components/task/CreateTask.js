import React, { Component } from 'react';
import Relay from 'react-relay';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import MdShortText from 'react-icons/lib/md/short-text';
import MdRadioButtonChecked from 'react-icons/lib/md/radio-button-checked';
import MdCheckBox from 'react-icons/lib/md/check-box';
import MdLocationOn from 'react-icons/lib/md/location-on';
import MdDateRange from 'react-icons/lib/md/date-range';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import styled from 'styled-components';
import Can from '../Can';
import CreateTaskMutation from '../../relay/CreateTaskMutation';
import Message from '../Message';
import SingleChoiceTask from './SingleChoiceTask';
import MultiSelectTask from './MultiSelectTask';
import { units, StyledTaskDescription, black05 } from '../../styles/js/shared';

const StyledCreateTaskButton = styled(FlatButton)`
  margin-bottom: ${units(2)} !important;

  &:hover {
    background-color: ${black05} !important;
  }
`;

const messages = defineMessages({
  newTask: {
    id: 'createTask.newTask',
    defaultMessage: 'New task',
  },
});

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
      submitDisabled: true,
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
    this.setState({
      dialogOpen: true,
      menuOpen: false,
      type,
      submitDisabled: true,
    });
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
      } catch (e) {}
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({
        dialogOpen: false,
        label: '',
        description: '',
        type: null,
        message: null,
      });
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
      that.setState({ submitDisabled: true });
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
      } catch (e) {}
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

    if (
      this.state.type === 'free_text' ||
      this.state.type === 'geolocation' ||
      this.state.type === 'datetime'
    ) {
      this.validateShortText(e.target.value);
    }
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  validateShortText(label) {
    const valid = !!(label && label.trim());
    this.setState({ submitDisabled: !valid });
    return valid;
  }

  renderDialog() {
    if (this.state.dialogOpen) {
      return (
        <div>
          {this.state.type === 'single_choice'
            ? <SingleChoiceTask
              mode="create"
              onSubmit={this.handleSubmitTask2.bind(this)}
              onDismiss={this.handleCloseDialog.bind(this)}
            />
            : null}
          {this.state.type === 'multiple_choice'
            ? <MultiSelectTask
              mode="create"
              onSubmit={this.handleSubmitTask2.bind(this)}
              onDismiss={this.handleCloseDialog.bind(this)}
            />
            : null}
        </div>
      );
    }
  }

  render() {
    const { media } = this.props;

    const actions = [
      <FlatButton
        label={<FormattedMessage id="tasks.cancelAdd" defaultMessage="Cancel" />}
        primary
        onClick={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        className="create-task__dialog-submit-button"
        label={<FormattedMessage id="tasks.add" defaultMessage="Create Task" />}
        primary
        keyboardFocused
        onClick={this.handleSubmitTask.bind(this)}
        disabled={this.state.submitDisabled}
      />,
    ];

    return (
      <div>

        <Can permissions={media.permissions} permission="create Task">

          <StyledCreateTaskButton
            className="create-task__add-button create-task__add-button--default"
            onClick={this.handleClick.bind(this)}
            label={<FormattedMessage id="tasks.addTask" defaultMessage="Add task" />}
          />
        </Can>

        <Popover
          open={this.state.menuOpen}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose.bind(this)}
        >
          <Menu>
            <MenuItem
              className="create-task__add-short-answer"
              onClick={this.handleOpenDialog.bind(this, 'free_text')}
              leftIcon={<MdShortText />}
              primaryText={
                <FormattedMessage id="tasks.shortAnswer" defaultMessage="Short answer" />
              }
            />
            <MenuItem
              className="create-task__add-choose-one"
              onClick={this.handleOpenDialog.bind(this, 'single_choice')}
              leftIcon={<MdRadioButtonChecked />}
              primaryText={<FormattedMessage id="tasks.chooseOne" defaultMessage="Choose one" />}
            />
            <MenuItem
              className="create-task__add-choose-multiple"
              onClick={this.handleOpenDialog.bind(this, 'multiple_choice')}
              leftIcon={<MdCheckBox />}
              primaryText={
                <FormattedMessage id="tasks.chooseMultiple" defaultMessage="Choose multiple" />
              }
            />
            <MenuItem
              className="create-task__add-geolocation"
              onClick={this.handleOpenDialog.bind(this, 'geolocation')}
              leftIcon={<MdLocationOn />}
              primaryText={<FormattedMessage id="tasks.geolocation" defaultMessage="Location" />}
            />
            <MenuItem
              className="create-task__add-datetime"
              onClick={this.handleOpenDialog.bind(this, 'datetime')}
              leftIcon={<MdDateRange />}
              primaryText={<FormattedMessage id="tasks.datetime" defaultMessage="Date and time" />}
            />
          </Menu>
        </Popover>

        <Dialog
          title={this.props.intl.formatMessage(messages.newTask)}
          className="create-task__dialog"
          actionsContainerClassName="create-task__action-container"
          actions={actions}
          modal={false}
          open={
            this.state.dialogOpen &&
            (this.state.type === 'free_text' ||
              this.state.type === 'geolocation' ||
              this.state.type === 'datetime')
          }
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          <Message message={this.state.message} />

          {this.state.type === 'free_text' ||
            this.state.type === 'geolocation' ||
            this.state.type === 'datetime'
            ? <TextField
              id="task-label-input"
              className="create-task__task-label-input"
              fullWidth
              floatingLabelText={
                <FormattedMessage id="tasks.taskLabel" defaultMessage="Prompt" />
                }
              onChange={this.handleLabelChange.bind(this)}
              multiLine
            />
            : null}

          {this.state.type === 'free_text'
            ? <StyledTaskDescription>
              <input
                className="create-task__add-task-description"
                id="create-task__add-task-description"
                type="checkbox"
              />
              <TextField
                id="task-description-input"
                className="create-task__task-description-input"
                floatingLabelText={
                  <FormattedMessage id="tasks.description" defaultMessage="Description" />
                  }
                onChange={this.handleDescriptionChange.bind(this)}
                multiLine
              />
              <label
                className="create-task__add-task-description-label"
                htmlFor="create-task__add-task-description"
              >
                <span className="create-task__add-task-description-icon">
                    +
                  </span>{' '}
                <FormattedMessage id="tasks.addDescription" defaultMessage="Add a description" />
              </label>
            </StyledTaskDescription>
            : null}
        </Dialog>

        {this.renderDialog()}
      </div>
    );
  }
}

export default injectIntl(CreateTask);
