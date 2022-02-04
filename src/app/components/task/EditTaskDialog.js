import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemIcon,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  Add as AddIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon,
  DateRange as DateRangeIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ShortText as ShortTextIcon,
  LinkOutlined as LinkOutlinedIcon,
} from '@material-ui/icons';
import { getTimeZones } from '@vvo/tzdb';
import styled from 'styled-components';
import Attribution from './Attribution';
import Message from '../Message';
import ProjectSelector from '../project/ProjectSelector';
import NumberIcon from '../../icons/NumberIcon';
import {
  units,
  caption,
  black54,
  Row,
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
      options: task ? task.options : [{ label: '' }, { label: '' }],
      project_ids: task ? task.project_ids : [],
      submitDisabled: true,
      showAssignmentField: false,
      labelOrDescriptionChanged: false,
      hasOther: task ? task.options?.some(option => option.other) : false,
      hasCollectedAnswers: task && task.tasks_with_answers_count > 0,
      restrictTimezones: task?.type === 'datetime' && Array.isArray(task.options) && task.options[0]?.restrictTimezones,
      alwaysShowTime: task?.type === 'datetime' && Array.isArray(task.options) && task.options[0]?.alwaysShowTime,
    };
  }

  handleDescriptionChange(e) {
    this.setState({ description: e.target.value, labelOrDescriptionChanged: true });
    this.validateTask(this.state.label, this.state.options);
  }

  handleAddValue() {
    const options = Array.isArray(this.state.options) ? [...this.state.options] : [];
    if (this.state.hasOther) {
      options.splice(-1, 0, { label: '' });
    } else {
      options.push({ label: '' });
    }
    this.setState({ options });

    this.validateTask(this.state.label, options);
  }

  handleAddOther() {
    const options = Array.isArray(this.state.options) ? [...this.state.options] : [];
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
    const options = [...this.state.options];
    options.splice(parseInt(e.target.id, 10), 1, { label: e.target.value });
    this.setState({ options });

    this.validateTask(this.state.label, options);
  }

  handleRemoveOption(index) {
    const options = [...this.state.options];
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

  handleLabelChange(e) {
    this.setState({ label: e.target.value, labelOrDescriptionChanged: true });
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

  handleSelectType = (e) => {
    const taskType = e.target.value;
    const { task } = this.props;
    let options = task ? task.options : [{ label: '' }, { label: '' }];
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
      this.handleSubmitTask();
    }
  };

  handleSubmitTask() {
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
      labelOrDescriptionChanged: this.state.labelOrDescriptionChanged,
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

    if (this.state.taskType !== 'single_choice' &&
        this.state.taskType !== 'multiple_choice') {
      return null;
    }

    const { formatMessage } = this.props.intl;
    const canRemove = this.state.options.length > 2;

    return (
      <React.Fragment>
        <Divider />
        <Box mt={1}>
          {this.state.options.map((item, index) => (
            <div key={`create-task__add-options-radiobutton-${index.toString()}`}>
              <Row>
                { this.state.taskType === 'single_choice' ? <RadioButtonUncheckedIcon /> : null}
                { this.state.taskType === 'multiple_choice' ? <CheckBoxOutlineBlankIcon /> : null}
                <Box clone py={0.5} px={1} width="75%">
                  <TextField
                    key="create-task__add-option-input"
                    className="create-task__add-option-input"
                    id={index.toString()}
                    onChange={this.handleEditOption.bind(this)}
                    placeholder={`${formatMessage(messages.value)} ${index + 1}`}
                    value={item.label}
                    disabled={item.other}
                    variant="outlined"
                    margin="dense"
                  />
                </Box>
                {canRemove ?
                  <IconButton>
                    <ClearIcon
                      key="create-task__remove-option-button"
                      className="create-task__remove-option-button create-task__md-icon"
                      onClick={this.handleRemoveOption.bind(this, index)}
                    />
                  </IconButton>
                  : null}
              </Row>
            </div>
          ))}
          <Box mt={1} display="flex">
            <Button
              onClick={this.handleAddValue.bind(this)}
              startIcon={<AddIcon />}
              variant="contained"
            >
              <FormattedMessage id="singleChoiceTask.addValue" defaultMessage="Add Option" />
            </Button>
            <Box ml={1}>
              <Button
                onClick={this.handleAddOther.bind(this)}
                startIcon={<AddIcon />}
                variant="contained"
                disabled={this.state.hasOther}
              >
                <FormattedMessage id="singleChoiceTask.addOther" defaultMessage='Add "Other"' />
              </Button>
            </Box>
          </Box>
        </Box>
      </React.Fragment>
    );
  }

  render() {
    const isTask = this.props.fieldset === 'tasks';
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
              <MenuItem value={t.value} className={`edit-task-dialog__menu-item-${t.value}`}>
                <ListItemIcon>{t.icon}</ListItemIcon>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box mt={1} mb={1}>
          { types.find(t => t.value === this.state.taskType)?.description }
        </Box>
        { this.state.hasCollectedAnswers ?
          <Box mb={2} display="flex" alignItems="center">
            <Box mr={1}><InfoIcon /></Box>
            <FormattedMessage
              id="tasks.cantChangeTypeMessage"
              defaultMessage="The field type cannot be changed because answers have already been filled"
              description="Message when team task has answers and type cannot be updated"
            />
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
        scroll="paper"
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
          <FieldTypeSelect />
          { this.props.projects && isTask ?
            <React.Fragment>
              <Divider />
              <Box my={2}>
                <FormattedMessage id="tasks.showInProj" defaultMessage="Show tasks in" />
                <ProjectSelector
                  projects={this.props.projects}
                  selected={this.state.project_ids.map(id => `${id}`)}
                  onSelect={this.handleSelectProjects}
                />
              </Box>
            </React.Fragment>
            : null
          }
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

          {this.renderOptions()}

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
                onClick={this.toggleAssignmentField.bind(this)}
              >
                +{' '}
                <FormattedMessage id="tasks.assign" defaultMessage="Assign" />
              </button> : null
            }
          </StyledTaskAssignment>
          { this.state.hasCollectedAnswers && this.state.showWarning ?
            <Alert severity="warning">
              <AlertTitle>
                <FormattedMessage
                  id="tasks.editFieldWithAnswersTitle"
                  defaultMessage="Updating field with existing responses"
                  description="Title of warning when user tries to edit an annotation field that already has colledted responses"
                />
              </AlertTitle>
              <FormattedMessage
                id="tasks.editFieldWithAnswersBody1"
                defaultMessage="{number, plural, one {You are updating a field that has already collected # response.} other {You are updating a field that has already collected # responses.}}"
                description="Body of warning when user tries to edit an annotation field that already has colledted responses"
                values={{ number: this.props.task.tasks_with_answers_count }}
              /> {' '}
              <FormattedMessage
                id="tasks.editFieldWithAnswersBody2"
                defaultMessage="This change will show on these responses, and may not make sense with the updated field. Select \u0022Save\u0022 if you understand and want to continue."
                description="Body of warning when user tries to edit an annotation field that already has colledted responses"
              />
            </Alert>
            : null }
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
            onClick={this.handleSave}
            variant="contained"
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

EditTaskDialog.propTypes = {
  allowAssignment: PropTypes.bool,
  fieldset: PropTypes.string.isRequired,
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
