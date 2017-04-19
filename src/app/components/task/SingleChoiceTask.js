import React, { Component, PropTypes } from 'react';
import Message from '../Message';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdCancel from 'react-icons/lib/md/cancel';
import MdRadioButtonUnchecked from 'react-icons/lib/md/radio-button-unchecked';

const messages = defineMessages({
  addValue: {
    id: 'singleChoiceTask.addValue',
    defaultMessage: 'Add Option'
  },
  value: {
    id: 'singleChoiceTask.value',
    defaultMessage: 'Value'
  },
  addOther: {
    id: 'singleChoiceTask.addOther',
    defaultMessage: 'Add "Other"'
  },
  other: {
    id: 'singleChoiceTask.other',
    defaultMessage: 'Other'
  },
  newTask: {
    id: 'singleChoiceTask.newTask',
    defaultMessage: 'New task'
  }
});

class SingleChoiceTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: null,
      description: null,
      message: null,
      options: [{label: ''}, {label: ''}],
      submitDisabled: true
    };
  }

  handleSubmitTask() {
    const jsonoptions = JSON.stringify(this.state.options.filter(item => item.label != ''));

    if (!this.state.submitDisabled){
      this.props.onSubmit(this.state.label, this.state.description, jsonoptions);
      this.setState({ submitDisabled: true });
    }
  }

  handleLabelChange(e) {
    this.setState({ label: e.target.value });
    this.validateSingleChoice(e.target.value, this.state.options);
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  handleAddValue(){
    let options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    this.state.hasOther ? options.splice(-1, 0, { label: '' }) : options.push({ label: '' });
    this.setState({ options });

    this.validateSingleChoice(this.state.label, options);
  }

  handleAddOther(){
    let options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    let other = true;
    let label = '';

    if (!this.state.hasOther) {
      label = this.props.intl.formatMessage(messages.other);
      options.push({ label, other });
      this.setState({ options, hasOther: true });
    }

    this.validateSingleChoice(this.state.label, options);
  }

  handleEditOption(e){
    let options = this.state.options.slice(0);
    options[parseInt(e.target.id)].label = e.target.value;
    this.setState({ options });

    this.validateSingleChoice(this.state.label, options);
  }

  handleRemoveOption(index){
    let options = this.state.options.slice(0);
    let hasOther = null;

    if (this.state.hasOther) {
      hasOther = (index === options.length - 1) ? false : true;
    } else {
      hasOther = false;
    }

    options.splice(index, 1);
    this.setState({ options, hasOther });

    this.validateSingleChoice(this.state.label, options);
  }

  validateSingleChoice(label, options) {
    const valid = !!(label && label.trim()) && (options.filter(item => item.label != '').length > 1);
    this.setState({ submitDisabled: !valid });
    return valid;
  }

  renderCreateDialog(){
    const canRemove = (this.state.options.length > 2);
    const { formatMessage } = this.props.intl;
    const actions = [
      <FlatButton label={<FormattedMessage id="tasks.cancelAdd" defaultMessage="Cancel" />} primary onClick={this.props.onDismiss.bind(this)} />,
      <FlatButton className="create-task__dialog-submit-button" label={<FormattedMessage id="tasks.add" defaultMessage="Create Task" />} primary keyboardFocused onClick={this.handleSubmitTask.bind(this)} disabled={this.state.submitDisabled}/>,
    ];

    return (
      <div>
        <Dialog title={this.props.intl.formatMessage(messages.newTask)} className="create-task__dialog" actions={actions} modal={false} open={this.props.mode === 'create'} onRequestClose={this.props.onDismiss} autoScrollBodyContent={true} contentStyle={{width: '608px'}}>
          <Message message={this.state.message} />
          <TextField id="task-label-input" className="tasks__task-label-input" floatingLabelText={<FormattedMessage id="tasks.taskPrompt" defaultMessage="Prompt" />} onChange={this.handleLabelChange.bind(this)} multiLine fullWidth />
          <div className="create-task__add-options">
            { this.state.options.map((item, index) => <div>
                <MdRadioButtonUnchecked className="create-task__md-icon" />
                <TextField className="create-task__add-option-input"
                  id={index.toString()}
                  onChange={this.handleEditOption.bind(this)}
                  placeholder={ formatMessage(messages.value) + ' ' + (index + 1) }
                  value={item.label}
                  disabled={item.other}
                />
              { canRemove ? <MdCancel className="create-task__remove-option-button create-task__md-icon" onClick={this.handleRemoveOption.bind(this, index)}/> : null }
              </div>)
            }
            <div className="create-task__add-options-buttons">
              <FlatButton label={this.props.intl.formatMessage(messages.addValue)} onClick={this.handleAddValue.bind(this)} />
              <FlatButton label={this.props.intl.formatMessage(messages.addOther)} onClick={this.handleAddOther.bind(this)} disabled={this.state.hasOther} />
            </div>
          </div>
          <input className="create-task__add-task-description" id="create-task__add-task-description" type="checkbox" />
          <TextField id="task-description-input" className="create-task__task-description-input" floatingLabelText={<FormattedMessage id="tasks.description" defaultMessage="Description" />} onChange={this.handleDescriptionChange.bind(this)} multiLine />
          <label className="create-task__add-task-description-label" htmlFor="create-task__add-task-description">
            <span className="create-task__add-task-description-icon">+</span> <FormattedMessage id="tasks.addDescription" defaultMessage="Add a description" />
          </label>
        </Dialog>
      </div>
    );
  }

  render() {
    return (
      <div>
        { this.props.mode === 'create' ? this.renderCreateDialog() : null }
      </div>
    );
  }
}

SingleChoiceTask.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SingleChoiceTask);
