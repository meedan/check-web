import React, { Component, PropTypes } from 'react';
import Message from '../Message';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdCancel from 'react-icons/lib/md/cancel';
import MdCheckBoxOutlineBlank from 'react-icons/lib/md/check-box-outline-blank';

const messages = defineMessages({
  addValue: {
    id: 'multiSelectTask.addValue',
    defaultMessage: 'Add Value'
  },
  value: {
    id: 'multiSelectTask.value',
    defaultMessage: 'Value'
  },
  addOther: {
    id: 'multiSelectTask.addOther',
    defaultMessage: 'Add "Other"'
  },
  other: {
    id: 'multiSelectTask.other',
    defaultMessage: 'Other'
  }
});

class MultiSelectTask extends Component {
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
      const props_response = this.props.jsonresponse ? JSON.parse(this.props.jsonresponse) : {};
      let response_obj = {};

      response_obj.selected = Array.isArray(this.state.response) ? this.state.response.slice(0) : props_response.selected;
      response_obj.other = (typeof this.state.responseOther !== 'undefined' && this.state.responseOther !== null) ? this.state.responseOther : (props_response.other || null);

      this.props.onSubmit(JSON.stringify(response_obj), this.state.note);
      this.setState({ taskAnswerDisabled: true });
    }
  }

  canSubmit(){
    const props_response = this.props.jsonresponse ? JSON.parse(this.props.jsonresponse) : {};
    let response_obj = {};

    response_obj.selected = Array.isArray(this.state.response) ? this.state.response.slice(0) : (props_response.selected || []);
    response_obj.other = (typeof this.state.responseOther !== 'undefined' && this.state.responseOther !== null) ? this.state.responseOther.trim() : (props_response.other || null);

    const can_submit = (response_obj.selected.length + !!response_obj.other) > 0;

    this.setState({ taskAnswerDisabled: !can_submit });

    return can_submit;
  }

  handleChange(e) {
    this.setState({ note: e.target.value }, this.canSubmit);
  }

  handleLabelChange(e) {
    this.setState({ label: e.target.value });
    this.validateMultiSelect(e.target.value, this.state.options);
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  handleAddValue(){
    let options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    this.state.hasOther ? options.splice(-1, 0, { label: '' }) : options.push({ label: '' });
    this.setState({ options });

    this.validateMultiSelect(this.state.label, options);
  }

  handleAddOther(){
    let options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    let other = true;
    let label = '';

    if (!this.state.hasOther) {
      options.push({ label, other });
      this.setState({ options, hasOther: true });
    }

    this.validateMultiSelect(this.state.label, options);
  }

  handleEditOption(e){
    let options = this.state.options.slice(0);
    options[parseInt(e.target.id)].label = e.target.value;
    this.setState({ options });

    this.validateMultiSelect(this.state.label, options);
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

    this.validateMultiSelect(this.state.label, options);
  }

  validateMultiSelect(label, options) {
    const valid = !!(label && label.trim()) && (options.filter(item => item.label != '').length > 1);
    this.setState({ submitDisabled: !valid });
    return valid;
  }

  handleCancelResponse() {
    this.setState({ response: null, responseOther: null, note: '', focus: false }, this.canSubmit);
    if (this.props.onDismiss) { this.props.onDismiss(); }
  }

  handleSelectCheckbox(e, inputChecked) {
    inputChecked ? this.addToResponse(e.target.id) : this.removeFromResponse(e.target.id);
    this.setState({ focus: true });
  }

  addToResponse(value) {
    const state_response = Array.isArray(this.state.response) ? this.state.response.slice(0) : null;
    const props_response = !state_response && this.props.jsonresponse ? JSON.parse(this.props.jsonresponse).selected : null;
    let response = state_response || props_response || [];

    response.push(value);
    this.setState({ response }, this.canSubmit);
  }

  removeFromResponse(value) {
    const state_response = Array.isArray(this.state.response) ? this.state.response.slice(0) : null;
    const props_response = !state_response && this.props.jsonresponse ? JSON.parse(this.props.jsonresponse).selected : null;
    let response = state_response || props_response || [];

    const responseIndex = response.findIndex(item => item === value);
    if (responseIndex > -1) {
      response.splice(responseIndex, 1);
      this.setState({ response }, this.canSubmit);
    }
  }

  handleEditOther(e) {
    const value = e.target.value;
    this.setState({ focus: true, responseOther: value }, this.canSubmit);
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

  renderCreateDialog() {
    const canRemove = (this.state.options.length > 2);
    const { formatMessage } = this.props.intl;
    const actions = [
      <FlatButton label={<FormattedMessage id="tasks.cancelAdd" defaultMessage="Cancel" />} primary onClick={this.props.onDismiss.bind(this)} />,
      <FlatButton className="create-task__dialog-submit-button" label={<FormattedMessage id="tasks.add" defaultMessage="Add" />} primary keyboardFocused onClick={this.handleSubmitTask.bind(this)} disabled={this.state.submitDisabled}/>,
    ];

    return (
      <div className="create-task">
        <Dialog actions={actions} modal={false} open={this.props.mode === 'create'} onRequestClose={this.props.onDismiss}>
          <Message message={this.state.message} />
          <div>
            <TextField id="task-label-input" className="tasks__task-label-input" floatingLabelText={<FormattedMessage id="tasks.taskPrompt" defaultMessage="Prompt" />} onChange={this.handleLabelChange.bind(this)} multiLine />
              { this.state.options.map((item, index) => <div>
                  <MdCheckBoxOutlineBlank />
                  <TextField
                    style={{ padding: '5px' }}
                    id={index.toString()}
                    onChange={this.handleEditOption.bind(this)}
                    placeholder={ item.other ? formatMessage(messages.other) : formatMessage(messages.value) + ' ' + (index + 1) }
                    value={item.label} />
                  { canRemove ? <MdCancel onClick={this.handleRemoveOption.bind(this, index)}/> : null }
                </div>)
              }
            <div>
              <FlatButton label={this.props.intl.formatMessage(messages.addValue)} primary onClick={this.handleAddValue.bind(this)} />
              {<FlatButton label={this.props.intl.formatMessage(messages.addOther)} primary onClick={this.handleAddOther.bind(this)} disabled={this.state.hasOther} />}
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

  isChecked(value, index) {
    if (this.state.response) {
      return (this.state.response.findIndex(item => item === value) > -1);
    } else if (this.props.jsonresponse) {
      const response = JSON.parse(this.props.jsonresponse).selected || [];
      return (response.findIndex(item => item === value) > -1);
    }

    return false;
  }

  renderOptions(jsonresponse, note, jsonoptions) {
    let options = null;

    const editable =  (jsonresponse == null) || (this.props.mode === 'edit_response');
    const submitCallback = this.handleSubmitResponse.bind(this);
    const cancelCallback = this.handleCancelResponse.bind(this);
    const keyPressCallback = this.handleKeyPress.bind(this);

    const actionBtns = (<div>
        <FlatButton label={<FormattedMessage id="tasks.cancelEdit" defaultMessage="Cancel" />} primary onClick={cancelCallback} />
        <FlatButton className="task__submit" label={<FormattedMessage id="tasks.submit" defaultMessage="Submit" />} primary onClick={submitCallback} disabled={this.state.taskAnswerDisabled}/>
      </div>);

    if (jsonoptions) {
      options = JSON.parse(jsonoptions);
    }

    if (Array.isArray(options) && options.length > 0) {
      const otherIndex = options.findIndex( item => item.other );
      const other = (otherIndex >= 0) ? options.splice(otherIndex, 1).pop() : null;

      const response = jsonresponse ? JSON.parse(jsonresponse) : {};
      let responseOther = (typeof this.state.responseOther !== 'undefined' && this.state.responseOther !== null) ? this.state.responseOther : (response.other || '');
      let responseNote = (typeof this.state.note !== 'undefined' && this.state.note !== null) ? this.state.note : (note || '');

      return (<div className="task__options">
        { options.map( (item, index) => <Checkbox label={item.label} checked={this.isChecked(item.label, index)} onCheck={this.handleSelectCheckbox.bind(this)} id={item.label} style={{ padding: '5px' }} disabled={!editable} />) }
        { other ? <TextField
          placeholder={other.label}
          value={responseOther}
          name={'response'}
          onKeyPress={keyPressCallback}
          onChange={this.handleEditOther.bind(this)}
          disabled={!editable}
        /> : null }
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
        { (this.state.focus && editable) || (this.props.mode === 'edit_response') ? actionBtns : null }
      </div>);
    }
  }

  render() {
    const { jsonresponse } = this.props;
    const { note } = this.props;
    const { jsonoptions } = this.props;

    return (
      <div>
        { this.props.mode === 'create' ? this.renderCreateDialog() : null }
        { this.props.mode === 'respond' ? this.renderOptions(jsonresponse, note, jsonoptions) : null }
        { this.props.mode === 'show_response' ? this.renderOptions(jsonresponse, note, jsonoptions) : null }
        { this.props.mode === 'edit_response' ? this.renderOptions(jsonresponse, note, jsonoptions) : null }
        {/* this.props.mode === 'edit_task' ? this.renderCreateDialog() : null */}
      </div>
    );
  }
}

MultiSelectTask.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(MultiSelectTask);
