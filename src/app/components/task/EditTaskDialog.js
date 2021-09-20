import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import ClearIcon from '@material-ui/icons/Clear';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import AddIcon from '@material-ui/icons/Add';
import ShortTextIcon from '@material-ui/icons/ShortText';
import LocationIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import Attribution from './Attribution';
import Message from '../Message';
import ProjectSelector from '../project/ProjectSelector';
import NumberIcon from '../../icons/NumberIcon';
import timezones from '../../timezones';
import {
  units,
  caption,
  black54,
  Row,
} from '../../styles/js/shared';

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
      editLabelOrDescription: false,
      hasOther: task ? task.options?.some(option => option.other) : false,
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

  handleSelectType = (e) => {
    const taskType = e.target.value;
    const { task } = this.props;
    let options = task ? task.options : [{ label: '' }, { label: '' }];
    if (taskType === 'datetime') {
      options = [{ code: 'UTC', label: 'UTC (0 GMT)', offset: 0 }];
    }
    this.setState(
      { taskType, options },
      () => this.validateTask(this.state.label, this.state.options),
    );
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
            defaultMessage="Date and time"
            description="Label for datetime type field"
          />
        ),
        value: 'datetime',
        icon: <DateRangeIcon />,
        description: (
          <FormattedMessage
            id="tasks.datetimeDescription"
            defaultMessage="Allows you to pick a date and time from the calendar"
            description="Description for datetime type field"
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
        <Box mt={1} mb={2}>
          { types.find(t => t.value === this.state.taskType)?.description }
        </Box>
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
              <Box mb={4}>
                <Divider />
              </Box>
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
              />
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
