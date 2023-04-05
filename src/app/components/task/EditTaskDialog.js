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
  Info as InfoIcon,
  LocationOn as LocationIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  ShortText as ShortTextIcon,
  LinkOutlined as LinkOutlinedIcon,
} from '@material-ui/icons';
import { getTimeZones } from '@vvo/tzdb';
import EditTaskAlert from './EditTaskAlert';
import EditTaskOptions from './EditTaskOptions';
import Message from '../Message';
import NumberIcon from '../../icons/numbers.svg';
import { units, errorMain } from '../../styles/js/shared';

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

const styles = {
  select: {
    display: 'flex',
    alignItems: 'center',
  },
  autocomplete: {
    marginTop: units(2),
  },
  error: {
    color: errorMain,
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
      diff: null,
      submitDisabled: true,
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

  handleToggleShowInBrowserExtension = (e) => {
    this.setState({ showInBrowserExtension: e.target.checked });
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
    const { diff, hasCollectedAnswers, showWarning } = this.state;
    if (diff && hasCollectedAnswers && !showWarning) {
      this.setState({ showWarning: true });
    } else {
      this.submitTask();
    }
  };

  validateTask(label, options) {
    let valid = false;
    const hasLabel = Boolean(label?.trim());

    if (this.state.taskType) {
      if (['single_choice', 'multiple_choice'].includes(this.state.taskType)) {
        const noDuplicatedOptions =
          new Set(options.map(item => item.label.trim())).size === options.length;
        const hasAtLeastTwoOptions =
          options.filter(item => item.label.trim() !== '').length > 1;
        valid = hasLabel && noDuplicatedOptions && hasAtLeastTwoOptions;
      } else if (this.state.taskType === 'datetime') {
        valid = hasLabel && options.length > 0;
      } else {
        valid = hasLabel;
      }
    }

    this.setState({ submitDisabled: !valid });
  }

  submitTask() {
    const jsonoptions = this.state.options
      ? JSON.stringify(this.state.options
        .map(item => ({
          ...item,
          label: item.label.trim(),
          // oldLabel and tempId are for UI only. This avoids saving to db.
          oldLabel: undefined,
          tempId: undefined,
        }))
        .filter(item => item.label !== ''))
      : undefined;

    const task = {
      label: this.state.label,
      type: this.state.taskType,
      description: this.state.description,
      show_in_browser_extension: this.state.showInBrowserExtension,
      jsonoptions,
      diff: this.state.diff ? JSON.stringify(this.state.diff) : undefined,
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
        icon: <NumberIcon style={{ fontSize: '24px' }} />,
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

    const FieldTypeSelect = () => (
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
        <Box mt={1} mb={this.state.hasCollectedAnswers ? 1 : 2}>
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
    );

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
          { this.state.taskType === 'datetime' ?
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
          <EditTaskAlert
            showAlert={this.state.showWarning}
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
  message: PropTypes.node,
  onDismiss: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  task: PropTypes.object,
  taskType: PropTypes.string,
};

EditTaskDialog.defaultProps = {
  message: null,
  task: null,
  taskType: null,
};

export default injectIntl(withStyles(styles)(EditTaskDialog));
