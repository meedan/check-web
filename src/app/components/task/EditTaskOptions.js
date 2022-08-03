import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import {
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
} from '@material-ui/core';
import {
  Add as AddIcon,
  Clear as ClearIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@material-ui/icons';
import { Row } from '../../styles/js/shared';

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

// Task options are either pre-existing, new, delete-candidate, edit-candidate
// Verify integrity of following operations:
// - Add, Edit, Delete
//  - pre-existing
//  - new
//  - delete-candidate
//  - edit-candidate

const EditTaskOptions = ({
  intl,
  noOptions,
  onChange,
  task,
  taskType,
}) => {
  if (
    noOptions ||
    (taskType !== 'single_choice' && taskType !== 'multiple_choice')
  ) {
    return null;
  }

  const [diff, setDiff] = React.useState({
    deleted: [],
    changed: {},
    added: [],
  });

  const [options, setOptions] = React.useState(task ? task.options : [{ label: '', tempId: Math.random() }, { label: '', tempId: Math.random() }]);
  const [hasOther, setHasOther] = React.useState(task ? task.options?.some(option => option.other) : false);

  const { formatMessage } = intl;
  const canRemove = options.length > 2;

  console.log('options', options); // eslint-disable-line no-console
  console.log('diff', diff); // eslint-disable-line no-console

  const handleEditOption = (newValue, index) => {
    const newDiff = Object.assign({}, diff);
    const newOptions = JSON.parse(JSON.stringify(options));

    // Set initialLabel if previously existing option
    // TODO make this a mapping function to set up initial options state
    if (!newOptions[index].tempId && !newOptions[index].initialLabel) {
      newOptions[index].initialLabel = newOptions[index].label;
    }

    // Once initialLabel is defined, set new label
    newOptions[index].label = newValue;

    // If initialLabel is set, add to diff.changed, else update diff.added
    if (newOptions[index].initialLabel) {
      newDiff.changed[newOptions[index].initialLabel] = newValue;
    } else {
      newDiff.added = newOptions.filter(o => o.tempId && o.label.trim()).map(o => o.label);
    }

    // If current value is same as initial, there's no change, remove from Diff
    if (newOptions[index].initialLabel === newValue) {
      delete newDiff.changed[newValue];
    }

    // TODO if setting value equal as deleted existing, restore deleted existing
    // don't actually delete and replace

    setDiff(newDiff);
    setOptions(newOptions);
    onChange(newOptions, newDiff);
  };

  const handleRemoveOption = (index) => {
    const newDiff = Object.assign({}, diff);
    const newOptions = JSON.parse(JSON.stringify(options));
    const newHasOther = hasOther && (index !== options.length - 1);

    // Set initialLabel if previously existing option
    // TODO make this a mapping function to set up initial options state
    if (!newOptions[index].tempId && !newOptions[index].initialLabel) {
      newOptions[index].initialLabel = newOptions[index].label;
    }

    // If initialLabel is set, add to diff.deleted
    if (newOptions[index].initialLabel) {
      newDiff.deleted.push(newOptions[index].initialLabel);
      // Update diff.changed if removing an edited existing option
      delete newDiff.changed[newOptions[index].initialLabel];
    }

    newOptions.splice(index, 1);
    newDiff.added = newOptions.filter(o => o.tempId && o.label.trim()).map(o => o.label);
    setDiff(newDiff);
    setOptions(newOptions);
    setHasOther(newHasOther);
    onChange(newOptions, newDiff);
  };

  const handleAddValue = () => {
    const newOptions = JSON.parse(JSON.stringify(options));
    const newValue = { label: '', tempId: Math.random() };
    if (hasOther) {
      newOptions.splice(-1, 0, newValue);
    } else {
      newOptions.push(newValue);
    }
    setOptions(newOptions);
    // Not passing newDiff to onChange yet as we didn't add a label
    onChange(newOptions);
  };

  const handleAddOther = () => {
    const newDiff = Object.assign({}, diff);
    const newOptions = JSON.parse(JSON.stringify(options));
    const otherLabel = formatMessage(messages.other);
    newOptions.push({
      label: otherLabel,
      other: true,
      tempId: Math.random(),
    });

    newDiff.added.push(otherLabel);
    setOptions(newOptions);
    setDiff(newDiff);
    setHasOther(true);
    onChange(newOptions, newDiff);
  };

  return (
    <React.Fragment>
      <Divider />
      <Box mt={1}>
        {options.map((item, index) => (
          <div key={`edit-task-options__option-${index.toString()}`}>
            <Row>
              { taskType === 'single_choice' ? <RadioButtonUncheckedIcon /> : null}
              { taskType === 'multiple_choice' ? <CheckBoxOutlineBlankIcon /> : null}
              <Box clone py={0.5} px={1} width="75%">
                <TextField
                  key="create-task__add-option-input"
                  className="create-task__add-option-input"
                  id={index.toString()}
                  onChange={e => handleEditOption(e.target.value, index)}
                  placeholder={`${formatMessage(messages.value)} ${index + 1}`}
                  value={item.label}
                  disabled={item.other}
                  variant="outlined"
                  margin="dense"
                />
              </Box>
              { canRemove ?
                <IconButton
                  key="create-task__remove-option-button"
                  className="create-task__remove-option-button create-task__md-icon"
                  onClick={() => handleRemoveOption(index)}
                >
                  <ClearIcon />
                </IconButton>
                : null }
            </Row>
          </div>
        ))}
        <Box mt={1} display="flex">
          <Button
            onClick={handleAddValue}
            startIcon={<AddIcon />}
            variant="contained"
          >
            <FormattedMessage
              id="singleChoiceTask.addValue"
              defaultMessage="Add Option"
              description="Button for creating a new entry to a list of selectable options"
            />
          </Button>
          <Box ml={1}>
            <Button
              onClick={handleAddOther}
              startIcon={<AddIcon />}
              variant="contained"
              disabled={hasOther}
            >
              <FormattedMessage
                id="singleChoiceTask.addOther"
                defaultMessage='Add "Other"'
                description="Button for creating a new entry to a list of selectable options, in which the user is free to specify the value that will be selected"
              />
            </Button>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
};

// TODO review/complete propTypes
EditTaskOptions.propTypes = {
  noOptions: PropTypes.bool,
};

EditTaskOptions.defaultProps = {
  noOptions: false,
};

// TODO createFragmentContainer
export default injectIntl(EditTaskOptions);
