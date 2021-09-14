import React from 'react';
import { FormattedMessage } from 'react-intl';
import Chip from '@material-ui/core/Chip';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import styled from 'styled-components';
import { units } from '../../styles/js/shared';

const StyledConditionalSelect = styled.span`
  margin-left: ${units(2)};
  margin-top: ${units(2)};
`;

const StyledConditionalMultiSelect = styled.span`
  margin-left: ${units(2)};
  .MuiInputBase-root {
    width: 270px;
    height: 38px;
  }
  #mui-component-select-multiple-conditions::after {
    display: block;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 1px;
    left: 230px;
    width: 40px;
    background: linear-gradient(to right, rgba(246,246,246,0), rgba(246,246,246,1) 60%, rgba(246,246,246,1));
    content: "";
  }
  #mui-component-select-multiple-conditions {
    height: ${units(3)};
  }
  .MuiChip-root {
    max-width: 90px;
  }
`;

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

const ConditionalField = ({ task, tasks, onChange }) => {
  const parsedConditionalInfo = JSON.parse(task?.conditional_info || null);
  const hasConditionsInitial = task ? parsedConditionalInfo?.selectedFieldId !== (null || undefined) : null;

  // make array of all potential valid prerequisite fields (single selects that are not this one)
  const prerequisiteFields = tasks
    .filter(item => item.type === 'single_choice' || item.type === 'multiple_choice')
    .filter(item => item.dbid !== task?.dbid);

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

  const handleToggleHasConditions = (e) => {
    setHasConditions(e.target.checked);
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
      <Switch
        checked={hasConditions}
        onChange={handleToggleHasConditions}
      />
      <FormattedMessage
        id="tasks.showIfCondition"
        defaultMessage="Show field when condition is met"
        description="This is a switch that, when set to 'on', will cause the field above the switch to only be shown when a certain user-defined condition is true. Selecting this button creates a dialog for the user to define the condition."
      />
      <br />
      { hasConditions ?
        <>
          <Typography variant="body1" component="span">
            <FormattedMessage
              id="tasks.when"
              defaultMessage="When"
              description="We have a form that says in English, 'When [selected field] [is / is not] [user-selected value]'. Where the parts between brackets are interactive drop-downs. The word for this field should indicate that the following user-selected conditions hold true."
            />
          </Typography>
          <StyledConditionalSelect>
            <Select
              onChange={handlePrerequisiteFieldChange}
              value={selectedFieldId}
              name="prerequisites"
            >
              { prerequisiteFields.map(field => <MenuItem value={field.dbid}>{field.label}</MenuItem>) }
            </Select>
          </StyledConditionalSelect>
          <StyledConditionalSelect>
            <Select
              onChange={handlePrerequisiteFieldChange}
              value={selectedConditional}
              name="conditionals"
            >
              { conditionalVerbs
                .filter(verb => verb.itemTypes.includes(prerequisiteFields.find(field => field.dbid === selectedFieldId)?.type))
                .map(verb => <MenuItem value={verb.label}>{verb.label}</MenuItem>) }
            </Select>
          </StyledConditionalSelect>
          {
            /* eslint-disable react/jsx-closing-tag-location, react/jsx-indent */
            {
              'is...': (<StyledConditionalSelect>
                <Select
                  onChange={handlePrerequisiteFieldChange}
                  name="conditions"
                  value={selectedCondition}
                >
                  {
                    prerequisiteFields
                      .find(field => field.dbid === selectedFieldId)?.options
                      .map(option => <MenuItem value={option.label}>{option.label}</MenuItem>)
                  }
                </Select>
              </StyledConditionalSelect>),
              'is not...': (<StyledConditionalSelect>
                <Select
                  onChange={handlePrerequisiteFieldChange}
                  name="conditions"
                  value={selectedCondition}
                >
                  {
                    prerequisiteFields
                      .find(field => field.dbid === selectedFieldId)?.options
                      .map(option => <MenuItem value={option.label}>{option.label}</MenuItem>)
                  }
                </Select>
              </StyledConditionalSelect>),
              'is any of...': (<StyledConditionalMultiSelect>
                <Select
                  multiple
                  name="multiple-conditions"
                  value={selectedCondition.split(', ')}
                  onChange={handlePrerequisiteFieldChange}
                  input={<Input id="select-multiple-chip" />}
                  renderValue={selected => (
                    <div>
                      {selected.map(value => (
                        <Chip key={value} label={value} />
                      ))}
                    </div>
                  )}
                >
                  {
                    prerequisiteFields
                      .find(field => field.dbid === selectedFieldId)?.options
                      .map(option => <MenuItem key={option.label} value={option.label}>{option.label}</MenuItem>)
                  }
                </Select>
              </StyledConditionalMultiSelect>),
              'is none of...': (<StyledConditionalMultiSelect>
                <Select
                  multiple
                  name="multiple-conditions"
                  value={selectedCondition.split(', ')}
                  onChange={handlePrerequisiteFieldChange}
                  input={<Input id="select-multiple-chip" />}
                  renderValue={selected => (
                    <div>
                      {selected.map(value => (
                        <Chip key={value} label={value} />
                      ))}
                    </div>
                  )}
                >
                  {
                    prerequisiteFields
                      .find(field => field.dbid === selectedFieldId)?.options
                      .map(option => <MenuItem key={option.label} value={option.label}>{option.label}</MenuItem>)
                  }
                </Select>
              </StyledConditionalMultiSelect>),
              'is empty': null,
              'is not empty': null,
            }[selectedConditional]
            /* eslint-enable react/jsx-closing-tag-location */
          }
        </>
        : null
      }
    </React.Fragment>
  );
};

export default ConditionalField;
