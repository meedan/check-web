import React from 'react';
import CustomTeamTaskFilter from './CustomTeamTaskFilter';

const CustomFiltersManager = ({
  team,
  onFilterChange,
  query,
}) => {
  const handleTeamTaskFilterChange = (teamTaskFilter, index) => {
    const newQuery = {};
    newQuery.team_tasks = query.team_tasks ? [...query.team_tasks] : [];
    newQuery.team_tasks.splice(index, 1, teamTaskFilter);
    onFilterChange(newQuery);
  };

  const handleAddFilter = () => {
    const newQuery = {};
    newQuery.team_tasks = query.team_tasks ?
      [...query.team_tasks, {}] : [{}, {}];
    onFilterChange(newQuery);
  };

  const handleRemoveFilter = (index) => {
    const newQuery = {};
    newQuery.team_tasks = query.team_tasks ? [...query.team_tasks] : [];
    newQuery.team_tasks.splice(index, 1);
    onFilterChange(newQuery);
  };

  const filters = query.team_tasks ? query.team_tasks : [{}];

  return (
    <div>
      {
        filters.map((ttf, i) => (
          <CustomTeamTaskFilter
            key={ttf.id || `uncommitted-filter-${i}`}
            filter={ttf}
            index={i}
            onAdd={handleAddFilter}
            onRemove={filters.length > 1 ? handleRemoveFilter : () => {}}
            onFilterChange={handleTeamTaskFilterChange}
            team={team}
          />
        ))
      }
    </div>
  );
};

export default CustomFiltersManager;
