import React from 'react';
import PropTypes from 'prop-types';
import CustomTeamTaskFilter from './CustomTeamTaskFilter';

const CustomFiltersManager = ({
  hide,
  team,
  onFilterChange,
  query,
}) => {
  if (hide) { return null; }

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
    onFilterChange(newQuery);
  };

  const filters = query.team_tasks && query.team_tasks.length > 0 ? query.team_tasks : [{}];

  return filters.map((filter, i) => (
    <CustomTeamTaskFilter
      key={filter.id || `uncommitted-filter-${i}`}
      filter={filter}
      index={i}
      onRemove={() => handleRemoveFilter(i)}
      onFilterChange={handleTeamTaskFilterChange}
      team={team}
    />
  ));
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

export default CustomFiltersManager;
