import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Card, CardText } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import { blue500 } from 'material-ui/styles/colors';
import Message from '../Message';
import UpdateTaskMutation from '../../relay/UpdateTaskMutation';
import { FormattedMessage } from 'react-intl';

class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focus: false,
      message: null
    };
  }

  handleFocus() {
    this.setState({ focus: true });
  }

  handleClick(e) {
    e.stopPropagation();
  }

  handleSubmit(e) {
    const that = this;
    const task = this.props.task;

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
      that.setState({ message: null });
    };

    const form = document.forms[`task-response-${task.id}`];
    const fields = {};
    fields[`response_${task.type}`] = form.response.value;
    fields[`note_${task.type}`] = form.note.value;
    fields[`task_${task.type}`] = task.dbid;

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        annotated: that.props.media,
        task: {
          id: task.id,
          fields,
          annotation_type: `task_response_${task.type}`,
        },
      }),
      { onSuccess, onFailure },
    );

    e.preventDefault();
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  componentDidMount() {
    const that = this;
    window.addEventListener('click', () => { that.setState({ focus: false }) });
  }

  render() {
    const { task } = this.props;

    let response = null;
    let note = null;
    let by = null;
    if (task.first_response) {
      by = task.first_response.annotator.name;
      const fields = JSON.parse(task.first_response.content);
      fields.forEach((field) => {
        if (/^response_/.test(field.field_name)) {
          response = field.value;
        }
        if (/^note_/.test(field.field_name)) {
          note = field.value;
        }
      });
    }

    return (
      <Card onClick={this.handleClick.bind(this)} className="task">
        <CardText>
          <Message message={this.state.message} />
          {response === null ?
          <form onSubmit={this.handleSubmit.bind(this)} name={`task-response-${task.id}`}>
            <TextField floatingLabelText={task.label} 
                       hintText={task.description}
                       onFocus={this.handleFocus.bind(this)}
                       name="response"
                       onKeyPress={this.handleKeyPress.bind(this)}
                       fullWidth={true} />
            <div style={{ display: this.state.focus ? 'block' : 'none' }}>
              <TextField hintText={<FormattedMessage id="task.noteLabel" defaultMessage="Note any additional details here." />}
                         name="note"
                         onKeyPress={this.handleKeyPress.bind(this)}
                         fullWidth={true} />
              <p className="task__resolver"><small><FormattedMessage id="task.pressReturnToSave" defaultMessage="Press return to save your response" /></small></p>
            </div>
          </form>
          :
          <div className="task__resolved">
            <p className="task__label">{task.label}</p>
            <p className="task__response">{response}</p>
            <p style={{ display: note ? 'block' : 'none' }} className="task__note">{note}</p>
            <p className="task__resolver"><small><FormattedMessage id="task.resolvedBy" defaultMessage={`Resolved by {by}`} values={{ by }} /></small></p>
          </div>
          }
        </CardText>
      </Card>
    );
  }
}

export default Task;
