/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Box,
  Checkbox,
  Dialog,
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
import { getTimeZones } from '@vvo/tzdb';
import cx from 'classnames/bind';
import EditTaskAlert from './EditTaskAlert';
import EditTaskOptions from './EditTaskOptions';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField2 from '../cds/inputs/TextField';
import Alert from '../cds/alerts-and-prompts/Alert';
import CheckBoxIcon from '../../icons/check_box.svg';
import CloudUploadIcon from '../../icons/file_upload.svg';
import DateRangeIcon from '../../icons/calendar_month.svg';
import NumberIcon from '../../icons/numbers.svg';
import LinkOutlinedIcon from '../../icons/link.svg';
import LocationIcon from '../../icons/location.svg';
import RadioButtonCheckedIcon from '../../icons/radio_button_checked.svg';
import ShortTextIcon from '../../icons/notes.svg';
import dialogStyles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

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
    marginTop: '16px',
  },
  error: {
    color: 'var(--color-pink-53)',
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
            defaultMessage="Text"
            description="Label for text type field"
            id="tasks.textType"
          />
        ),
        value: 'free_text',
        icon: <ShortTextIcon />,
        description: (
          <FormattedMessage
            defaultMessage="Allows you to enter text"
            description="Description for text type field"
            id="tasks.shortTextDescription"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            defaultMessage="Number"
            description="Label for number type field"
            id="tasks.numberType"
          />
        ),
        value: 'number',
        icon: <NumberIcon style={{ fontSize: '24px' }} />,
        description: (
          <FormattedMessage
            defaultMessage="Allows you to enter a number"
            description="Description for number type field"
            id="tasks.numberDescription"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            defaultMessage="Location"
            description="Label for location type field"
            id="tasks.locationType"
          />
        ),
        value: 'geolocation',
        icon: <LocationIcon />,
        description: (
          <FormattedMessage
            defaultMessage="Allows you to add coordinates of a place, or search a place by name"
            description="Description for location type field"
            id="tasks.locationDescription"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            defaultMessage="Date"
            description="Label for date type field"
            id="tasks.dateTimeType"
          />
        ),
        value: 'datetime',
        icon: <DateRangeIcon />,
        description: (
          <FormattedMessage
            defaultMessage="Allows you to pick a date from the calendar"
            description="Description for date type field"
            id="tasks.datetimeDescription"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            defaultMessage="Single select"
            description="Label for single selection type field"
            id="tasks.singleChoiceType"
          />
        ),
        value: 'single_choice',
        icon: <RadioButtonCheckedIcon />,
        description: (
          <FormattedMessage
            defaultMessage="Allows you to select a single option from predefined options in a list"
            description="Description for single selection type field"
            id="tasks.singleChoiceDescription"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            defaultMessage="Multiple select"
            description="Label for multiple selection type field"
            id="tasks.multipleChoiceType"
          />
        ),
        value: 'multiple_choice',
        icon: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
        description: (
          <FormattedMessage
            defaultMessage="Allows you to select one or more predefined options"
            description="Description for multiple selection type field"
            id="tasks.multipleChoiceDescription"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            defaultMessage="File upload"
            description="Label for file upload type field"
            id="tasks.fileUploadType"
          />
        ),
        value: 'file_upload',
        icon: <CloudUploadIcon />,
        description: (
          <FormattedMessage
            defaultMessage="Allows you to upload a file"
            description="Description for file upload type field"
            id="tasks.fileUploadDescription"
          />
        ),
      },
      {
        label: (
          <FormattedMessage
            defaultMessage="URL"
            description="Label for the URL type field"
            id="tasks.UrlType"
          />
        ),
        value: 'url',
        icon: <LinkOutlinedIcon />,
        description: (
          <FormattedMessage
            defaultMessage="Must be a valid URL"
            description="Hint text about what kind of text a user can put in the URL box"
            id="tasks.UrlDescription"
          />
        ),
      },
    ];

    const FieldTypeSelect = () => (
      <React.Fragment>
        { this.state.hasCollectedAnswers &&
          <Alert
            content={
              <FormattedMessage
                defaultMessage="The field type cannot be changed because answers have already been filled"
                description="Message when team task has answers and type cannot be updated"
                id="tasks.cantChangeTypeMessage"
              />
            }
            icon
            variant="warning"
          />
        }
        <FormControl fullWidth id="edit-task-dialog__type-select" margin="normal" variant="outlined">
          <InputLabel id="edit-task-dialog__type-select-label">
            <FormattedMessage
              defaultMessage="Choose a field type"
              description="Label for field type selection box"
              id="tasks.chooseType"
            />
          </InputLabel>
          <Select
            classes={{ root: classes.select }}
            disabled={this.state.hasCollectedAnswers}
            label={
              <FormattedMessage
                defaultMessage="Choose a field type"
                description="Label for field type selection box"
                id="tasks.chooseType"
              />
            }
            labelId="edit-task-dialog__type-select-label"
            value={this.state.taskType}
            onChange={this.handleSelectType}
          >
            {types.map(t => (
              <MenuItem
                className={`edit-task-dialog__menu-item-${t.value}`}
                key={t.value}
                value={t.value}
              >
                <ListItemIcon>{t.icon}</ListItemIcon>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box mb={this.state.hasCollectedAnswers ? 1 : 2} mt={1}>
          { types.find(t => t.value === this.state.taskType)?.description }
        </Box>
      </React.Fragment>
    );

    return (
      <Dialog
        className={cx('create-task__dialog', dialogStyles['dialog-window'])}
        fullWidth
        maxWidth="sm"
        open
        scroll="body"
        onClose={this.props.onDismiss}
      >
        <div className={dialogStyles['dialog-title']}>
          <FormattedMessage
            defaultMessage="Edit Annotation"
            description="Title for dialog when editing an annotation"
            id="tasks.editAnnotationDialogTitle"
            tagName="h6"
          />
        </div>
        <div className={dialogStyles['dialog-content']}>
          { this.props.message && <><Alert contained title={this.props.message} variant="error" /><br /></> }
          <div className={inputStyles['form-fieldset']}>
            <FormattedMessage defaultMessage="Enter a title for this annotation" description="Input Placeholder for the Title field for custom annotation field" id="task.TitlePlaceholder">
              {placeholder => (
                <TextField2
                  className={cx('tasks__task-label-input', inputStyles['form-fieldset-field'])}
                  componentProps={{
                    id: 'task-label-input',
                  }}
                  defaultValue={this.state.label}
                  label={
                    <FormattedMessage
                      defaultMessage="Title"
                      description="Title field for custom annotation field"
                      id="tasks.taskPrompt"
                    />
                  }
                  placeholder={placeholder}
                  required
                  onChange={this.handleLabelChange}
                />
              )}
            </FormattedMessage>
            <FormattedMessage defaultMessage="Enter an optional description for this annotation" description="Input Placeholder for the Description field for custom annotation field" id="task.DescriptionPlaceholder">
              {placeholder => (
                <TextField2
                  className={cx('create-task__task-description-input', inputStyles['form-fieldset-field'])}
                  componentProps={{
                    id: 'task-description-input',
                  }}
                  defaultValue={this.state.description}
                  label={
                    <FormattedMessage
                      defaultMessage="Description (optional)"
                      description="Description field for custom annotation field"
                      id="tasks.description"
                    />
                  }
                  placeholder={placeholder}
                  onChange={this.handleDescriptionChange}
                />
              )}
            </FormattedMessage>
            <FieldTypeSelect />
            { this.state.taskType === 'datetime' ?
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.alwaysShowTime}
                      color="primary"
                      name="checkedB"
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
                        checked={this.state.restrictTimezones}
                        color="primary"
                        name="checkedB"
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
                      defaultValue={this.state.options}
                      filterSelectedOptions
                      getOptionLabel={option => option.label}
                      multiple
                      options={timezones}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={
                            <FormattedMessage
                              defaultMessage="Timezones available to complete the task"
                              description="Label of timezones list available to the task"
                              id="tasks.timezones"
                            />
                          }
                          variant="outlined"
                        />
                      )}
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
              diff={this.state.diff}
              showAlert={this.state.showWarning}
              task={this.props.task}
            />
          </div>
        </div>
        <div className={dialogStyles['dialog-actions']}>
          <ButtonMain
            className="create-task__dialog-cancel-button"
            label={
              <FormattedMessage
                defaultMessage="Cancel"
                description="Cancel action button label"
                id="tasks.cancelAdd"
              />
            }
            size="default"
            theme="lightText"
            variant="text"
            onClick={this.props.onDismiss}
          />
          <ButtonMain
            className="create-task__dialog-submit-button"
            disabled={this.state.submitDisabled}
            label={this.state.showWarning ? (
              <FormattedMessage
                defaultMessage="I understand, save changes"
                description="Save action button label warning"
                id="tasks.saveButtonWarning"
              />
            ) : (
              <FormattedMessage
                defaultMessage="Save"
                description="Save action button label"
                id="tasks.add"
              />
            )}
            size="default"
            theme="info"
            variant="contained"
            onClick={this.handleSave}
          />
        </div>
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
