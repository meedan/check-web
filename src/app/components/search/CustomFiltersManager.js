import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import StarIcon from '@material-ui/icons/Star';
import ShortTextIcon from '@material-ui/icons/ShortText';
import LocationIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import IconFileUpload from '@material-ui/icons/CloudUpload';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import AnnotationFilterNumber from './AnnotationFilterNumber';
import AnnotationFilterDate from './AnnotationFilterDate';
import MultiSelectFilter from './MultiSelectFilter';
import NumberIcon from '../../icons/NumberIcon';

const messages = defineMessages({
  empty: {
    id: 'CustomTeamTaskFilter.empty',
    defaultMessage: 'Empty',
    description: 'Label for custom field configuration to allow filtering by task or metadata with no value set',
  },
  notEmpty: {
    id: 'CustomTeamTaskFilter.notEmpty',
    defaultMessage: 'Not empty',
    description: 'Label for custom field configuration to allow filtering by task or metadata with any value set',
  },
  labelIs: {
    id: 'CustomTeamTaskFilter.labelIs',
    defaultMessage: '{title} is',
    description: 'Label for custom filter field. The title is input by user and can be basically anything.',
  },
  dateRange: {
    id: 'CustomTeamTaskFilter.dateRange',
    defaultMessage: 'Date range',
    description: 'Label for custom field configuration to allow filtering datetime filed with date range option',
  },
  numericRange: {
    id: 'CustomTeamTaskFilter.numericRange',
    defaultMessage: 'Number range',
    description: 'Label for custom field configuration to allow filtering number filed with numeric range option',
  },
});

const CustomFiltersManager = ({
  hide,
  intl,
  team,
  operatorToggle,
  onFilterChange,
  query,
}) => {
  if (hide) { return null; }
  const [errorMessage, setErrorMessage] = React.useState('');

  const teamTasks = team.team_tasks.edges;

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
    const teamTask = teamTasks.find(tt => tt.node.dbid.toString() === val);

    handleTeamTaskFilterChange({
      id: val,
      task_type: teamTask.node.type,
    }, index);
  };

  const filters = query.team_tasks && query.team_tasks.length > 0 ? query.team_tasks : [{}];

  const icons = {
    free_text: <ShortTextIcon />,
    single_choice: <RadioButtonCheckedIcon />,
    multiple_choice: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
    number: <NumberIcon />,
    geolocation: <LocationIcon />,
    datetime: <DateRangeIcon />,
    file_upload: <IconFileUpload />,
  };

  const fixedOptions = [
    { label: intl.formatMessage(messages.notEmpty), value: 'ANY_VALUE', exclusive: true },
    { label: intl.formatMessage(messages.empty), value: 'NO_VALUE', exclusive: true },
  ];

  const filterFields = filters.map((filter, i) => {
    if (filter.id) { // TODO: Have each metadata/task type return its appropriate widget (e.g.: choice/date/location/number)
      const teamTask = teamTasks.find(tt => tt.node.dbid.toString() === filter.id);
      let options = [...fixedOptions];
      if (filter.task_type === 'datetime') {
        options.push({ label: intl.formatMessage(messages.dateRange), value: 'DATE_RANGE', exclusive: true });
      } else if (filter.task_type === 'number') {
        options.push({ label: intl.formatMessage(messages.numericRange), value: 'NUMERIC_RANGE', exclusive: true });
      }
      if (teamTask.node.options) {
        options.push({ label: '', value: '' });
        options = options.concat(teamTask.node.options.filter(fo => !fo.other).map(tt => ({ label: tt.label, value: tt.label })));
      }

      // extraParams will be an object which contains type-specific keys. e.g.: extraParams = { range: { min: x, max: y }}
      const handleChoiceTaskFilterChange = (val, extraParams) => {
        const response = val.includes('ANY_VALUE') || val.includes('NO_VALUE') || val.includes('NUMERIC_RANGE') || val.includes('DATE_RANGE') ? val[0] : val;
        const obj = { ...filter, response, ...extraParams };
        handleTeamTaskFilterChange(obj);
      };

      const getExtraInputs = () => {
        if (filter.task_type === 'number' && filter.response === 'NUMERIC_RANGE') {
          return (
            <AnnotationFilterNumber
              teamTask={teamTask}
              query={query}
              onChange={handleChoiceTaskFilterChange}
              onError={message => setErrorMessage(message)}
            />
          );
        } else if (filter.task_type === 'datetime' && filter.response === 'DATE_RANGE') {
          return (
            <AnnotationFilterDate
              teamTask={teamTask}
              query={query}
              onChange={handleChoiceTaskFilterChange}
            />
          );
        }

        return null;
      };

      return (
        <Box>
          <Box display="flex" alignItems="center">
            <MultiSelectFilter
              extraInputs={getExtraInputs()}
              label={intl.formatMessage(messages.labelIs, { title: teamTask.node.label })}
              icon={icons[teamTask.node.type]}
              selected={filter.response}
              options={options}
              onChange={handleChoiceTaskFilterChange}
              onRemove={() => handleRemoveFilter(i)}
            />
          </Box>
          { errorMessage ?
            <Box alignItems="center" color="red" display="flex">
              <Box pr={1}><ErrorOutlineIcon /></Box>
              <Typography component="span" variant="body2">
                { errorMessage }
              </Typography>
            </Box> : null }
        </Box>
      );
    }

    const existingFilters = query.team_tasks.map(tt => tt.id);
    // First step, show all annotation fields
    return (
      <FormattedMessage id="customFiltersManager.label" defaultMessage="Custom field is" description="Placeholder label for metadata field when not fully configured">
        { label => (
          <MultiSelectFilter
            label={label}
            icon={<StarIcon />}
            options={teamTasks.filter(tt => existingFilters.indexOf(tt.node.dbid.toString()) === -1).map(tt => ({
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

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap">
      { filterFields.map((key, index) => {
        if (index > 0) {
          return (
            <React.Fragment key={key}>
              { operatorToggle }
              { key }
            </React.Fragment>
          );
        }

        return (
          <span key={key}>
            { key }
          </span>
        );
      })}
    </Box>
  );
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
          label
          options
          type
        }
      }
    }
  }
`);
