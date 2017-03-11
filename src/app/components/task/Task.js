import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Card, CardText } from 'material-ui/Card';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import TextField from 'material-ui/TextField';
import { blue500 } from 'material-ui/styles/colors';
import Message from '../Message';
import UpdateTaskMutation from '../../relay/UpdateTaskMutation';
import UpdateDynamicMutation from '../../relay/UpdateDynamicMutation';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Can from '../Can';
import MdMoreHoriz from 'react-icons/lib/md/more-horiz';
import MdInfoOutline from 'react-icons/lib/md/info-outline';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

const messages = defineMessages({
  confirmDelete: {
    id: 'task.confirmDelete',
    defaultMessage: 'Are you sure you want to delete this task?',
  },
});

class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focus: false,
      editing: false,
      message: null,
      editingResponse: false,
      isMenuOpen: false,
      taskAnswerDisabled: false,
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
      if (!this.state.taskAnswerDisabled) {
        this.setState({ taskAnswerDisabled: true });
        this.handleSubmit(e);
      }
      e.preventDefault();
    }
  }

  handleChange(e) {
    if (this.state.taskAnswerDisabled) {
      this.setState({ taskAnswerDisabled: false });
    }
  }

  handleEdit() {
    this.setState({ editing: true, isMenuOpen: false });
  }

  handleCancelEdit() {
    this.setState({ editing: false });
  }

  handleUpdateTask(e) {
    const that = this;
    const task = this.props.task;
    const form = document.forms[`edit-task-${task.dbid}`];

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
      that.setState({ message: null, editing: false });
    };

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        annotated: that.props.media,
        task: {
          id: task.id,
          label: form.label.value,
          description: form.description.value,
        },
      }),
      { onSuccess, onFailure },
    );

    e.preventDefault();
  }

  handleDelete() {
    if (window.confirm(this.props.intl.formatMessage(messages.confirmDelete))) {
      const that = this;
      Relay.Store.commitUpdate(
        new DeleteAnnotationMutation({
          parent_type: 'project_media',
          annotated: that.props.media,
          id: that.props.task.id,
        }),
      );
    }
    this.setState({ isMenuOpen: false });
  }

  handleCancelEditResponse() {
    this.setState({ editingResponse: false });
  }

  handleEditResponse() {
    this.setState({ editingResponse: true });
  }

  handleKeyPressUpdate(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!this.state.taskAnswerDisabled) {
        this.setState({ taskAnswerDisabled: true });
        this.handleSubmitUpdate(e);
      }
      e.preventDefault();
    }
  }

  handleSubmitUpdate(e) {
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
      that.setState({ message: null, editingResponse: false });
    };

    const form = document.forms[`edit-response-${task.first_response.id}`];
    const fields = {};
    fields[`response_${task.type}`] = form.editedresponse.value;
    fields[`note_${task.type}`] = form.editednote.value;

    Relay.Store.commitUpdate(
      new UpdateDynamicMutation({
        annotated: that.props.media,
        dynamic: {
          id: task.first_response.id,
          fields,
        },
      }),
      { onSuccess, onFailure },
    );

    e.preventDefault();
  }

  toggleMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  componentDidMount() {
    const that = this;
    window.addEventListener('click', () => { that.setState({ focus: false }); });
  }

  handleSelectRadio() {

  }

  renderOptions(response) {
    const { task } = this.props;
    let options = null;

    if (task.jsonoptions) {
      options = JSON.parse(task.jsonoptions);
    }

    if (Array.isArray(options) && options.length > 0) {
      if (task.type === 'single_choice') {
        return (<div>
          <RadioButtonGroup name="response" className="task__radio-group" onChange={this.handleSelectRadio.bind(this)} defaultSelected={response}>
            { options.map( (item, index) => <RadioButton label={item.label} value={item.label} style={{ padding: '5px' }} disabled={!!response}/>) }
          </RadioButtonGroup>
          { response ? null : <FlatButton className="task__submit" label={<FormattedMessage id="tasks.submit" defaultMessage="Submit" />} primary keyboardFocused onClick={this.handleSubmit.bind(this)} /> }
        </div>);
      } else if (task.type === 'multiple_choice') {
        /* render checkboxes */
      }
    }
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

    const dialogActions = [
      <FlatButton label={<FormattedMessage id="tasks.cancelEdit" defaultMessage="Cancel" />} primary onClick={this.handleCancelEdit.bind(this)} />,
      <FlatButton className="task__save" label={<FormattedMessage id="tasks.save" defaultMessage="Save" />} primary keyboardFocused onClick={this.handleUpdateTask.bind(this)} />,
    ];

    const taskActions = (
      <Can permissions={task.permissions} permission="update Task">
        {/* TODO: abstract media-actions into @mixin or component to remove these classes */}
        <div className={`task__actions ${this.bemClass('media-actions', this.state.isMenuOpen, '--active')}`}>
          <MdMoreHoriz className="media-actions__icon" onClick={this.toggleMenu.bind(this)} />
          <div className={this.bemClass('media-actions__overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleMenu.bind(this)} />
          <ul className={this.bemClass('media-actions__menu', this.state.isMenuOpen, '--active')}>
            <li className="media-actions__menu-item" onClick={this.handleEdit.bind(this)}><FormattedMessage id="task.edit" defaultMessage="Edit" /></li>
            <Can permissions={task.permissions} permission="destroy Task">
              <li className="media-actions__menu-item" onClick={this.handleDelete.bind(this)}><FormattedMessage id="task.delete" defaultMessage="Delete" /></li>
            </Can>
          </ul>
        </div>
      </Can>
    );

    const taskQuestion = (
      <div className="task__question">
        { task.description ? (
          <Tooltip
            placement="left"
            trigger={['click']}
            overlay={<span>{task.description}</span>}
            overlayClassName="task__description-tooltip"
          >
            <MdInfoOutline className="task__description-icon" title={task.description} />
          </Tooltip>
        ) : <em>{task.description}</em> }
        <span className="task__label">{task.label}</span>
      </div>
    );

    return (
      <div>
        <Card onClick={this.handleClick.bind(this)} className="task">
          <CardText className="task__card-text">
            <Message message={this.state.message} />
            {taskActions}
            {response === null ?
              <form onSubmit={this.handleSubmit.bind(this)} name={`task-response-${task.id}`}>
                {taskQuestion}
                {/* "response" */}
                {/*  TODO: Render appropriate response form based on task.type */}

                { task.type === 'single_choice' ? this.renderOptions() : <TextField
                  className="task__response-input"
                  onFocus={this.handleFocus.bind(this)}
                  name="response"
                  onKeyPress={this.handleKeyPress.bind(this)}
                  onChange={this.handleChange.bind(this)}
                  fullWidth
                  multiLine />
                }

                <div style={{ display: this.state.focus ? 'block' : 'none' }}>
                  <TextField
                    hintText={<FormattedMessage id="task.noteLabel" defaultMessage="Note any additional details here." />}
                    name="note"
                    onKeyPress={this.handleKeyPress.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    fullWidth
                    multiLine
                  />
                  <p className="task__resolver"><small><FormattedMessage id="task.pressReturnToSave" defaultMessage="Press return to save your response" /></small></p>
                </div>
              </form>
            : (this.state.editingResponse ?
              <div className="task__editing">
                <form onSubmit={this.handleSubmitUpdate.bind(this)} name={`edit-response-${task.first_response.id}`}>
                  {taskQuestion}
                  {/* "response" */}
                  { task.type === 'single_choice' ? this.renderOptions(response) : <TextField
                    className="task__response-input"
                    defaultValue={response}
                    name="editedresponse"
                    onKeyPress={this.handleKeyPressUpdate.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    fullWidth
                    multiLine
                  /> }
                  <TextField
                    hintText={<FormattedMessage id="task.noteLabel" defaultMessage="Note any additional details here." />}
                    defaultValue={note}
                    name="editednote"
                    onKeyPress={this.handleKeyPressUpdate.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    fullWidth
                    multiLine
                  />
                  <p className="task__resolver"><small><FormattedMessage id="task.pressReturnToSave" defaultMessage="Press return to save your response" /></small> <span id="task__cancel-button" onClick={this.handleCancelEditResponse.bind(this)}>✖</span></p>
                </form>
              </div>
            :
              <div className="task__resolved">
                {taskQuestion}
                { task.type === 'single_choice' ? this.renderOptions(response) : <p className="task__response">{response}</p> }
                <p style={{ display: note ? 'block' : 'none' }} className="task__note">{note}</p>
                <p className="task__resolver">
                  <small><FormattedMessage id="task.resolvedBy" defaultMessage={'Resolved by {by}'} values={{ by }} /></small>
                  <Can permissions={task.first_response.permissions} permission="update Dynamic">
                    <span id="task__edit-response-button" onClick={this.handleEditResponse.bind(this)}>✐</span>
                  </Can>
                </p>
              </div>
            )}
          </CardText>
        </Card>

        <Dialog actions={dialogActions} modal={false} open={!!this.state.editing} onRequestClose={this.handleCancelEdit.bind(this)}>
          <Message message={this.state.message} />
          <form name={`edit-task-${task.dbid}`}>
            <TextField
              name="label"
              floatingLabelText={<FormattedMessage id="tasks.taskLabel" defaultMessage="Task label" />}
              defaultValue={task.label}
              fullWidth
              multiLine
            />
            <TextField
              name="description"
              floatingLabelText={<FormattedMessage id="tasks.description" defaultMessage="Description" />}
              defaultValue={task.description}
              fullWidth
              multiLine
            />
          </form>
        </Dialog>
      </div>
    );
  }
}

Task.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Task);
