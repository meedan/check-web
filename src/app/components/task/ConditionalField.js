import React from 'react';
import { FormattedMessage } from 'react-intl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import CdsSelect from '../cds/inputs/Select';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import Chip from '../cds/buttons-checkboxes-chips/Chip';
import styles from './Task.module.css';

const conditionalVerbs = [
  {
    label: 'is...',
    itemTypes: ['single_choice', 'multiple_choice'],
    test() {},
  },
  {
    label: 'is not...',
    itemTypes: ['single_choice', 'multiple_choice'],
    test() {},
  },
  {
    label: 'is any of...',
    itemTypes: ['multiple_choice'],
    test() {},
  },
  {
    label: 'is none of...',
    itemTypes: ['multiple_choice'],
    test() {},
  },
  {
    label: 'is empty',
    itemTypes: ['single_choice', 'multiple_choice'],
    test() {},
  },
  {
    label: 'is not empty',
    itemTypes: ['single_choice', 'multiple_choice'],
    test() {},
  },
];

const ConditionalField = ({ onChange, task, tasks }) => {
  const parsedConditionalInfo = JSON.parse(task?.conditional_info || null);
  const hasConditionsInitial = task ? parsedConditionalInfo?.selectedFieldId !== (null || undefined) : null;

  // make array of all potential valid prerequisite fields (single selects that are not this one)
  const prerequisiteFields = tasks
    .filter(item => item.type === 'single_choice' || item.type === 'multiple_choice')
    .filter(item => item.dbid !== task?.dbid);

  if (!prerequisiteFields.length) return null;

  const [selectedFieldId, setSelectedFieldId] = React.useState(parsedConditionalInfo?.selectedFieldId || (prerequisiteFields.length > 0 ? prerequisiteFields[0].dbid : null));
  const [selectedConditional, setSelectedConditional] = React.useState(hasConditionsInitial ? parsedConditionalInfo?.selectedConditional : conditionalVerbs[0].label);
  const [selectedCondition, setSelectedCondition] = React.useState(hasConditionsInitial ? parsedConditionalInfo?.selectedCondition : prerequisiteFields[0]?.options[0]?.label);
  const [hasConditions, setHasConditions] = React.useState(hasConditionsInitial);
  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    // make sure useEffect does not fire on initial component render
    // https://stackoverflow.com/a/53254028/4869657
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    const conditionalInfo = {
      selectedConditional,
      selectedFieldId,
      selectedCondition,
    };

    if (onChange) {
      onChange({
        id: task.id,
        label: task.label,
        conditional_info: hasConditions ? JSON.stringify(conditionalInfo) : null,
      });
    }
  }, [selectedConditional, selectedCondition, selectedFieldId, hasConditions]);

  const handleToggleHasConditions = (conditions) => {
    setHasConditions(conditions);
  };

  const handlePrerequisiteFieldChange = (e) => {
    if (e.target.name === 'conditionals') {
      setSelectedConditional(e.target.value);
      setSelectedCondition(prerequisiteFields.find(field => field.dbid === selectedFieldId)?.options[0]?.label);
    } else if (e.target.name === 'prerequisites') {
      setSelectedFieldId(+e.target.value);
      setSelectedCondition(prerequisiteFields.find(field => field.dbid === +e.target.value)?.options[0]?.label);
    } else if (e.target.name === 'conditions') {
      setSelectedCondition(e.target.value);
    } else if (e.target.name === 'multiple-conditions') {
      setSelectedCondition(e.target.value.join(', '));
    }
  };

  return (
    <React.Fragment>
      <SwitchComponent
        checked={hasConditions}
        label={<FormattedMessage
          defaultMessage="Show field when condition is met"
          description="This is a switch that, when set to 'on', will cause the field above the switch to only be shown when a certain user-defined condition is true. Selecting this button creates a dialog for the user to define the condition."
          id="tasks.showIfCondition"
        />}
        labelPlacement="end"
        onChange={() => handleToggleHasConditions(!hasConditions)}
      />
      { hasConditions ?
        <div className={styles['task-conditions']}>
          <FormattedMessage
            defaultMessage="When"
            description="We have a form that says in English, 'When [selected field] [is / is not] [user-selected value]'. Where the parts between brackets are interactive drop-downs. The word for this field should indicate that the following user-selected conditions hold true."
            id="tasks.when"
          />
          <CdsSelect
            name="prerequisites"
            value={selectedFieldId}
            onChange={handlePrerequisiteFieldChange}
          >
            { prerequisiteFields.map(field => <option value={field.dbid}>{field.label}</option>) }
          </CdsSelect>
          <CdsSelect
            name="conditionals"
            value={selectedConditional}
            onChange={handlePrerequisiteFieldChange}
          >
            { conditionalVerbs
              .filter(verb => verb.itemTypes.includes(prerequisiteFields.find(field => field.dbid === selectedFieldId)?.type))
              .map(verb => <option value={verb.label}>{verb.label}</option>) }
          </CdsSelect>
          {
            /* eslint-disable react/jsx-closing-tag-location, react/jsx-indent */
            {
              'is...': (<CdsSelect
                name="conditions"
                value={selectedCondition}
                onChange={handlePrerequisiteFieldChange}
              >
                {
                  prerequisiteFields
                    .find(field => field.dbid === selectedFieldId)?.options
                    .map(option => <option value={option.label}>{option.label}</option>)
                }
              </CdsSelect>),
              'is not...': (
                <CdsSelect
                  name="conditions"
                  value={selectedCondition}
                  onChange={handlePrerequisiteFieldChange}
                >
                  {
                    prerequisiteFields
                      .find(field => field.dbid === selectedFieldId)?.options
                      .map(option => <option value={option.label}>{option.label}</option>)
                  }
                </CdsSelect>
              ),
              'is any of...': (<span className={styles['task-conditional-multiselect']}>
                <Select
                  input={<Input id="select-multiple-chip" />}
                  multiple
                  name="multiple-conditions"
                  renderValue={selected => (
                    <div>
                      {selected.map(value => (
                        <Chip key={value} label={value} />
                      ))}
                    </div>
                  )}
                  value={selectedCondition.split(', ')}
                  onChange={handlePrerequisiteFieldChange}
                >
                  {
                    prerequisiteFields
                      .find(field => field.dbid === selectedFieldId)?.options
                      .map(option => <MenuItem key={option.label} value={option.label}>{option.label}</MenuItem>)
                  }
                </Select>
              </span>),
              'is none of...': (<span className={styles['task-conditional-multiselect']}>
                <Select
                  input={<Input id="select-multiple-chip" />}
                  multiple
                  name="multiple-conditions"
                  renderValue={selected => (
                    <div>
                      {selected.map(value => (
                        <Chip key={value} label={value} />
                      ))}
                    </div>
                  )}
                  value={selectedCondition.split(', ')}
                  onChange={handlePrerequisiteFieldChange}
                >
                  {
                    prerequisiteFields
                      .find(field => field.dbid === selectedFieldId)?.options
                      .map(option => <MenuItem key={option.label} value={option.label}>{option.label}</MenuItem>)
                  }
                </Select>
              </span>),
              'is empty': null,
              'is not empty': null,
            }[selectedConditional]
            /* eslint-enable react/jsx-closing-tag-location */
          }
        </div>
        : null
      }
    </React.Fragment>
  );
};

export default ConditionalField;
