import React, { Component } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import ParsedText from '../ParsedText';
import { FormattedGlobalMessage } from '../MappedMessage';
import { safelyParseJSON } from '../../helpers';
import { StyledSmallTextField, StyledCheckbox } from '../../styles/js/shared';

class MultiSelectTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      responseOther: null,
      taskAnswerDisabled: true,
    };
  }

  isChecked(value) {
    if (this.state.response) {
      return this.state.response.findIndex(item => item === value) > -1;
    } else if (this.props.jsonresponse) {
      const response = JSON.parse(this.props.jsonresponse).selected || [];
      return response.findIndex(item => item === value) > -1;
    }

    return false;
  }

  handleSubmitResponse() {
    if (!this.state.taskAnswerDisabled) {
      const props_response = this.props.jsonresponse ? JSON.parse(this.props.jsonresponse) : {};
      const response_obj = {};

      response_obj.selected = Array.isArray(this.state.response)
        ? this.state.response.slice(0)
        : props_response.selected;
      response_obj.other = typeof this.state.responseOther !== 'undefined' &&
        this.state.responseOther !== null
        ? this.state.responseOther
        : props_response.other || null;

      this.props.onSubmit(JSON.stringify(response_obj));
      this.setState({ taskAnswerDisabled: true });
    }
  }

  canSubmit() {
    const props_response = safelyParseJSON(this.props.jsonresponse) || {};
    const response_obj = {};

    response_obj.selected = Array.isArray(this.state.response)
      ? this.state.response.slice(0)
      : props_response.selected || [];
    response_obj.other = typeof this.state.responseOther !== 'undefined' &&
      this.state.responseOther !== null
      ? this.state.responseOther.trim()
      : props_response.other || null;

    const can_submit = response_obj.selected.length + !!response_obj.other > 0;

    this.setState({ taskAnswerDisabled: !can_submit });
    return can_submit;
  }

  handleCancelResponse() {
    this.setState({
      response: null,
      responseOther: null,
      otherSelected: false,
      focus: false,
    }, this.canSubmit);

    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  handleSelectCheckbox(e, inputChecked) {
    if (inputChecked) {
      this.addToResponse(e.target.id);
    } else {
      this.removeFromResponse(e.target.id);
    }
    this.setState({ focus: true });
  }

  handleSelectCheckboxOther(e, inputChecked) {
    const input = document.querySelector('.task__option_other_text_input input');

    if (inputChecked) {
      if (input) {
        input.focus();
      }
      this.setState({ focus: true, otherSelected: true });
    } else {
      this.setState({ focus: true, responseOther: '', otherSelected: false }, this.canSubmit);
    }
  }

  addToResponse(value) {
    const state_response = Array.isArray(this.state.response) ? this.state.response.slice(0) : null;
    const props_response = !state_response && this.props.jsonresponse
      ? JSON.parse(this.props.jsonresponse).selected
      : null;
    const response = state_response || props_response || [];

    response.push(value);
    this.setState({ response }, this.canSubmit);
  }

  removeFromResponse(value) {
    const state_response = Array.isArray(this.state.response) ? this.state.response.slice(0) : null;
    const props_response = !state_response && this.props.jsonresponse
      ? JSON.parse(this.props.jsonresponse).selected
      : null;
    const response = state_response || props_response || [];

    const responseIndex = response.findIndex(item => item === value);
    if (responseIndex > -1) {
      response.splice(responseIndex, 1);
      this.setState({ response }, this.canSubmit);
    }
  }

  handleEditOther(e) {
    this.setState({ focus: true, responseOther: e.target.value }, this.canSubmit);
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

  renderOptions(jsonresponse, jsonoptions) {
    const { fieldset } = this.props;
    const options = safelyParseJSON(jsonoptions);
    const editable = jsonresponse == null || this.props.mode === 'edit_response';
    const submitCallback = this.handleSubmitResponse.bind(this);
    const cancelCallback = this.handleCancelResponse.bind(this);
    const keyPressCallback = this.handleKeyPress.bind(this);

    const actionBtns = (
      <div>
        <Button onClick={cancelCallback}>
          <FormattedMessage id="tasks.cancelEdit" defaultMessage="Cancel" />
        </Button>
        <Button
          className="task__submit"
          color="primary"
          onClick={submitCallback}
          disabled={this.state.taskAnswerDisabled}
        >
          { fieldset === 'tasks' ?
            <FormattedMessage id="tasks.answer" defaultMessage="Answer Task" /> :
            <FormattedGlobalMessage messageKey="save" />
          }
        </Button>
      </div>
    );

    if (Array.isArray(options) && options.length > 0) {
      const otherIndex = options.findIndex(item => item.other);
      const other = otherIndex >= 0 ? options.splice(otherIndex, 1).pop() : null;
      const response = safelyParseJSON(jsonresponse) || {};
      const responseOther = typeof this.state.responseOther !== 'undefined' &&
        this.state.responseOther !== null
        ? this.state.responseOther
        : response.other || '';

      return (
        <div className="task__options">
          <FormGroup>
            {options.map((item, index) => (
              <FormControlLabel
                key={`task__options-multiselect-${index.toString()}`}
                control={
                  <StyledCheckbox
                    checked={this.isChecked(item.label, index)}
                    onChange={this.handleSelectCheckbox.bind(this)}
                    id={item.label}
                    disabled={!editable}
                  />
                }
                label={
                  <ParsedText text={item.label} />
                }
              />
            ))}

            <Box display='flex' justifyContent='flex-start' className="task__options_other">
              {other ?
                <div key="task__option_other_checkbox">
                  <FormControlLabel
                    control={
                      <StyledCheckbox
                        className="task__option_other_checkbox"
                        checked={this.state.otherSelected || !!responseOther}
                        onChange={this.handleSelectCheckboxOther.bind(this)}
                        disabled={!editable}
                      />
                    }
                    label={editable ?
                      <StyledSmallTextField
                        key="task__option_other_text_input"
                        className="task__option_other_text_input"
                        placeholder={other.label}
                        value={responseOther}
                        name="response"
                        onKeyPress={keyPressCallback}
                        onChange={this.handleEditOther.bind(this)}
                        multiline
                      /> :
                      <ParsedText text={responseOther} />
                    }
                  />
                </div>
                : null}
            </Box>
          </FormGroup>

          {(this.state.focus && editable) || this.props.mode === 'edit_response'
            ? actionBtns
            : null}
        </div>
      );
    }

    return null;
  }

  render() {
    const {
      jsonresponse,
      jsonoptions,
    } = this.props;

    return (
      <div>
        {this.props.mode === 'respond' ? this.renderOptions(jsonresponse, jsonoptions) : null}
        {this.props.mode === 'show_response' && jsonresponse
          ? this.renderOptions(jsonresponse, jsonoptions)
          : null}
        {this.props.mode === 'edit_response'
          ? this.renderOptions(jsonresponse, jsonoptions)
          : null}
      </div>
    );
  }
}

export default MultiSelectTask;
