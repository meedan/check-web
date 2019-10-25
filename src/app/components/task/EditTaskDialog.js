import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MdCancel from 'react-icons/lib/md/cancel';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import styled from 'styled-components';
import Attribution from './Attribution';
import ConfirmRequired from './ConfirmRequired';
import Message from '../Message';
import ProjectSelector from '../project/ProjectSelector';
import { getStatus } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { units, StyledIconButton, caption, black54, Row } from '../../styles/js/shared';

const StyledProjectsArea = styled.div`
  margin-top: ${units(2)};
`;

const StyledTaskAssignment = styled.div`
  margin-top ${units(2)};

  .create-task__add-task-description-label, .create-task__add-assignment-button {
    bottom: ${units(2)};
    font: ${caption};
    padding: 0 ${units(1)};
    color: ${black54};
    cursor: pointer;
  }

  .create-task__add-assignment-button {
    border: 0;
    background: transparent;
  }
`;

const HelperText = styled.div`
  font: ${caption};
`;

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
  editTask: {
    id: 'singleChoiceTask.editTask',
    defaultMessage: 'Edit task',
  },
});

class EditTaskDialog extends React.Component {
  constructor(props) {
    super(props);

    const { task } = props;

    this.state = {
      label: task ? task.label : null,
      description: task ? task.description : null,
      options: task ? task.options : [{ label: '' }, { label: '' }],
      project_ids: task ? task.project_ids : [],
      submitDisabled: true,
      showAssignmentField: false,
      required: task ? task.required : false,
      status: task ? task.status : 'unresolved',
      resolvable: task && task.responses && task.responses.edges.length > 0,
      confirmRequired: false,
      jsonschema: task ? task.json_schema : null,
    };
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
    this.validateTask(this.state.label, this.state.options);
  }

  handleAddValue() {
    const options = Array.isArray(this.state.options) ? this.state.options.slice(0) : [];
    if (this.state.hasOther) {
      options.splice(-1, 0, { label: '' });
    } else {
      options.push({ label: '' });
    }
    this.setState({ options });

    this.validateTask(this.state.label, options);
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

    this.validateTask(this.state.label, options);
  }

  handleEditOption(e) {
    const options = this.state.options.slice(0);
    options[parseInt(e.target.id, 10)].label = e.target.value;
    this.setState({ options });

    this.validateTask(this.state.label, options);
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

    this.validateTask(this.state.label, options);
  }

  validateTask(label, options) {
    let valid = false;

    if (this.props.taskType === 'single_choice' ||
        this.props.taskType === 'multiple_choice') {
      valid = !!(label && label.trim()) && options.filter(item => item.label !== '').length > 1;
    } else {
      valid = !!(label && label.trim());
    }

    this.setState({ submitDisabled: !valid });
  }

  handleLabelChange(e) {
    this.setState({ label: e.target.value });
    this.validateTask(e.target.value, this.state.options);
  }

  handleJsonSchemaChange(e) {
    this.setState({ jsonschema: e.target.value });
    this.validateTask(this.state.label, this.state.options);
  }

  handleSelectRequired(e, inputChecked) {
    const { media } = this.props;

    if (media) {
      const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

      if (inputChecked && status.completed && !media.last_status_obj.locked) {
        this.setState({ required: inputChecked, confirmRequired: true, status });
        return;
      }
    }

    this.setState({ required: inputChecked });
    this.validateTask(this.state.label, this.state.options);
  }

  handleSelectResolved(e, inputChecked) {
    if (this.state.resolvable && inputChecked) {
      this.setState({ status: 'resolved' });
    } else if (!inputChecked) {
      this.setState({ status: 'unresolved' });
    }
    this.validateTask(this.state.label, this.state.options);
  }

  handleSelectProjects = (projectsIds) => {
    const project_ids = projectsIds.map(id => parseInt(id, 10));
    this.setState({ project_ids });
    this.validateTask(this.state.label, this.state.options);
  };

  handleSubmitTask() {
    const jsonoptions = this.state.options
      ? JSON.stringify(this.state.options.filter(item => item.label !== ''))
      : undefined;

    const task = {
      label: this.state.label,
      description: this.state.description,
      required: this.state.required,
      status: this.state.status,
      jsonoptions,
      json_project_ids: JSON.stringify(this.state.project_ids),
      jsonschema: this.state.jsonschema,
    };

    if (!this.state.submitDisabled) {
      this.props.onSubmit(task);
      this.setState({ submitDisabled: true });
    }
  }

  toggleAssignmentField() {
    this.setState({ showAssignmentField: !this.state.showAssignmentField });
  }

  renderOptions() {
    if (this.props.noOptions) {
      return null;
    }

    if (this.props.taskType !== 'single_choice' &&
        this.props.taskType !== 'multiple_choice') {
      return null;
    }

    const { formatMessage } = this.props.intl;

    const canRemove = this.state.options.length > 2;

    return (
      <div style={{ marginTop: units(2) }}>
        {this.state.options.map((item, index) => (
          <div key={`create-task__add-options-radiobutton-${index.toString()}`}>
            <Row>
              <ChevronRightIcon />
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
              {canRemove ?
                <StyledIconButton>
                  <MdCancel
                    key="create-task__remove-option-button"
                    className="create-task__remove-option-button create-task__md-icon"
                    onClick={this.handleRemoveOption.bind(this, index)}
                  />
                </StyledIconButton>
                : null}
            </Row>
          </div>
        ))}
        <div style={{ marginTop: units(1) }}>
          <Button onClick={this.handleAddValue.bind(this)}>
            {this.props.intl.formatMessage(messages.addValue)}
          </Button>
          <Button
            onClick={this.handleAddOther.bind(this)}
            disabled={this.state.hasOther}
          >
            {this.props.intl.formatMessage(messages.addOther)}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const dialogTitle = this.props.task ? messages.editTask : messages.newTask;

    return (
      <Dialog
        className="create-task__dialog"
        open
        onClose={this.props.onDismiss}
        scroll="paper"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{this.props.intl.formatMessage(dialogTitle)}</DialogTitle>
        <DialogContent>
          <Message message={this.props.message} />

          <TextField
            id="task-label-input"
            className="tasks__task-label-input"
            label={<FormattedMessage id="tasks.taskPrompt" defaultMessage="Prompt" />}
            defaultValue={this.state.label}
            onChange={this.handleLabelChange.bind(this)}
            margin="normal"
            multiline
            fullWidth
          />
          <TextField
            id="task-description-input"
            className="create-task__task-description-input"
            label={
              <FormattedMessage id="tasks.description" defaultMessage="Description (optional)" />
            }
            defaultValue={this.state.description}
            onChange={this.handleDescriptionChange.bind(this)}
            margin="normal"
            multiline
            fullWidth
          />
          <FormattedMessage
            id="tasks.requiredCheckbox"
            defaultMessage="Required"
          />
          <Switch
            id="edit-task__required-switch"
            checked={Boolean(this.state.required)}
            onChange={this.handleSelectRequired.bind(this)}
            value="required"
            color="primary"
          />
          <HelperText>
            <FormattedMessage
              id="tasks.requiredHelper"
              defaultMessage="Items cannot be marked as completed while any of their required tasks remains unresolved"
            />
          </HelperText>
          <p />
          <FormattedMessage
            id="tasks.resolvedCheckbox"
            defaultMessage="Resolved"
          />
          <Switch
            id="edit-task__resolved-switch"
            checked={this.state.status === 'resolved'}
            disabled={!this.state.resolvable}
            onChange={this.handleSelectResolved.bind(this)}
            value="resolved"
            color="primary"
          />
          <HelperText>
            <FormattedMessage
              id="tasks.resolvedHelper"
              defaultMessage="The task can only be resolved if it has been answered"
            />
          </HelperText>
          { this.props.projects ?
            <StyledProjectsArea>
              <FormattedMessage id="tasks.showInProj" defaultMessage="Show tasks in" />
              <ProjectSelector
                projects={this.props.projects}
                selected={this.state.project_ids.map(id => `${id}`)}
                onSelect={this.handleSelectProjects}
              />
            </StyledProjectsArea>
            : null
          }
          <ConfirmRequired
            open={this.state.confirmRequired}
            status={this.state.status}
            handleCancel={() => { this.setState({ required: false, confirmRequired: false }); }}
            handleConfirm={() => { this.setState({ confirmRequired: false }); }}
          />

          {this.renderOptions()}

          <StyledTaskAssignment>
            { this.state.showAssignmentField ?
              <Attribution
                multi
                selectedUsers={[]}
                id="new"
                taskType={this.props.taskType}
              /> : null }
            { this.props.allowAssignment ?
              <button
                className="create-task__add-assignment-button"
                onClick={this.toggleAssignmentField.bind(this)}
              >
                +{' '}
                <FormattedMessage id="tasks.assign" defaultMessage="Assign" />
              </button> : null
            }
          </StyledTaskAssignment>
          { this.props.taskType === 'free_text' ?
            <TextField
              id="task-jsonschema-input"
              className="tasks__task-jsonschema-input"
              label={<FormattedMessage id="tasks.taskJsonSchema" defaultMessage="JSON Schema (optional / advanced)" />}
              defaultValue={this.state.jsonschema}
              onChange={this.handleJsonSchemaChange.bind(this)}
              margin="normal"
              multiline
              fullWidth
            /> : null }
        </DialogContent>
        <DialogActions>
          <Button
            className="create-task__dialog-cancel-button"
            onClick={this.props.onDismiss}
          >
            <FormattedMessage id="tasks.cancelAdd" defaultMessage="Cancel" />
          </Button>
          <Button
            className="create-task__dialog-submit-button"
            onClick={this.handleSubmitTask.bind(this)}
            color="primary"
            disabled={this.state.submitDisabled}
          >
            <FormattedMessage id="tasks.add" defaultMessage="Save" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default injectIntl(EditTaskDialog);
