import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Message from '../Message';
import Task from './Task';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FontAwesome from 'react-fontawesome';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Can from '../Can';
import CreateTaskMutation from '../../relay/CreateTaskMutation';

class Tasks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false,
      dialogOpen: false,
      type: null,
      label: null,
      description: null,
      message: null
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
    this.setState({ dialogOpen: true, menuOpen: false, type });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false });
  }

  handleSubmitTask() {
    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = 'Sorry, could not create the task';
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

    if (!!that.state.label && !!that.state.type) {
      Relay.Store.commitUpdate(
        new CreateTaskMutation({
          label: that.state.label,
          type: that.state.type,
          description: that.state.description,
          annotated_type: 'ProjectMedia',
          annotated_id: that.props.media.id,
          annotated_dbid: `${that.props.media.dbid}`
        }),
        { onSuccess, onFailure },
      );
    }
  }

  handleLabelChange(e) {
    this.setState({ label: e.target.value });
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  render() {
    const media = this.props.media;

    const actions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleCloseDialog.bind(this)} />,
      <FlatButton label="Add" primary={true} keyboardFocused={true} onClick={this.handleSubmitTask.bind(this)} />,
    ];

    return (
      <div>
        
        <Can permissions={media.permissions} permission="create Task">
          <FlatButton onClick={this.handleClick.bind(this)} label="Add task" />
        </Can>

        <Popover open={this.state.menuOpen} anchorEl={this.state.anchorEl} anchorOrigin={{horizontal: 'left', vertical: 'bottom'}} targetOrigin={{horizontal: 'left', vertical: 'top'}} onRequestClose={this.handleRequestClose.bind(this)}>
          <Menu>
            <MenuItem onClick={this.handleOpenDialog.bind(this, 'free_text')} leftIcon={<FontAwesome name="align-left" />} primaryText="Short answer" />
            <MenuItem onClick={this.handleOpenDialog.bind(this, 'yes_no')} leftIcon={<FontAwesome name="toggle-on" />} primaryText="Yes or no" />
            <MenuItem onClick={this.handleOpenDialog.bind(this, 'single_choice')} leftIcon={<FontAwesome name="circle-o" />} primaryText="Choose one" />
            <MenuItem onClick={this.handleOpenDialog.bind(this, 'multiple_choice')} leftIcon={<FontAwesome name="check-square" />} primaryText="Choose multiple" />
          </Menu>
        </Popover>

        <Dialog title="Add Task" actions={actions} modal={false} open={this.state.dialogOpen} onRequestClose={this.handleCloseDialog.bind(this)}>
          <Message message={this.state.message} />
          <TextField floatingLabelText="Task label" onChange={this.handleLabelChange.bind(this)} />
          <TextField floatingLabelText="Description" onChange={this.handleDescriptionChange.bind(this)} />
        </Dialog>

        <ul className="tasks-list">
          {media.tasks.edges.map(task => (
            <li><Task task={task.node} media={media} /></li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Tasks;
