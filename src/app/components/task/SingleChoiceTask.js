import React, { Component } from 'react';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdCancel from 'react-icons/lib/md/cancel';
import MdRadioButtonUnchecked from 'react-icons/lib/md/radio-button-unchecked';
import Message from '../Message';
import { StyledTaskDescription, units } from '../../styles/js/shared';

const messages = defineMessages({
  addValue: {
    id: 'singleChoiceTask.addValue',
    defaultMessage: 'Add Option',
  },
  value: {
    id: 'singleChoiceTask.value',
    defaultMessage: 'Value',
  },
  addOther: {
    id: 'singleChoiceTask.addOther',
    defaultMessage: 'Add "Other"',
  },
  other: {
    id: 'singleChoiceTask.other',
    defaultMessage: 'Other',
  },
  newTask: {
    id: 'singleChoiceTask.newTask',
    defaultMessage: 'New task',
  },
});

class SingleChoiceTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: null,
      description: null,
      message: null,
      options: [{ label: '' }, { label: '' }],
      responseOther: null,
      submitDisabled: true,
      taskAnswerDisabled: true,
    };
  }

  handleSubmitTask() {
    const jsonoptions = JSON.stringify(this.state.options.filter(item => item.label !== ''));

    if (!this.state.submitDisabled) {
      this.props.onSubmit(this.state.label, this.state.description, jsonoptions);
      this.setState({ submitDisabled: true });
    }
  }

  handleSubmitResponse() {
    if (!this.state.taskAnswerDisabled) {
      const response = this.state.response ? this.state.response.trim() : this.props.response;

      this.props.onSubmit(response, this.state.note);
      this.setState({ taskAnswerDisabled: true });
    }
  }

  canSubmit() {
    const response = this.state.response ? this.state.response.trim() : this.props.response;
    const can_submit = !!response;

    this.setState({ taskAnswerDisabled: !can_submit });
    return can_submit;
  }

  handleChange(e) {
    this.setState({ note: e.target.value }, this.canSubmit);
  }

  handleLabelChange(e) {
    this.setState({ label: e.target.value });
    this.validateSingleChoice(e.target.value, this.state.options);
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  handleAddValue() {
    const options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    if (this.state.hasOther) {
      options.splice(-1, 0, { label: '' });
    } else {
      options.push({ label: '' });
    }
    this.setState({ options });

    this.validateSingleChoice(this.state.label, options);
  }

  handleAddOther() {
    const options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    const other = true;
    let label = '';

    if (!this.state.hasOther) {
      label = this.props.intl.formatMessage(messages.other);
      options.push({ label, other });
      this.setState({ options, hasOther: true });
    }

    this.validateSingleChoice(this.state.label, options);
  }

  handleEditOption(e) {
    const options = this.state.options.slice(0);
    options[parseInt(e.target.id, 10)].label = e.target.value;
    this.setState({ options });

    this.validateSingleChoice(this.state.label, options);
  }

  handleRemoveOption(index) {
    const options = this.state.options.slice(0);
    let hasOther = null;

    if (this.state.hasOther) {
      hasOther = index !== options.length - 1;
    } else {
      hasOther = false;
    }

    options.splice(index, 1);
    this.setState({ options, hasOther });

    this.validateSingleChoice(this.state.label, options);
  }

  validateSingleChoice(label, options) {
    const valid = !!(label && label.trim()) && options.filter(item => item.label !== '').length > 1;
    this.setState({ submitDisabled: !valid });
    return valid;
  }

  handleCancelResponse() {
    this.setState(
      {
        response: null, responseOther: null, otherSelected: false, note: '', focus: false,
      },
      this.canSubmit,
    );
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  handleSelectRadio(e) {
    this.setState({
      focus: true,
      response: e.target.value,
      responseOther: '',
      otherSelected: false,
      taskAnswerDisabled: false,
    });
  }

  handleSelectRadioOther() {
    const input = document.querySelector('.task__option_other_text_input input');
    if (input) {
      input.focus();
    }

    this.setState({
      focus: true,
      response: '',
      responseOther: '',
      otherSelected: true,
      taskAnswerDisabled: true,
    });
  }

  handleEditOther(e) {
    const value = e.target.value;
    this.setState(
      {
        focus: true, response: value, responseOther: value, otherSelected: true,
      },
      this.canSubmit,
    );
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
    const canRemove = this.state.options.length > 2;
    const { formatMessage } = this.props.intl;
    const actions = [
      <FlatButton
        key="create-task__dialog-cancel-button"
        label={<FormattedMessage id="tasks.cancelAdd" defaultMessage="Cancel" />}
        onClick={this.props.onDismiss.bind(this)}
      />,
      <FlatButton
        key="create-task__dialog-submit-button"
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
        <Dialog
          title={this.props.intl.formatMessage(messages.newTask)}
          className="create-task__dialog"
          actions={actions}
          modal={false}
          open={this.props.mode === 'create'}
          onRequestClose={this.props.onDismiss}
          autoScrollBodyContent
        >
          <Message message={this.state.message} />
          <TextField
            id="task-label-input"
            className="tasks__task-label-input"
            floatingLabelText={<FormattedMessage id="tasks.taskPrompt" defaultMessage="Prompt" />}
            onChange={this.handleLabelChange.bind(this)}
            multiLine
            fullWidth
          />
          <div style={{ marginTop: units(2) }}>
            {this.state.options.map((item, index) =>
              (<div key={`create-task__add-options-radiobutton-${index.toString()}`}>
                <MdRadioButtonUnchecked
                  key="create-task__md-icon"
                  className="create-task__md-icon"
                />
                <TextField
                  key="create-task__add-option-input"
                  className="create-task__add-option-input"
                  id={index.toString()}
                  onChange={this.handleEditOption.bind(this)}
                  placeholder={`${formatMessage(messages.value)} ${index + 1}`}
                  value={item.label}
                  disabled={item.other}
                  style={{ padding: `${units(0.5)} ${units(1)}`, width: '75%' }}
                />
                {canRemove
                  ? <MdCancel
                    key="create-task__remove-option-button"
                    className="create-task__remove-option-button create-task__md-icon"
                    onClick={this.handleRemoveOption.bind(this, index)}
                  />
                  : null}
               </div>))}
            <div style={{ marginTop: units(1) }}>
              <FlatButton
                label={this.props.intl.formatMessage(messages.addValue)}
                onClick={this.handleAddValue.bind(this)}
              />
              <FlatButton
                label={this.props.intl.formatMessage(messages.addOther)}
                onClick={this.handleAddOther.bind(this)}
                disabled={this.state.hasOther}
              />
            </div>
          </div>
          <StyledTaskDescription>
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
              <span className="create-task__add-task-description-icon">+</span>{' '}
              <FormattedMessage id="tasks.addDescription" defaultMessage="Add a description" />
            </label>
          </StyledTaskDescription>
        </Dialog>
      </div>
    );
  }

  renderOptions(response, note, jsonoptions) {
    let options = null;

    const editable = response == null || this.props.mode === 'edit_response';
    const submitCallback = this.handleSubmitResponse.bind(this);
    const cancelCallback = this.handleCancelResponse.bind(this);
    const keyPressCallback = this.handleKeyPress.bind(this);

    const actionBtns = (
      <div>
        <FlatButton
          label={<FormattedMessage id="tasks.cancelEdit" defaultMessage="Cancel" />}
          onClick={cancelCallback}
        />
        <FlatButton
          className="task__submit"
          label={<FormattedMessage id="tasks.submit" defaultMessage="Resolve Task" />}
          primary
          onClick={submitCallback}
          disabled={this.state.taskAnswerDisabled}
        />
      </div>
    );

    if (jsonoptions) {
      options = JSON.parse(jsonoptions);
    }

    if (Array.isArray(options) && options.length > 0) {
      const otherIndex = options.findIndex(item => item.other);
      const other = otherIndex >= 0 ? options.splice(otherIndex, 1).pop() : null;

      const responseIndex = options.findIndex(item => item.label === response || item.label === this.state.response);
      let responseOther = '';
      if (typeof this.state.responseOther !== 'undefined' && this.state.responseOther !== null) {
        responseOther = this.state.responseOther;
      } else if (responseIndex < 0) {
        responseOther = response;
      }
      const responseOtherSelected = this.state.otherSelected || responseOther
        ? responseOther
        : 'none';
      const responseSelected = this.state.response == null ? response : this.state.response;

      const responseNote = typeof this.state.note !== 'undefined' && this.state.note !== null
        ? this.state.note
        : note || '';

      return (
        <div className="task__options">
          <RadioButtonGroup
            name="response"
            onChange={this.handleSelectRadio.bind(this)}
            valueSelected={responseSelected}
          >
            {options.map((item, index) =>
              (<RadioButton
                key={`task__options--radiobutton-${index.toString()}`}
                label={item.label}
                id={index.toString()}
                value={item.label}
                style={{ padding: '4px' }}
                disabled={!editable}
              />))}
          </RadioButtonGroup>

          <div className="task__options_other">
            {other
              ? [
                <RadioButtonGroup
                  name="task__option_other_radio"
                  key="task__option_other_radio"
                  className="task__option_other_radio"
                  valueSelected={responseOtherSelected}
                  onChange={this.handleSelectRadioOther.bind(this)}
                >
                  <RadioButton value={responseOther} disabled={!editable} />
                </RadioButtonGroup>,
                <TextField
                  key="task__option_other_text_input"
                  className="task__option_other_text_input"
                  placeholder={other.label}
                  value={responseOther}
                  name="response"
                  onKeyPress={keyPressCallback}
                  onChange={this.handleEditOther.bind(this)}
                  disabled={!editable}
                  multiLine
                />,
              ]
              : null}
          </div>

          {editable
            ? <TextField
              className="task__response-note-input"
              hintText={
                <FormattedMessage
                  id="task.noteLabel"
                  defaultMessage="Note any additional details here."
                />
              }
              name="note"
              value={responseNote}
              onKeyPress={keyPressCallback}
              onChange={this.handleChange.bind(this)}
              fullWidth
              multiLine
            />
            : null}
          {(this.state.focus && editable) || this.props.mode === 'edit_response'
            ? actionBtns
            : null}
        </div>
      );
    }

    return null;
  }

  render() {
    const { response } = this.props;
    const { note } = this.props;
    const { jsonoptions } = this.props;

    return (
      <div>
        {this.props.mode === 'create' ? this.renderCreateDialog() : null}
        {this.props.mode === 'respond' ? this.renderOptions(response, note, jsonoptions) : null}
        {this.props.mode === 'show_response'
          ? this.renderOptions(response, note, jsonoptions)
          : null}
        {this.props.mode === 'edit_response'
          ? this.renderOptions(response, note, jsonoptions)
          : null}
        {/* this.props.mode === 'edit_task' ? this.renderCreateDialog() : null */}
      </div>
    );
  }
}

SingleChoiceTask.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(SingleChoiceTask);
