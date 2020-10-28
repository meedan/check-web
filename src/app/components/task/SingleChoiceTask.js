import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import ParsedText from '../ParsedText';
import { FormattedGlobalMessage } from '../MappedMessage';
import { safelyParseJSON } from '../../helpers';
import { StyledSmallTextField } from '../../styles/js/shared';

class SingleChoiceTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      response: null,
      responseOther: null,
      taskAnswerDisabled: true,
    };
  }

  handleSubmitResponse() {
    if (!this.state.taskAnswerDisabled) {
      const response = this.state.response ? this.state.response.trim() : this.props.response;

      this.props.onSubmit(response);
      this.setState({ taskAnswerDisabled: true });
    }
  }

  canSubmit() {
    const response = this.state.response ? this.state.response.trim() : this.props.response;
    const can_submit = !!response;

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
    // TODO Use React ref
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
    const { value } = e.target;
    this.setState({
      focus: true,
      response: value,
      responseOther: value,
      otherSelected: true,
    }, this.canSubmit);
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

  renderOptions(response, jsonoptions) {
    const { fieldset } = this.props;
    const options = safelyParseJSON(jsonoptions);
    const editable = !response || this.props.mode === 'edit_response';
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
      const responseIndex =
        options.findIndex(item => item.label === response || item.label === this.state.response);
      let responseOther = '';
      if (typeof this.state.responseOther !== 'undefined' && this.state.responseOther !== null) {
        ({ responseOther } = this.state);
      } else if (responseIndex < 0) {
        responseOther = response;
      }
      const responseOtherSelected = this.state.otherSelected || responseOther
        ? responseOther
        : 'none';
      const responseSelected = this.state.response === null ? response : this.state.response;

      return (
        <div className="task__options">
          <FormGroup>
            <RadioGroup
              name="response"
              onChange={this.handleSelectRadio.bind(this)}
              value={responseSelected}
            >
              {options.map((item, index) => (
                <FormControlLabel
                  key={`task__options--radiobutton-${index.toString()}`}
                  id={index.toString()}
                  value={item.label}
                  label={
                    <ParsedText text={item.label} />
                  }
                  control={
                    <Radio disabled={!editable} />
                  }
                />
              ))}
            </RadioGroup>

            <Box display="flex" justifyContent="flex-start" alignItems="center"
              className="task__options_other"
            >
              {other ?
                <RadioGroup
                  name="task__option_other_radio"
                  key="task__option_other_radio"
                  className="task__option_other_radio"
                  value={responseOtherSelected}
                  onChange={this.handleSelectRadioOther.bind(this)}
                >
                  <FormControlLabel
                    value={responseOther}
                    control={
                      <Radio disabled={!editable} />
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
                </RadioGroup>
                : null}
            </Box>

            {(this.state.focus && editable) || this.props.mode === 'edit_response'
              ? actionBtns
              : null}
          </FormGroup>
        </div>
      );
    }

    return null;
  }

  render() {
    const {
      response,
      jsonoptions,
    } = this.props;

    return (
      <div>
        {this.props.mode === 'respond' ? this.renderOptions(response, jsonoptions) : null}
        {this.props.mode === 'show_response' && response
          ? this.renderOptions(response, jsonoptions)
          : null}
        {this.props.mode === 'edit_response'
          ? this.renderOptions(response, jsonoptions)
          : null}
      </div>
    );
  }
}

export default SingleChoiceTask;
