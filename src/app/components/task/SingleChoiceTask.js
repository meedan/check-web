import React, { Component, PropTypes } from 'react';
import Message from '../Message';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
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
      responseOther: null,
      submitDisabled: true,
      taskAnswerDisabled: true
    };
  }

  handleSubmitTask() {
    const jsonoptions = JSON.stringify(this.state.options.filter(item => item.label != ''));

    if (!this.state.submitDisabled){
      this.props.onSubmit(this.state.label, this.state.description, jsonoptions);
      this.setState({ submitDisabled: true });
    }
  }

  handleSubmitResponse() {
    if (!this.state.taskAnswerDisabled){
      // const props_response = this.props.response ? this.props.jsonresponse : {};
      // let response_obj = 'placeholder';

      // response_obj.selected = Array.isArray(this.state.response) ? this.state.response.slice(0) : props_response.selected;
      // response_obj.other = (typeof this.state.responseOther !== 'undefined' && this.state.responseOther !== null) ? this.state.responseOther : (props_response.other || null);

      this.props.onSubmit(this.state.response.trim(), this.state.note);
      this.setState({ taskAnswerDisabled: true });
    }
  }

  canSubmit(value){
    if (typeof value !== 'undefined' && value !== null){
      return !!value.trim();
    } else {
      // const task = this.props.task;
      // const form_id = this.state.editingResponse ? `edit-response-${task.first_response.id}` : `task-response-${task.id}`;
      // const form = document.forms[form_id];
      // const form_value = this.state.editingResponse ? form.editedresponse.value : form.response.value;

      const state_response = this.state.response ? this.state.response.trim() : null;

      return (!!state_response || !!form_value.trim());
    }
  }

  handleChange(e) {
    this.setState({ taskAnswerDisabled: !this.canSubmit(e.target.value) });
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

  handleCancelResponse() {
    this.setState({ response: null, responseOther: null, otherSelected: false, note: '', focus: false }, this.canSubmit);
    if (this.props.onDismiss) { this.props.onDismiss(); }
  }

  handleSelectRadio(e) {
    this.setState({ focus: true, response: e.target.value, responseOther: '', otherSelected: false, taskAnswerDisabled: false });
  }

  handleSelectRadioOther(e) {
    const input = document.querySelector('.task__option_other_text_input input');
    if (input) {
      input.focus();
    }

    this.setState({ focus: true, response: '', responseOther: '', otherSelected: true, taskAnswerDisabled: true });
  }

  handleEditOther(e) {
    const value = e.target.value;
    this.setState({ focus: true, response: value, responseOther: value, otherSelected: true, taskAnswerDisabled: !this.canSubmit(value) });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (this.canSubmit()) {
        this.setState({ taskAnswerDisabled: true });
        this.handleSubmitResponse();
      }
      e.preventDefault();
    }
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

  renderOptions(response, note, jsonoptions) {
    let options = null;

    const editable =  (response == null) || (this.props.mode === 'edit_response');
    const submitCallback = this.handleSubmitResponse.bind(this);
    const cancelCallback = this.handleCancelResponse.bind(this);
    const keyPressCallback = this.handleKeyPress.bind(this);

    const actionBtns = (<div>
        <FlatButton label={<FormattedMessage id="tasks.cancelEdit" defaultMessage="Cancel" />} onClick={cancelCallback} />
        <FlatButton className="task__submit" label={<FormattedMessage id="tasks.submit" defaultMessage="Resolve Task" />} primary onClick={submitCallback} disabled={this.state.taskAnswerDisabled}/>
      </div>);

    if (jsonoptions) {
      options = JSON.parse(jsonoptions);
    }

    if (Array.isArray(options) && options.length > 0) {
      const otherIndex = options.findIndex( item => item.other );
      const other = (otherIndex >= 0) ? options.splice(otherIndex, 1).pop() : null;

      const responseIndex = options.findIndex(item => (item.label === response || item.label === this.state.response));
      const responseOther = ((typeof this.state.responseOther === 'undefined' || this.state.responseOther === null) && (responseIndex < 0)) ? response : this.state.responseOther;
      const responseOtherSelected = this.state.otherSelected || responseOther ? responseOther : 'none';
      const responseSelected = this.state.response == null ? response : this.state.response;

      let responseNote = (typeof this.state.note !== 'undefined' && this.state.note !== null) ? this.state.note : (note || '');

      return (<div className="task__options">
        <RadioButtonGroup name={'response'} onChange={this.handleSelectRadio.bind(this)} valueSelected={responseSelected}>
          { options.map( (item, index) => <RadioButton label={item.label} id={index.toString()} value={item.label} style={{ padding: '5px' }} disabled={!editable}/>) }
        </RadioButtonGroup>

        <div className="task__options_other">
        { other ?
          [ <RadioButtonGroup className="task__option_other_radio" valueSelected={responseOtherSelected} onChange={this.handleSelectRadioOther.bind(this)} >
              <RadioButton value={responseOther} disabled={!editable} />
            </RadioButtonGroup>,
            <TextField className="task__option_other_text_input"
              placeholder={other.label}
              value={responseOther}
              name={'response'}
              onKeyPress={keyPressCallback}
              onChange={this.handleEditOther.bind(this)}
              disabled={!editable}
              multiLine
            />
          ] : null
        }
        </div>

        { editable ?
          <TextField
              className="task__response-note-input"
              hintText={<FormattedMessage id="task.noteLabel" defaultMessage="Note any additional details here." />}
              name={'note'}
              value={responseNote}
              onKeyPress={keyPressCallback}
              onChange={this.handleChange.bind(this)}
              fullWidth
              multiLine
            /> : null
        }
        { (this.state.focus && editable) || this.state.editingResponse ? actionBtns : null }
      </div>);
    }
  }

  render() {
    const { response } = this.props;
    const { note } = this.props;
    const { jsonoptions } = this.props;

    return (
      <div>
        { this.props.mode === 'create' ? this.renderCreateDialog() : null }
        { this.props.mode === 'respond' ? this.renderOptions(response, note, jsonoptions) : null }
        { this.props.mode === 'show_response' ? this.renderOptions(response, note, jsonoptions) : null }
        { this.props.mode === 'edit_response' ? this.renderOptions(response, note, jsonoptions) : null }
        {/* this.props.mode === 'edit_task' ? this.renderCreateDialog() : null */}
      </div>
    );
  }
}

SingleChoiceTask.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SingleChoiceTask);
