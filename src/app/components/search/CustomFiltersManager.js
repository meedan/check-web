/* eslint-disable react/sort-prop-types */
import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import AnnotationFilterNumber from './AnnotationFilterNumber';
import AnnotationFilterDate from './AnnotationFilterDate';
import MultiSelectFilter from './MultiSelectFilter';
import Loader from '../cds/loading/Loader';
import CheckBoxIcon from '../../icons/check_box.svg';
import DateRangeIcon from '../../icons/calendar_month.svg';
import IconFileUpload from '../../icons/file_upload.svg';
import NumberIcon from '../../icons/numbers.svg';
import LocationIcon from '../../icons/location.svg';
import NoteAltOutlinedIcon from '../../icons/note_alt.svg';
import RadioButtonCheckedIcon from '../../icons/radio_button_checked.svg';
import ShortTextIcon from '../../icons/notes.svg';

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

const CustomFiltersManagerComponent = ({
  hide,
  intl,
  onFilterChange,
  operatorToggle,
  query,
  team,
}) => {
  if (hide) { return null; }
  const [errorMessage, setErrorMessage] = React.useState('');

  const teamTasks = team?.team_tasks?.edges ? team.team_tasks.edges : [];

  const handleTeamTaskFilterChange = (teamTaskFilter, index) => {
    const newQuery = {};
    newQuery.team_tasks = query?.team_tasks ? [...query.team_tasks] : [];
    newQuery.team_tasks.splice(index, 1, teamTaskFilter);
    onFilterChange(newQuery);
  };

  const handleRemoveFilter = (index) => {
    const newQuery = {};
    newQuery.team_tasks = query?.team_tasks ? [...query.team_tasks] : [];
    newQuery.team_tasks.splice(index, 1);
    if (newQuery.team_tasks?.length === 0) {
      delete newQuery.team_tasks;
    }
    onFilterChange(newQuery);
  };

  const handleSelectMetadataField = (val, index) => {
    const teamTask = teamTasks.find(tt => tt.node?.dbid.toString() === val);
    if (teamTask) {
      handleTeamTaskFilterChange({
        id: val,
        task_type: teamTask.node.type,
      }, index);
    }
  };

  const filters = query?.team_tasks && query?.team_tasks?.length > 0 ? query.team_tasks : [{}];

  const icons = {
    free_text: <ShortTextIcon />,
    single_choice: <RadioButtonCheckedIcon />,
    multiple_choice: <CheckBoxIcon />,
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
      if (!teamTask) return null;

      let options = [...fixedOptions];
      if (filter.task_type === 'datetime') {
        options.push({ label: intl.formatMessage(messages.dateRange), value: 'DATE_RANGE', exclusive: true });
      } else if (filter.task_type === 'number') {
        options.push({ label: intl.formatMessage(messages.numericRange), value: 'NUMERIC_RANGE', exclusive: true });
      }
      if (teamTask.node.options) {
        options.push({ label: '', value: '' });
        options = options.concat(teamTask.node?.options.filter(fo => !fo.other).map(tt => ({ label: tt.label, value: tt.label })));
      }

      // extraParams will be an object which contains type-specific keys. e.g.: extraParams = { range: { min: x, max: y }}
      const handleChoiceTaskFilterChange = (val, extraParams) => {
        const response = val.includes('ANY_VALUE') || val.includes('NO_VALUE') || val.includes('NUMERIC_RANGE') || val.includes('DATE_RANGE') ? val[0] : val;
        const obj = { ...filter, response, ...extraParams };
        handleTeamTaskFilterChange(obj, i);
      };

      const getExtraInputs = () => {
        if (filter.task_type === 'number' && filter.response === 'NUMERIC_RANGE') {
          return (
            <AnnotationFilterNumber
              query={query}
              teamTask={teamTask}
              onChange={handleChoiceTaskFilterChange}
              onError={message => setErrorMessage(message)}
            />
          );
        } else if (filter.task_type === 'datetime' && filter.response === 'DATE_RANGE') {
          return (
            <AnnotationFilterDate
              query={query}
              teamTask={teamTask}
              onChange={handleChoiceTaskFilterChange}
            />
          );
        }

        return null;
      };

      return (
        <MultiSelectFilter
          allowSearch={false}
          className="int-custom-filters-manager__multi-select-filter"
          error={errorMessage}
          extraInputs={getExtraInputs()}
          icon={icons[teamTask.node.type]}
          id={`${filter.task_type}-${filter.id}`}
          label={intl.formatMessage(messages.labelIs, { title: teamTask.node?.label })}
          options={options}
          selected={filter.response}
          onChange={handleChoiceTaskFilterChange}
          onRemove={() => handleRemoveFilter(i)}
        />
      );
    }

    const existingFilters = query.team_tasks.map(tt => tt.id);

    return (
      <FormattedMessage defaultMessage="Custom field is" description="Placeholder label for metadata field when not fully configured" id="customFiltersManager.label">
        { label => (
          <MultiSelectFilter
            className="int-custom-filters-manager__multi-select-filter--team-tasks"
            icon={<NoteAltOutlinedIcon />}
            label={label}
            options={teamTasks.filter(tt => existingFilters.indexOf(tt.node?.dbid.toString()) === -1).map(tt => ({
              label: tt.node.label,
              value: tt.node.dbid.toString(),
              icon: icons[tt.node.type],
              checkedIcon: icons[tt.node.type],
            }))}
            single
            onChange={val => handleSelectMetadataField(val, i)}
            onRemove={() => handleRemoveFilter(i)}
          />
        )}
      </FormattedMessage>
    );
  });

  return (
    <>
      { filterFields.filter(ff => ff !== null).map((component, index) => {
        const key = filters[index]?.id || 'new-filter';
        if (index > 0) {
          return (
            <React.Fragment key={key}>
              { operatorToggle }
              { component }
            </React.Fragment>
          );
        }

        return (
          <span key={key}>
            { component }
          </span>
        );
      })}
    </>
  );
};

const CustomFiltersManager = ({
  hide,
  intl,
  onFilterChange,
  operatorToggle,
  query,
  team,
}) => {
  const teamSlug = team.slug;
  // Keep random argument in state so it's generated only once when component is mounted (CHECK-2366)
  const [random] = React.useState(String(Math.random()));
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query CustomFiltersManagerQuery($teamSlug: String!, $random: String!) {
          team(slug: $teamSlug, random: $random) {
            id
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
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <CustomFiltersManagerComponent
              hide={hide}
              intl={intl}
              operatorToggle={operatorToggle}
              query={query}
              team={props.team}
              onFilterChange={onFilterChange}
            />
          );
        }
        // TODO: We need a better error handling in the future, standardized with other components
        return <Loader size="icon" theme="grey" variant="icon" />;
      }}
      variables={{
        teamSlug,
        random,
      }}
    />
  );
};

CustomFiltersManager.defaultProps = {
  hide: false,
};

CustomFiltersManager.propTypes = {
  hide: PropTypes.bool,
  team: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  operatorToggle: PropTypes.func.isRequired,
  query: PropTypes.shape({
    team_tasks: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      response: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
      ]),
      task_type: PropTypes.string,
    })),
  }).isRequired,
};

// eslint-disable-next-line import/no-unused-modules
export { CustomFiltersManagerComponent as CustomFiltersManagerTest };

export default injectIntl(CustomFiltersManager);
