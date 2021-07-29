import React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import StarIcon from '@material-ui/icons/Star';
import MultiSelectFilter from './MultiSelectFilter';
import CustomTeamTaskFilter from './CustomTeamTaskFilter';

const CustomFiltersManager = ({
  hide,
  team,
  onFilterChange,
  query,
}) => {
  if (hide) { return null; }
  console.log('team', team);

  const handleTeamTaskFilterChange = (teamTaskFilter, index) => {
    console.log('teamTaskFilter', teamTaskFilter);
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
    console.log('val', val);
    const teamTask = team.team_tasks.edges.find(tt => tt.node.dbid.toString() === val);
    console.log('teamTask', teamTask);
    // daqui se deriva dbid (val) e task type e response_type
    handleTeamTaskFilterChange({ id: val, response_type: 'choice' }, index);
  };

  const filters = query.team_tasks && query.team_tasks.length > 0 ? query.team_tasks : [{}];

  return filters.map((filter, i) => {
    if (filter.response_type === 'choice') { // TODO: Have each metadata/task type return its appropriate widget (e.g.: choice/date/location/number)
      const teamTask = team.team_tasks.edges.find(tt => tt.node.dbid.toString() === filter.id);

      return (
        <MultiSelectFilter
          label={teamTask.node.label}
          icon={<StarIcon />} // TODO: Change icon based on team_task.node.type
          options={teamTask.node.options.map(tt => ({ label: tt.label, value: tt.label }))}
          onChange={() => {}}
        />
      );
    }

    if (filter.response_type) {
      return (
        <CustomTeamTaskFilter
          key={filter.id || `uncommitted-filter-${i}`}
          filter={filter}
          index={i}
          onRemove={() => handleRemoveFilter(i)}
          onFilterChange={handleTeamTaskFilterChange}
          team={team}
        />
      );
    }

    return (
      <FormattedMessage id="customFiltersManager.label" defaultMessage="Metadata is" description="Placeholder label for metadata field when not fully configured">
        { label => (
          <MultiSelectFilter
            label={label}
            icon={<StarIcon />}
            selected={[]}
            options={team.team_tasks.edges.map(tt => ({ label: tt.node.label, value: tt.node.dbid.toString() }))}
            onChange={val => handleSelectMetadataField(val, i)}
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
      response_type: PropTypes.string,
    })),
  }).isRequired,
};

export default createFragmentContainer(CustomFiltersManager, graphql`
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
