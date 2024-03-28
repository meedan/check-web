import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { Box } from '@material-ui/core';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import AddIcon from '../../icons/add.svg';
import CheckBoxOutlineBlankIcon from '../../icons/check_box.svg';
import ClearIcon from '../../icons/clear.svg';
import RadioButtonUncheckedIcon from '../../icons/radio_button_checked.svg';
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
  onChange,
  task,
  taskType,
}) => {
  if (!['single_choice', 'multiple_choice'].includes(taskType)) {
    return null;
  }

  const buildInitialOptions = () => task ?
    task.options.map(item => ({ ...item, oldLabel: item.label })) :
    [{ label: '', tempId: Math.random() }, { label: '', tempId: Math.random() }];

  const [diff, setDiff] = React.useState({
    deleted: [],
    changed: {},
    added: [],
  });
  const [options, setOptions] = React.useState(buildInitialOptions());
  const [hasOther, setHasOther] = React.useState(task ? task.options?.some(option => option.other) : false);

  const canRemove = options.length > 2;

  const handleEditOption = (newLabel, index) => {
    const { oldLabel } = options[index];
    const newDiff = Object.assign({}, diff);
    const newOptions = JSON.parse(JSON.stringify(options));

    newOptions[index].label = newLabel;

    if (oldLabel) {
      newDiff.changed[oldLabel] = newLabel;
    } else {
      newDiff.added = newOptions.filter(o => o.tempId && o.label.trim()).map(o => o.label);
    }

    if (oldLabel === newLabel) {
      delete newDiff.changed[oldLabel];
    }

    setDiff(newDiff);
    setOptions(newOptions);
    onChange(newOptions, newDiff);
  };

  const handleRemoveOption = (index) => {
    const { oldLabel, other } = options[index];
    const newDiff = Object.assign({}, diff);
    const newOptions = JSON.parse(JSON.stringify(options));
    const newHasOther = hasOther && (index !== options.length - 1);

    if (oldLabel) {
      newDiff.deleted.push(oldLabel);
      delete newDiff.changed[oldLabel];
      if (other) {
        newDiff.delete_other = true;
      }
    }

    newOptions.splice(index, 1);
    newDiff.added = newOptions.filter(o => o.tempId && o.label.trim()).map(o => o.label);
    setDiff(newDiff);
    setOptions(newOptions);
    setHasOther(newHasOther);
    onChange(newOptions, newDiff);
  };

  const handleAddOption = () => {
    const newOptions = JSON.parse(JSON.stringify(options));
    const option = { label: '', tempId: Math.random() };
    if (hasOther) {
      newOptions.splice(-1, 0, option);
    } else {
      newOptions.push(option);
    }
    setOptions(newOptions);
    onChange(newOptions);
  };

  const handleAddOther = () => {
    const newDiff = Object.assign({}, diff);
    const newOptions = JSON.parse(JSON.stringify(options));
    const otherLabel = intl.formatMessage(messages.other);
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
      <hr />
      <Box mt={1}>
        { options.map((item, index) => (
          <div key={`edit-task-options__option-${index.toString()}`}>
            <Row style={{ alignItems: 'center' }}>
              <ButtonMain
                key="create-task__remove-option-button"
                className="create-task__remove-option-button create-task__md-icon"
                disabled
                iconCenter={
                  <>
                    { taskType === 'single_choice' ? <RadioButtonUncheckedIcon /> : null }
                    { taskType === 'multiple_choice' ? <CheckBoxOutlineBlankIcon /> : null }
                  </>
                }
                variant="text"
                size="small"
                theme="text"
              />
              <Box clone py={0.5} px={1} width="75%">
                <TextField
                  key="create-task__add-option-input"
                  className="create-task__add-option-input"
                  componentProps={{
                    id: index.toString(),
                  }}
                  placeholder={`${intl.formatMessage(messages.value)} ${index + 1}`}
                  value={item.label}
                  onChange={e => handleEditOption(e.target.value, index)}
                  disabled={item.other}
                  error={item.label && options.filter(o => o.label === item.label).length > 1}
                />
              </Box>
              { canRemove ?
                <ButtonMain
                  key="create-task__remove-option-button"
                  className="create-task__remove-option-button create-task__md-icon"
                  onClick={() => handleRemoveOption(index)}
                  iconCenter={<ClearIcon />}
                  variant="contained"
                  size="small"
                  theme="lightText"
                /> : null
              }
            </Row>
          </div>
        ))}
        <Box mt={1} display="flex">
          <ButtonMain
            onClick={handleAddOption}
            iconLeft={<AddIcon />}
            theme="text"
            size="default"
            variant="contained"
            label={
              <FormattedMessage
                id="singleChoiceTask.addValue"
                defaultMessage="Add Option"
                description="Button for creating a new entry to a list of selectable options"
              />
            }
          />
          <Box ml={1}>
            <ButtonMain
              onClick={handleAddOther}
              iconLeft={<AddIcon />}
              theme="text"
              size="default"
              variant="contained"
              disabled={hasOther}
              label={
                <FormattedMessage
                  id="singleChoiceTask.addOther"
                  defaultMessage='Add "Other"'
                  description="Button for creating a new entry to a list of selectable options, in which the user is free to specify the value that will be selected"
                />
              }
            />
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
};

EditTaskOptions.defaultProps = {
  task: null,
};

EditTaskOptions.propTypes = {
  intl: intlShape.isRequired,
  onChange: PropTypes.func.isRequired,
  task: PropTypes.shape({
    type: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
  }),
  taskType: PropTypes.string.isRequired,
};

// TODO createFragmentContainer
export default injectIntl(EditTaskOptions);
