import React from 'react';
import { FormattedMessage } from 'react-intl';
import CustomTeamTaskFilter from './CustomTeamTaskFilter';
import { StyledFilterRow } from './SearchQueryComponent';

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

    // Scroll to the bottom
    setTimeout(() => {
      const modal = document.getElementById('search__query-dialog-content');
      if (modal) {
        modal.scrollTop = modal.scrollHeight;
      }
    }, 500);
  };

  const handleRemoveFilter = (index) => {
    const newQuery = {};
    newQuery.team_tasks = query.team_tasks ? [...query.team_tasks] : [];
    newQuery.team_tasks.splice(index, 1);
    onFilterChange(newQuery);
  };

  const filters = query.team_tasks ? query.team_tasks : [{}];

  return (
    <React.Fragment>
      <StyledFilterRow>
        <h4><FormattedMessage id="CustomFiltersManager.addFilters" defaultMessage="Add filters" /></h4>
      </StyledFilterRow>
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
    </React.Fragment>
  );
};

export default CustomFiltersManager;
