import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Message from '../Message';
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
import { MdShortText, MdRadioButtonChecked, MdRadioButtonUnchecked } from 'react-icons/lib/md';
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
    let options = [];
    this.setState({ dialogOpen: true, menuOpen: false, type, options, hasOther: false });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false });
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

    if (!!that.state.label && !!that.state.type) {
      Relay.Store.commitUpdate(
        new CreateTaskMutation({
          label: that.state.label,
          type: that.state.type,
          jsonoptions: JSON.stringify(that.state.options),
          description: that.state.description,
          annotated_type: 'ProjectMedia',
          annotated_id: that.props.media.id,
          annotated_dbid: `${that.props.media.dbid}`,
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

  handleAddValue(){
    let options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    let label = 'Value' + ' ';
    this.state.hasOther ? label += (options.length) : label += (options.length + 1);
    this.state.hasOther ? options.splice(-1, 0, { label }) : options.push({ label });
    this.setState({ options });
  }

  handleAddOther(){
    let options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    let label = 'Other';
    if (!this.state.hasOther) {
      options.push({ label });
      this.setState({ options, hasOther: true });
    }
  }

  handleEditOption(e){
    let options = this.state.options.slice(0);
    console.log('handleEditOption');
    console.log(e.target.id);
    options[parseInt(e.target.id)].label = e.target.value;
    this.setState({ options });
    console.log(JSON.stringify(options));
  }

  renderChooseOneDialog(){
    return (
      <div>
        <TextField id="task-label-input" className="tasks__task-label-input" floatingLabelText={<FormattedMessage id="tasks.taskPrompt" defaultMessage="Prompt" />} onChange={this.handleLabelChange.bind(this)} multiLine />
        {/*<RadioButtonGroup name="chooseOneDialog" className="task__dialog-radio-group">*/}
          {/*this.state.options.map(item => <RadioButton label={item.label} value={`0`} style={{ padding: '5px' }} />)*/}
          { this.state.options.map((item, index) => <div><MdRadioButtonUnchecked /> <TextField style={{ padding: '5px' }} id={index.toString()} onChange={this.handleEditOption.bind(this)} placeholder={item.label} /></div>) }
        {/*</RadioButtonGroup>*/}
        <FlatButton label={`Add Value`} primary onClick={this.handleAddValue.bind(this)} />
        <FlatButton label={`Add "Other"`} primary onClick={this.handleAddOther.bind(this)} />
      </div>
    );
  }

  render() {
    const { media } = this.props;

    const actions = [
      <FlatButton label={<FormattedMessage id="tasks.cancelAdd" defaultMessage="Cancel" />} primary onClick={this.handleCloseDialog.bind(this)} />,
      <FlatButton className="create-task__dialog-submit-button" label={<FormattedMessage id="tasks.add" defaultMessage="Add" />} primary keyboardFocused onClick={this.handleSubmitTask.bind(this)} />,
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
            <MenuItem className="create-task__add-choose-one" onClick={this.handleOpenDialog.bind(this, 'single_choice')} leftIcon={<MdRadioButtonChecked />} primaryText="Choose one" />
            {/*
            <MenuItem onClick={this.handleOpenDialog.bind(this, 'yes_no')} leftIcon={<FontAwesome name="toggle-on" />} primaryText="Yes or no" />
            <MenuItem onClick={this.handleOpenDialog.bind(this, 'multiple_choice')} leftIcon={<FontAwesome name="check-square" />} primaryText="Choose multiple" />
            */}
          </Menu>
        </Popover>

        <Dialog actions={actions} modal={false} open={this.state.dialogOpen} onRequestClose={this.handleCloseDialog.bind(this)}>
          <Message message={this.state.message} />

          {this.state.type === 'free_text' ? <TextField id="task-label-input" className="create-task__task-label-input" floatingLabelText={<FormattedMessage id="tasks.taskLabel" defaultMessage="Task label" />} onChange={this.handleLabelChange.bind(this)} multiLine /> : null}
          {this.state.type === 'single_choice' ? this.renderChooseOneDialog() : null}

          <input className="create-task__add-task-description" id="create-task__add-task-description" type="checkbox" />
          <TextField id="task-description-input" className="create-task__task-description-input" floatingLabelText={<FormattedMessage id="tasks.description" defaultMessage="Description" />} onChange={this.handleDescriptionChange.bind(this)} multiLine />
          <label className="create-task__add-task-description-label" htmlFor="create-task__add-task-description">
            <span className="create-task__add-task-description-icon">+</span> <FormattedMessage id="tasks.addDescription" defaultMessage="Add a description" />
          </label>
        </Dialog>
      </div>
    );
  }
}

export default CreateTask;
