import React from 'react';
import { FormattedMessage } from 'react-intl';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

class ShortTextRespondTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskAnswerDisabled: true,
    };
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled) {
      const response = this.state.response ? this.state.response.trim() : this.props.response;

      this.props.onSubmit(response, this.state.note);
      this.setState({ taskAnswerDisabled: true });
    }
  }

  canSubmit() {
    const taskAnswerDisabled = !(this.state.response && this.state.response.trim());
    this.setState({ taskAnswerDisabled });
  }

  handleChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state, this.canSubmit);
  }

  handleCancel() {
    this.setState(
      { response: null, note: '', focus: false },
      this.canSubmit,
    );
    if (this.props.onDismiss) {
      this.props.onDismiss();
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
          label={<FormattedMessage id="shortTextRespondTask.resolveTask" defaultMessage="Resolve task" />}
          onClick={this.handleSubmit.bind(this)}
          disabled={this.state.taskAnswerDisabled}
          primary
        />
      </p>
    );

    const response = typeof this.state.response !== 'undefined' && this.state.response !== null
      ? this.state.response : this.props.response || '';

    const note = typeof this.state.note !== 'undefined' && this.state.note !== null
      ? this.state.note : this.props.note || '';

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
          onFocus={() => { this.setState({ focus: true }); }}
          fullWidth
          multiLine
        />
        <TextField
          hintText={
            <FormattedMessage
              id="shortTextRespondTask.noteHint"
              defaultMessage="Note any additional details here."
            />
          }
          value={note}
          name="note"
          onChange={this.handleChange.bind(this)}
          onFocus={() => { this.setState({ focus: true }); }}
          fullWidth
          multiLine
        />
        {this.state.focus || this.props.response ? actionBtns : null}
      </div>
    );
  }
}

export default ShortTextRespondTask;
