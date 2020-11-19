import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import styled from 'styled-components';
import Attribution from './Attribution';
import Message from '../Message';
import ProjectSelector from '../project/ProjectSelector';
import timezones from '../../timezones';
import { units, StyledIconButton, caption, black54, Row, checkBlue } from '../../styles/js/shared';

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

const messages = defineMessages({
  value: {
    id: 'singleChoiceTask.value',
    defaultMessage: 'Value',
  },
  other: {
    id: 'singleChoiceTask.other',
    defaultMessage: 'Other',
  },
});

class EditTaskDialog extends React.Component {
  constructor(props) {
    super(props);

    const { task } = props;

    let defaultOptions = [{ label: '' }, { label: '' }];
    if (props.taskType === 'datetime') {
      defaultOptions = [];
    }

    this.state = {
      label: task ? task.label : null,
      description: task ? task.description : null,
      showInBrowserExtension: task ? task.show_in_browser_extension : true,
      options: task ? task.options : defaultOptions,
      project_ids: task ? task.project_ids : [],
      submitDisabled: true,
      showAssignmentField: false,
      editLabelOrDescription: false,
    };
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value, editLabelOrDescription: true });
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
      valid = !!(label && label.trim()) && options.filter(item => item.label.trim() !== '').length > 1;
    } else {
      valid = !!(label && label.trim());
    }

    this.setState({ submitDisabled: !valid });
  }

  handleLabelChange(e) {
    this.setState({ label: e.target.value, editLabelOrDescription: true });
    this.validateTask(e.target.value, this.state.options);
  }

  handleToogleShowInBrowserExtension(e) {
    this.setState({ showInBrowserExtension: e.target.checked });
    this.validateTask(this.state.label, this.state.options);
  }

  handleSelectProjects = (projectsIds) => {
    const project_ids = projectsIds.map(id => parseInt(id, 10));
    this.setState({ project_ids });
    this.validateTask(this.state.label, this.state.options);
  };

  handleSubmitTask() {
    const jsonoptions = this.state.options
      ? JSON.stringify(this.state.options
        .map(item => ({ ...item, label: item.label.trim() }))
        .filter(item => item.label !== ''))
      : undefined;

    const task = {
      label: this.state.label,
      description: this.state.description,
      show_in_browser_extension: this.state.showInBrowserExtension,
      jsonoptions,
      json_project_ids: JSON.stringify(this.state.project_ids),
      editLabelOrDescription: this.state.editLabelOrDescription,
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
      <Box mt={2}>
        {this.state.options.map((item, index) => (
          <div key={`create-task__add-options-radiobutton-${index.toString()}`}>
            <Row>
              <ChevronRightIcon />
              <Box clone py={0.5} px={1} width="75%">
                <TextField
                  key="create-task__add-option-input"
                  className="create-task__add-option-input"
                  id={index.toString()}
                  onChange={this.handleEditOption.bind(this)}
                  placeholder={`${formatMessage(messages.value)} ${index + 1}`}
                  value={item.label}
                  disabled={item.other}
                />
              </Box>
              {canRemove ?
                <StyledIconButton>
                  <CancelIcon
                    key="create-task__remove-option-button"
                    className="create-task__remove-option-button create-task__md-icon"
                    onClick={this.handleRemoveOption.bind(this, index)}
                  />
                </StyledIconButton>
                : null}
            </Row>
          </div>
        ))}
        <Box mt={1} >
          <Button onClick={this.handleAddValue.bind(this)}>
            <FormattedMessage id="singleChoiceTask.addValue" defaultMessage="Add Option" />
          </Button>
          <Button
            onClick={this.handleAddOther.bind(this)}
            disabled={this.state.hasOther}
          >
            <FormattedMessage id="singleChoiceTask.addOther" defaultMessage='Add "Other"' />
          </Button>
        </Box>
      </Box>
    );
  }

  render() {
    const isTask = this.props.fieldset === 'tasks';
    const dialogTitle = () => {
      if (this.props.task) {
        return isTask ? (
          <FormattedMessage id="editTaskDialog.editTask" defaultMessage="Edit task" />
        ) : (
          <FormattedMessage id="editTaskDialog.editMetadata" defaultMessage="Edit metadata field" />
        );
      }

      return isTask ? (
        <FormattedMessage id="editTaskDialog.newTask" defaultMessage="New task" />
      ) : (
        <FormattedMessage id="editTaskDialog.newMetadata" defaultMessage="New metadata field" />
      );
    };
    const handleHelp = () => {
      window.open('https://help.checkmedia.org/en/articles/4423863-using-the-check-browser-extension');
    };

    return (
      <Dialog
        className="create-task__dialog"
        open
        onClose={this.props.onDismiss}
        scroll="paper"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{dialogTitle()}</DialogTitle>
        <DialogContent>
          <Message message={this.props.message} />

          <TextField
            id="task-label-input"
            className="tasks__task-label-input"
            label={<FormattedMessage id="tasks.taskPrompt" defaultMessage="Prompt" />}
            defaultValue={this.state.label}
            onChange={this.handleLabelChange.bind(this)}
            margin="normal"
            variant="outlined"
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
            variant="outlined"
            multiline
            fullWidth
          />
          <p />
          { this.props.isTeamTask && this.props.taskType === 'datetime' ?
            <Autocomplete
              multiple
              options={Object.values(timezones)}
              getOptionLabel={option => option.label}
              defaultValue={this.state.options}
              filterSelectedOptions
              onChange={(event, newValue) => {
                this.setState({ options: newValue });
                this.validateTask(this.state.label, newValue);
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={
                    <FormattedMessage
                      id="tasks.timezones"
                      defaultMessage="Timezones available to complete the task"
                    />
                  }
                />
              )}
            /> : null }
          <p />
          { this.props.isTeamTask ?
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.showInBrowserExtension}
                  onChange={this.handleToogleShowInBrowserExtension.bind(this)}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <FormattedMessage
                    id="tasks.showInBrowserExtension"
                    defaultMessage="Show in browser extension"
                  />
                  <IconButton onClick={handleHelp}>
                    <Box clone color={checkBlue}>
                      <HelpIcon />
                    </Box>
                  </IconButton>
                </Box>
              }
            /> : null }
          <p />
          { this.props.projects && isTask ?
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
