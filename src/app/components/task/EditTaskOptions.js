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
  const [hasOther, setHasOther] = React.useState(false);

  const { formatMessage } = intl;
  const canRemove = options.length > 2;

  console.log('options', options); // eslint-disable-line no-console
  console.log('diff', diff); // eslint-disable-line no-console

  const handleEditOption = (newValue, index) => {
    const newDiff = Object.assign({}, diff);
    const newOptions = JSON.parse(JSON.stringify(options));
    if (!newOptions[index].initialLabel && !newOptions[index].tempId) {
      newOptions[index].initialLabel = newOptions[index].label;
    }
    if (newOptions[index].initialLabel) {
      newDiff.changed[newOptions[index].initialLabel] = newValue;
    }
    newOptions[index].label = newValue;
    setDiff(newDiff);
    setOptions(newOptions);
    onChange(newOptions);
  };

  const handleRemoveOption = (index) => {
    const newDiff = Object.assign({}, diff);
    const newOptions = JSON.parse(JSON.stringify(options));
    const newHasOther = hasOther && (index !== options.length - 1);
    if (!newOptions[index].initialLabel && !newOptions[index].tempId) {
      newOptions[index].initialLabel = newOptions[index].label;
    }
    if (newOptions[index].initialLabel) {
      newDiff.deleted.push(newOptions[index].initialLabel);
    }
    newOptions.splice(index, 1);
    setDiff(newDiff);
    setOptions(newOptions);
    setHasOther(newHasOther);
    onChange(newOptions);
  };

  const handleAddValue = () => {
    const newOptions = JSON.parse(JSON.stringify(options));
    if (hasOther) {
      newOptions.splice(-1, 0, { label: '', tempId: Math.random() });
    } else {
      newOptions.push({ label: '', tempId: Math.random() });
    }
    setOptions(newOptions);
  };

  const handleAddOther = () => {
    const newOptions = JSON.parse(JSON.stringify(options));
    newOptions.push({
      label: formatMessage(messages.other),
      other: true,
      tempId: Math.random(),
    });
    setOptions(newOptions);
    setHasOther(true);
    onChange(newOptions);
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

EditTaskOptions.propTypes = {
  noOptions: PropTypes.bool,
};

EditTaskOptions.defaultProps = {
  noOptions: false,
};

export default injectIntl(EditTaskOptions);
