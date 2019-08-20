import React from 'react';
import { FormattedMessage } from 'react-intl';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

class ShortTextRespondTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskAnswerDisabled: true,
      canBeAutoChanged: true,
    };
  }

  componentDidMount() {
    // This code only applies if this page is embedded in the browser extension
    if (window.parent !== window) {
      // Receive the selected text from the page and use it to fill a task answer
      const receiveMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.selectedText &&
          parseInt(data.task, 10) === parseInt(this.props.task.dbid, 10) &&
          this.state.canBeAutoChanged &&
          !this.props.response) {
          this.setState({ response: data.selectedText, taskAnswerDisabled: false }, () => {
            this.input.focus();
          });
        }
      };
      window.addEventListener('message', receiveMessage, false);
    }
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled) {
      const response = this.state.response ? this.state.response.trim() : this.props.response;

      this.props.onSubmit(response);
      this.setState({ taskAnswerDisabled: true });
    }
  }

  canSubmit() {
    const response = this.state.response
      ? this.state.response.trim()
      : typeof this.state.response === 'undefined' && this.props.response;

    this.setState({ taskAnswerDisabled: !response });
  }

  handleChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state, this.canSubmit);
  }

  handleCancel() {
    this.setState(
      { response: null, focus: false },
      this.canSubmit,
    );
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  handleKeyUp(e) {
    if (e.target.value !== '' && this.state.canBeAutoChanged) {
      this.setState({ canBeAutoChanged: false });
    }
    if (e.target.value === '' && !this.state.canBeAutoChanged) {
      this.setState({ canBeAutoChanged: true });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!this.state.taskAnswerDisabled) {
        this.setState({ taskAnswerDisabled: true });
        this.handleSubmit();
      }
      e.preventDefault();
    }
  }

  render() {
    const actionBtns = (
      <p className="task__resolver">
        <FlatButton
          className="task__cancel"
          label={<FormattedMessage id="shortTextRespondTask.cancelTask" defaultMessage="Cancel" />}
          onClick={this.handleCancel.bind(this)}
        />
        <FlatButton
          className="task__save"
          label={<FormattedMessage id="shortTextRespondTask.answerTask" defaultMessage="Answer task" />}
          onClick={this.handleSubmit.bind(this)}
          disabled={this.state.taskAnswerDisabled}
          primary
        />
      </p>
    );

    const response = typeof this.state.response !== 'undefined' && this.state.response !== null
      ? this.state.response : this.props.response || '';

    return (
      <div>
        <TextField
          hintText={
            <FormattedMessage
              id="shortTextRespondTask.responseHint"
              defaultMessage="Answer here."
            />
          }
          className="task__response-input"
          value={response}
          name="response"
          onChange={this.handleChange.bind(this)}
          onKeyPress={this.handleKeyPress.bind(this)}
          onKeyUp={this.handleKeyUp.bind(this)}
          onFocus={() => { this.setState({ focus: true }); }}
          ref={(input) => { this.input = input; }}
          fullWidth
          multiLine
        />
        {this.state.focus || this.props.response ? actionBtns : null}
      </div>
    );
  }
}

export default ShortTextRespondTask;
