import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import CustomTeamTaskFilter from './CustomTeamTaskFilter';

const useStyles = makeStyles({
  root: {
    zIndex: 1000,
  },
  paper: {
    maxWidth: '360px',
  },
});

const useStylesButton = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: '#ddd',
    },
  },
  text: {
    backgroundColor: '#ddd',
  },
  label: {
    textTransform: 'none',
    fontWeight: 'normal',
  },
});

const CustomFiltersManager = ({
  team,
  onFilterChange,
  query,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles();
  const classesButton = useStylesButton();

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
      <Button
        classes={classesButton}
        onClick={e => setAnchorEl(e.currentTarget)}
        disableRipple
      >
        <FormattedMessage
          id="customFiltersManager.label"
          defaultMessage="Custom fields"
        />
      </Button>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        classes={classes}
        onClose={() => setAnchorEl(null)}
        open={Boolean(anchorEl)}
      >
        <Box width={360} p={2}>
          { filters.map((filter, i) => (
            <CustomTeamTaskFilter
              key={filter.id || `uncommitted-filter-${i}`}
              filter={filter}
              index={i}
              onAdd={handleAddFilter}
              onRemove={filters.length > 1 ? handleRemoveFilter : () => {}}
              onFilterChange={handleTeamTaskFilterChange}
              team={team}
            />))
          }
        </Box>
      </Popover>
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
