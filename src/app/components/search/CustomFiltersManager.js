import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import ShortTextIcon from '@material-ui/icons/ShortText';
import LocationIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import IconFileUpload from '@material-ui/icons/CloudUpload';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
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

const useStyles = makeStyles(theme => ({
  root: {
    width: theme.spacing(15),
  },
  inputMarginDense: {
    padding: '4px 8px',
  },
}));

const CustomFiltersManager = ({
  hide,
  intl,
  team,
  onFilterChange,
  query,
}) => {
  if (hide) { return null; }
  const classes = useStyles();

  const defaultMinValue = '';
  const defaultMaxValue = '';
  const [showNumericRange, setShowNumericRange] = React.useState(false);
  const [minNumber, setMinNumber] = React.useState(defaultMinValue);
  const [maxNumber, setMaxNumber] = React.useState(defaultMaxValue);
  const [showErrorMsg, setShowErrorMsg] = React.useState(false);

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

  return filters.map((filter, i) => {
    if (filter.id) { // TODO: Have each metadata/task type return its appropriate widget (e.g.: choice/date/location/number)
      const teamTask = teamTasks.find(tt => tt.node.dbid.toString() === filter.id);
      let options = fixedOptions;
      if (filter.task_type === 'datetime') {
        options.push({ label: intl.formatMessage(messages.dateRange), value: 'DATE_RANGE', exclusive: true });
      }
      if (filter.task_type === 'number') {
        options.push({ label: intl.formatMessage(messages.numericRange), value: 'NUMERIC_RANGE', exclusive: true });
      }
      if (teamTask.node.options) {
        options.push({ label: '', value: '' });
        options = options.concat(teamTask.node.options.filter(fo => !fo.other).map(tt => ({ label: tt.label, value: tt.label })));
      }

      const handleChoiceTaskFilterChange = (val) => {
        let range = {};
        if (val.includes('NUMERIC_RANGE')) {
          range = { min: minNumber, max: maxNumber };
          setShowNumericRange(true);
        } else {
          setShowNumericRange(false);
        }
        const response = val.includes('ANY_VALUE') || val.includes('NO_VALUE') || val.includes('NUMERIC_RANGE') ? val[0] : val;
        handleTeamTaskFilterChange({ ...filter, response, range });
      };

      const handleFieldChange = (key, keyValue) => {
        const range = { min: minNumber, max: maxNumber };
        if (key === 'min') {
          setMinNumber(keyValue);
          range.min = keyValue;
        } else if (key === 'max') {
          setMaxNumber(keyValue);
          range.max = keyValue;
        }
        if (range.max !== '' && range.min > range.max) {
          setShowErrorMsg(true);
        } else {
          setShowErrorMsg(false);
          handleChoiceTaskFilterChange(['NUMERIC_RANGE']);
        }
      };

      return (
        <Box>
          <Box display="flex" alignItems="center">
            <MultiSelectFilter
              label={intl.formatMessage(messages.labelIs, { title: teamTask.node.label })}
              icon={icons[teamTask.node.type]}
              selected={filter.response}
              options={options}
              onChange={handleChoiceTaskFilterChange}
              onRemove={() => handleRemoveFilter(i)}
            />
            { showNumericRange ?
              <Box display="flex" alignItems="center">
                <Box px={1}>
                  <Typography component="span" variant="body2">
                    <FormattedMessage id="numericRangeFilter.between" defaultMessage="between" />
                  </Typography>
                </Box>
                <FormattedMessage id="customFiltersManager.enterNumber" defaultMessage="enter number">
                  { placeholder => (
                    <TextField
                      classes={{ root: classes.root }}
                      InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
                      variant="outlined"
                      size="small"
                      placeholder={placeholder}
                      value={minNumber}
                      onChange={(e) => { handleFieldChange('min', e.target.value); }}
                      type="number"
                      error={showErrorMsg}
                    />
                  )}
                </FormattedMessage>
                <Box px={1}>
                  <Typography component="span" variant="body2">
                    <FormattedMessage id="numericRangeFilter.and" defaultMessage="and" />
                  </Typography>
                </Box>
                <FormattedMessage id="customFiltersManager.enterNumber" defaultMessage="enter number">
                  { placeholder => (
                    <TextField
                      classes={{ root: classes.root }}
                      InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
                      variant="outlined"
                      size="small"
                      placeholder={placeholder}
                      value={maxNumber}
                      onChange={(e) => { handleFieldChange('max', e.target.value); }}
                      type="number"
                      error={showErrorMsg}
                    />
                  )}
                </FormattedMessage>
              </Box> : null }
          </Box>
          { showErrorMsg ?
            <Box alignItems="center" color="red" display="flex">
              <Box pr={1}><ErrorOutlineIcon /></Box>
              <Typography component="span" variant="body2">
                <FormattedMessage
                  id="customFiltersManager.errorMessage"
                  defaultMessage="First number should be less than second number"
                  description="Message when user set range number with min value greater than max value"
                />
              </Typography>
            </Box> : null }
        </Box>
      );
    }

    return (
      <FormattedMessage id="customFiltersManager.label" defaultMessage="Custom field is" description="Placeholder label for metadata field when not fully configured">
        { label => (
          <MultiSelectFilter
            label={label}
            icon={<StarIcon />}
            options={teamTasks.map(tt => ({
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
          label
          options
          type
        }
      }
    }
  }
`);
