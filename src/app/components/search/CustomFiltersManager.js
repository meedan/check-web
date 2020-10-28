import React from 'react';
import PropTypes from 'prop-types';
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
    }, 100);
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
        filters.map((filter, i) => (
          <CustomTeamTaskFilter
            key={filter.id || `uncommitted-filter-${i}`}
            filter={filter}
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

CustomFiltersManager.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  query: PropTypes.shape({
    team_tasks: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      response: PropTypes.string,
      response_type: PropTypes.string,
    })),
  }).isRequired,
  team: PropTypes.object.isRequired,
};

export default CustomFiltersManager;
