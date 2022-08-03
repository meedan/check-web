import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CloudUpload as CloudUploadIcon,
  DateRange as DateRangeIcon,
  LocationOn as LocationIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  ShortText as ShortTextIcon,
  LinkOutlined as LinkOutlinedIcon,
} from '@material-ui/icons';
import { getTimeZones } from '@vvo/tzdb';
import styled from 'styled-components';
import Attribution from './Attribution';
import EditTaskAlert from './EditTaskAlert';
import EditTaskOptions from './EditTaskOptions';
import Message from '../Message';
import NumberIcon from '../../icons/NumberIcon';
import {
  units,
  caption,
  black54,
  alertRed,
} from '../../styles/js/shared';

const timezones = getTimeZones({ includeUtc: true }).map((option) => {
  const offset = option.currentTimeOffsetInMinutes / 60;
  const sign = offset < 0 ? '' : '+';
  const newOption = {
    code: option.name,
    label: `${option.name} (GMT${sign}${offset})`,
    offset,
  };
  return newOption;
});

const StyledTaskAssignment = styled.div`
  margin-top ${units(2)};

  .create-task__add-assignment-button {
    bottom: ${units(2)};
    font: ${caption};
    padding: 0 ${units(1)};
    color: ${black54};
    cursor: pointer;
    border: 0;
    background: transparent;
  }
`;

const StyledTaskCantUpdateType = styled.div`
  color: ${alertRed};
`;

const styles = {
  select: {
    display: 'flex',
    alignItems: 'center',
  },
  autocomplete: {
    marginTop: units(2),
  },
  error: {
    color: '#ff0000',
  },
};

class EditTaskDialog extends React.Component {
  constructor(props) {
    super(props);
    const { task } = props;

    this.state = {
      label: task ? task.label : null,
      taskType: task ? task.type : (props.taskType || null),
      description: task ? task.description : null,
      showInBrowserExtension: task ? task.show_in_browser_extension : true,
      options: task ? task.options : [{ label: '', new: true }, { label: '', new: true }],
      diff: {},
      project_ids: task ? task.project_ids : [],
      submitDisabled: true,
      showAssignmentField: false,
      showWarning: false,
      hasCollectedAnswers: task && task.tasks_with_answers_count > 0,
      restrictTimezones: task?.type === 'datetime' && Array.isArray(task.options) && task.options[0]?.restrictTimezones,
      alwaysShowTime: task?.type === 'datetime' && Array.isArray(task.options) && task.options[0]?.alwaysShowTime,
    };
  }

  handleLabelChange = (e) => {
    this.setState({
      label: e.target.value,
      showWarning: false,
    });
    this.validateTask(e.target.value, this.state.options);
  };

  handleDescriptionChange = (e) => {
    this.setState({
      description: e.target.value,
      showWarning: false,
    });
    this.validateTask(this.state.label, this.state.options);
  };

  handleOptionsChange = (options, diff) => {
    if (diff) {
      this.setState({ options, diff });
    } else {
      this.setState({ options });
    }
    this.setState({ showWarning: false });
    this.validateTask(this.state.label, options);
  };

  handleToggleAssignmentField = () => {
    this.setState({ showAssignmentField: !this.state.showAssignmentField });
  };

  handleToggleShowInBrowserExtension = (e) => {
    this.setState({ showInBrowserExtension: e.target.checked });
    this.validateTask(this.state.label, this.state.options);
  };

  handleSelectType = (e) => {
    const taskType = e.target.value;
    const { task } = this.props;
    let options = task ? task.options : [{ label: '', new: true }, { label: '', new: true }];
    if (taskType === 'datetime') {
      options = [{
        code: 'UTC',
        label: 'UTC (GMT +0)',
        offset: 0,
      }];
    }
    this.setState(
      { taskType, options },
      () => this.validateTask(this.state.label, this.state.options),
    );
  };

  handleSave = () => {
    const { hasCollectedAnswers, showWarning } = this.state;
    if (hasCollectedAnswers && !showWarning) {
      this.setState({ showWarning: true });
    } else {
      this.submitTask();
    }
  };

  validateTask(label, options) {
    let valid = false;

    if (this.state.taskType) {
      if (this.state.taskType === 'single_choice' ||
          this.state.taskType === 'multiple_choice') {
        valid = !!(label && label.trim()) && options.filter(item => item.label.trim() !== '').length > 1;
      } else if (this.state.taskType === 'datetime') {
        valid = !!(label && label.trim()) && options.length > 0;
      } else {
        valid = !!(label && label.trim());
      }
    }

    this.setState({ submitDisabled: !valid });
  }

  submitTask() {
    const jsonoptions = this.state.options
      ? JSON.stringify(this.state.options
        .map(item => ({ ...item, label: item.label.trim() }))
        .filter(item => item.label !== ''))
      : undefined;

    const task = {
      label: this.state.label,
      type: this.state.taskType,
      description: this.state.description,
      show_in_browser_extension: this.state.showInBrowserExtension,
      jsonoptions,
      json_project_ids: JSON.stringify(this.state.project_ids),
    };

    if (!this.state.submitDisabled) {
      this.props.onSubmit(task);
      this.setState({ submitDisabled: true });
    }
  }

  render() {
    const { classes } = this.props;

    const types = [
      {
        label: (
          <FormattedMessage
            id="tasks.textType"
            defaultMessage="Text"
            description="Label for text type field"
          />
        ),
        value: 'free_text',
        icon: <ShortTextIcon />,
        description: (
          <FormattedMessage
            id="tasks.shortTextDescription"
            defaultMessage="Allows you to enter text"
            description="Description for text type field"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            id="tasks.numberType"
            defaultMessage="Number"
            description="Label for number type field"
          />
        ),
        value: 'number',
        icon: <NumberIcon />,
        description: (
          <FormattedMessage
            id="tasks.numberDescription"
            defaultMessage="Allows you to enter a number"
            description="Description for number type field"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            id="tasks.locationType"
            defaultMessage="Location"
            description="Label for location type field"
          />
        ),
        value: 'geolocation',
        icon: <LocationIcon />,
        description: (
          <FormattedMessage
            id="tasks.locationDescription"
            defaultMessage="Allows you to add coordinates of a place, or search a place by name"
            description="Description for location type field"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            id="tasks.dateTimeType"
            defaultMessage="Date"
            description="Label for date type field"
          />
        ),
        value: 'datetime',
        icon: <DateRangeIcon />,
        description: (
          <FormattedMessage
            id="tasks.datetimeDescription"
            defaultMessage="Allows you to pick a date from the calendar"
            description="Description for date type field"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            id="tasks.singleChoiceType"
            defaultMessage="Single select"
            description="Label for single selection type field"
          />
        ),
        value: 'single_choice',
        icon: <RadioButtonCheckedIcon />,
        description: (
          <FormattedMessage
            id="tasks.singleChoiceDescription"
            defaultMessage="Allows you to select a single option from predefined options in a list"
            description="Description for single selection type field"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            id="tasks.multipleChoiceType"
            defaultMessage="Multiple select"
            description="Label for multiple selection type field"
          />
        ),
        value: 'multiple_choice',
        icon: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
        description: (
          <FormattedMessage
            id="tasks.multipleChoiceDescription"
            defaultMessage="Allows you to select one or more predefined options"
            description="Description for multiple selection type field"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            id="tasks.fileUploadType"
            defaultMessage="File upload"
            description="Label for file upload type field"
          />
        ),
        value: 'file_upload',
        icon: <CloudUploadIcon />,
        description: (
          <FormattedMessage
            id="tasks.fileUploadDescription"
            defaultMessage="Allows you to upload a file"
            description="Description for file upload type field"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            id="tasks.UrlType"
            defaultMessage="URL"
            description="Label for the URL type field"
          />
        ),
        value: 'url',
        icon: <LinkOutlinedIcon />,
        description: (
          <FormattedMessage
            id="tasks.UrlDescription"
            defaultMessage="Must be a valid URL"
            description="Hint text about what kind of text a user can put in the URL box"
          />
        ),
      },
    ];

    const FieldTypeSelect = () => this.props.isTeamTask ? (
      <React.Fragment>
        <FormControl variant="outlined" margin="normal" fullWidth id="edit-task-dialog__type-select">
          <InputLabel id="edit-task-dialog__type-select-label">
            <FormattedMessage
              id="tasks.chooseType"
              defaultMessage="Choose a field type"
              description="Label for field type selection box"
            />
          </InputLabel>
          <Select
            classes={{ root: classes.select }}
            onChange={this.handleSelectType}
            labelId="edit-task-dialog__type-select-label"
            value={this.state.taskType}
            disabled={this.state.hasCollectedAnswers}
            label={
              <FormattedMessage
                id="tasks.chooseType"
                defaultMessage="Choose a field type"
                description="Label for field type selection box"
              />
            }
          >
            {types.map(t => (
              <MenuItem
                key={t.value}
                value={t.value}
                className={`edit-task-dialog__menu-item-${t.value}`}
              >
                <ListItemIcon>{t.icon}</ListItemIcon>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box mt={1} mb={2}>
          { types.find(t => t.value === this.state.taskType)?.description }
        </Box>
        { this.state.hasCollectedAnswers ?
          <Box mt={1} mb={2}>
            <StyledTaskCantUpdateType>
              <FormattedMessage
                id="tasks.cantChangeTypeMessage"
                defaultMessage="The field type cannot be changed because answers have already been filled"
                description="Message when team task has answers and type cannot be updated"
              />
            </StyledTaskCantUpdateType>
          </Box>
          : null
        }
      </React.Fragment>
    ) : null;

    return (
      <Dialog
        className="create-task__dialog"
        open
        onClose={this.props.onDismiss}
        scroll="body"
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Message message={this.props.message} />
          <TextField
            id="task-label-input"
            className="tasks__task-label-input"
            label={
              <FormattedMessage
                id="tasks.taskPrompt"
                defaultMessage="Title"
                description="Title field for custom annotation field"
              />
            }
            defaultValue={this.state.label}
            onChange={this.handleLabelChange}
            margin="normal"
            variant="outlined"
            multiline
            fullWidth
          />
          <TextField
            id="task-description-input"
            className="create-task__task-description-input"
            label={
              <FormattedMessage
                id="tasks.description"
                defaultMessage="Description (optional)"
                description="Description field for custom annotation field"
              />
            }
            defaultValue={this.state.description}
            onChange={this.handleDescriptionChange}
            margin="normal"
            variant="outlined"
            multiline
            fullWidth
          />
          <FieldTypeSelect />
          { this.props.isTeamTask && this.state.taskType === 'datetime' ?
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="checkedB"
                    color="primary"
                    checked={this.state.alwaysShowTime}
                    onChange={() => {
                      const alwaysShowTime = !this.state.alwaysShowTime;
                      const options = Array.from(this.state.options).map((option) => {
                        const newOption = Object.assign({}, option);
                        newOption.alwaysShowTime = alwaysShowTime;
                        return newOption;
                      });
                      this.setState({
                        options,
                        alwaysShowTime,
                      });
                    }}
                  />
                }
                label={this.props.intl.formatMessage({
                  id: 'tasks.alwaysShowTime',
                  defaultMessage: 'Always show time field',
                  description: 'A label next to a check box. If the box is checked, the form element being created will always show the time (in addition to the date).',
                })}
              />
              <br />
              <FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="checkedB"
                      color="primary"
                      checked={this.state.restrictTimezones}
                      onChange={() => {
                        const restrictTimezones = !this.state.restrictTimezones;
                        const options = Array.from(this.state.options).map((option) => {
                          const newOption = Object.assign({}, option);
                          newOption.restrictTimezones = restrictTimezones;
                          newOption.alwaysShowTime = this.state.alwaysShowTime;
                          return newOption;
                        });
                        this.setState({
                          restrictTimezones,
                          options,
                        });
                      }}
                    />
                  }
                  label={this.props.intl.formatMessage({
                    id: 'tasks.restrictTimezones',
                    defaultMessage: 'Restrict timezones',
                    description: 'A label next to a check box. If the box is checked, the user will be only be allowed to use certain time zones when they fill out this form.',
                  })}
                />
                <FormHelperText>Allow users to select from specific timezones.</FormHelperText>
              </FormControl>
              {
                this.state.restrictTimezones ? (
                  <Autocomplete
                    classes={{ root: classes.autocomplete }}
                    multiple
                    options={timezones}
                    getOptionLabel={option => option.label}
                    defaultValue={this.state.options}
                    filterSelectedOptions
                    onChange={(event, newValue) => {
                      const { restrictTimezones } = this.state;
                      const options = Array.from(newValue).map((option) => {
                        const newOption = Object.assign({}, option);
                        newOption.restrictTimezones = restrictTimezones;
                        newOption.alwaysShowTime = this.state.alwaysShowTime;
                        return newOption;
                      });
                      this.setState({ options });
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
                            description="Label of timezones list available to the task"
                          />
                        }
                      />
                    )}
                  />
                ) : null
              }
              {
                this.state.restrictTimezones && this.state.options.length === 0 ? (
                  <FormHelperText classes={{ root: classes.error }}>Please include at least one timezone.</FormHelperText>
                ) : null
              }
            </Box>
            : null
          }
          <EditTaskOptions
            task={this.props.task}
            taskType={this.state.taskType}
            onChange={this.handleOptionsChange}
          />
          <StyledTaskAssignment>
            { this.state.showAssignmentField ?
              <Attribution
                multi
                selectedUsers={[]}
                id="new"
                taskType={this.state.taskType}
              /> : null }
            { this.props.allowAssignment ?
              <button
                className="create-task__add-assignment-button"
                onClick={this.handleToggleAssignmentField}
              >
                +{' '}
                <FormattedMessage
                  id="tasks.assign"
                  defaultMessage="Assign"
                  description="Label to assign task button"
                />
              </button> : null
            }
          </StyledTaskAssignment>
          <EditTaskAlert
            showAlert={this.state.hasCollectedAnswers && this.state.showWarning}
            task={this.props.task}
            diff={this.state.diff}
          />
        </DialogContent>
        <DialogActions>
          <Button
            className="create-task__dialog-cancel-button"
            onClick={this.props.onDismiss}
          >
            <FormattedMessage
              id="tasks.cancelAdd"
              defaultMessage="Cancel"
              description="Cancel action button label"
            />
          </Button>
          <Button
            className="create-task__dialog-submit-button"
            onClick={this.handleSave}
            variant="contained"
            color="primary"
            disabled={this.state.submitDisabled}
          >
            { this.state.showWarning ? (
              <FormattedMessage
                id="tasks.saveButtonWarning"
                defaultMessage="I understand, save changes"
                description="Save action button label warning"
              />
            ) : (
              <FormattedMessage
                id="tasks.add"
                defaultMessage="Save"
                description="Save action button label"
              />
            )}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// TODO review propTypes
EditTaskDialog.propTypes = {
  allowAssignment: PropTypes.bool,
  isTeamTask: PropTypes.bool,
  message: PropTypes.node,
  noOptions: PropTypes.bool,
  onDismiss: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  projects: PropTypes.array,
  task: PropTypes.object,
  taskType: PropTypes.string,
};

EditTaskDialog.defaultProps = {
  allowAssignment: false,
  isTeamTask: false,
  message: null,
  noOptions: false,
  projects: null,
  task: null,
  taskType: null,
};

export default injectIntl(withStyles(styles)(EditTaskDialog));
