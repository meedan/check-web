import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import StarIcon from '@material-ui/icons/Star';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import MultiSelectFilter from './MultiSelectFilter';

const messages = defineMessages({
  noValue: {
    id: 'CustomTeamTaskFilter.noValue',
    defaultMessage: 'No value is set',
    description: 'Label for custom field configuration to allow filtering by task or metadata with no value set',
  },
  anyValue: {
    id: 'CustomTeamTaskFilter.anyValue',
    defaultMessage: 'Any value is set',
    description: 'Label for custom field configuration to allow filtering by task or metadata with any value set',
  },
  labelIs: {
    id: 'CustomTeamTaskFilter.labelIs',
    defaultMessage: '{title} is',
    description: 'Label for custom filter field. E.g. "Location is", "Date of event is"',
  },
});

const CustomFiltersManager = ({
  hide,
  intl,
  team,
  onFilterChange,
  query,
}) => {
  if (hide) { return null; }

  const supportedTeamTasks = team.team_tasks.edges.filter(tt => tt.node.type.includes('choice'));

  const handleTeamTaskFilterChange = (teamTaskFilter, index) => {
    const newQuery = {};
    newQuery.team_tasks = query.team_tasks ? [...query.team_tasks] : [];
    newQuery.team_tasks.splice(index, 1, teamTaskFilter);
    onFilterChange(newQuery);
  };

  const handleRemoveFilter = (index) => {
    const newQuery = {};
    newQuery.team_tasks = query.team_tasks ? [...query.team_tasks] : [];
    newQuery.team_tasks.splice(index, 1);
    if (newQuery.team_tasks.length === 0) {
      delete newQuery.team_tasks;
    }
    onFilterChange(newQuery);
  };

  const handleSelectMetadataField = (val, index) => {
    const teamTask = supportedTeamTasks.find(tt => tt.node.dbid.toString() === val);

    handleTeamTaskFilterChange({
      id: val,
      task_type: teamTask.node.type,
    }, index);
  };

  const filters = query.team_tasks && query.team_tasks.length > 0 ? query.team_tasks : [{}];

  const icons = {
    single_choice: <RadioButtonCheckedIcon />,
    multiple_choice: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
  };

  const fixedOptions = [
    { label: intl.formatMessage(messages.anyValue), value: 'ANY_VALUE', exclusive: true },
    { label: intl.formatMessage(messages.noValue), value: 'NO_VALUE', exclusive: true },
    { label: '', value: '' },
  ];

  return filters.map((filter, i) => {
    if (filter.id) {
      const teamTask = supportedTeamTasks.find(tt => tt.node.dbid.toString() === filter.id);

      if (filter.task_type.includes('choice')) { // TODO: Have each metadata/task type return its appropriate widget (e.g.: choice/date/location/number)
        const options = fixedOptions.concat(teamTask.node.options.filter(fo => !fo.other).map(tt => ({ label: tt.label, value: tt.label })));

        const handleChoiceTaskFilterChange = (val) => {
          const response = val.includes('ANY_VALUE') || val.includes('NO_VALUE') ? val[0] : val;
          handleTeamTaskFilterChange({ ...filter, response });
        };

        return (
          <MultiSelectFilter
            label={intl.formatMessage(messages.labelIs, { title: teamTask.node.label })}
            icon={icons[teamTask.node.type]}
            selected={filter.response}
            options={options}
            onChange={handleChoiceTaskFilterChange}
            onRemove={() => handleRemoveFilter(i)}
          />
        );
      }
    }

    return (
      <FormattedMessage id="customFiltersManager.label" defaultMessage="Custom field is" description="Placeholder label for metadata field when not fully configured">
        { label => (
          <MultiSelectFilter
            label={label}
            icon={<StarIcon />}
            options={supportedTeamTasks.map(tt => ({
              label: tt.node.label,
              value: tt.node.dbid.toString(),
              icon: icons[tt.node.type],
              checkedIcon: icons[tt.node.type],
            }))}
            onChange={val => handleSelectMetadataField(val, i)}
            onRemove={() => handleRemoveFilter(i)}
            single
          />
        )}
      </FormattedMessage>
    );
  });
};

CustomFiltersManager.defaultProps = {
  hide: false,
};

CustomFiltersManager.propTypes = {
  hide: PropTypes.bool,
  team: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  query: PropTypes.shape({
    team_tasks: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      response: PropTypes.string,
      task_type: PropTypes.string,
    })),
  }).isRequired,
};

export default createFragmentContainer(injectIntl(CustomFiltersManager), graphql`
  fragment CustomFiltersManager_team on Team {
    team_tasks(first: 10000) {
      edges {
        node {
          id
          dbid
          fieldset
          label
          options
          type
          associated_type
        }
      }
    }
  }
`);
