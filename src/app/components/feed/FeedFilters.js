import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ClearIcon from '@material-ui/icons/Clear';
import AddFilterMenu from '../search/AddFilterMenu';
import NumericRangeFilter from '../search/NumericRangeFilter';
import DateRangeFilter from '../search/DateRangeFilter';

const useStyles = makeStyles(theme => ({
  flex: {
    gap: `${theme.spacing(1)}px`,
    flexWrap: 'wrap',
  },
}));

const FeedFilters = ({ onSubmit, currentFilters }) => {
  const [filters, setFilters] = React.useState({ ...currentFilters });
  const classes = useStyles();

  const handleAddFilter = (filter) => {
    const newFilters = { ...filters };
    if (!newFilters[filter]) {
      newFilters[filter] = null;
      setFilters(newFilters);
    }
  };

  const handleRemoveFilter = (filter) => {
    const newFilters = { ...filters };
    if (Object.keys(newFilters).includes(filter)) {
      delete newFilters[filter];
      setFilters(newFilters);
    }
  };

  const handleSubmit = () => {
    onSubmit(filters);
  };

  const handleClear = () => {
    onSubmit({});
  };

  const handleNumericRange = (filter, value) => {
    const newFilters = { ...filters };
    const min = value.min ? parseInt(value.min, 10) : null;
    const max = value.max ? parseInt(value.max, 10) : null;
    newFilters[filter] = { min, max };
    setFilters(newFilters);
  };

  const handleDateRange = (value) => {
    const newFilters = { ...filters };
    newFilters.range = { ...value };
    setFilters(newFilters);
  };

  let filtersCount = 0;

  return (
    <Box display="flex" p={2} pt={0} className={classes.flex}>
      {Object.keys(filters).map((filter) => {
        const value = filters[filter];

        if (filter === 'linked_items_count') {
          filtersCount += 1;
          return (
            <NumericRangeFilter
              key={filter}
              filterKey="linked_items_count"
              onChange={handleNumericRange}
              value={value}
              onRemove={() => handleRemoveFilter('linked_items_count')}
            />
          );
        }

        if (filter === 'demand') {
          filtersCount += 1;
          return (
            <NumericRangeFilter
              key={filter}
              filterKey="demand"
              onChange={handleNumericRange}
              value={value}
              onRemove={() => handleRemoveFilter('demand')}
            />
          );
        }

        if (filter === 'range') {
          filtersCount += 1;
          return (
            <DateRangeFilter
              key={filter}
              filterKey="range"
              onChange={handleDateRange}
              value={value || { request_created_at: {} }}
              optionsToHide={['created_at', 'media_published_at', 'updated_at', 'report_published_at']}
              onRemove={() => handleRemoveFilter('range')}
            />
          );
        }

        return null;
      })}
      <AddFilterMenu
        team={{}}
        showOptions={['linked_items_count', 'demand', 'range']}
        addedFields={Object.keys(filters)}
        onSelect={handleAddFilter}
      />
      <Tooltip title={<FormattedMessage id="feedFilters.applyFilters" defaultMessage="Apply filter" description="Button to perform query with specified filters" />}>
        <IconButton id="search-fields__submit-button" onClick={handleSubmit} size="small">
          <PlayArrowIcon color="primary" />
        </IconButton>
      </Tooltip>
      { filtersCount > 0 ? (
        <Tooltip title={<FormattedMessage id="feedFilters.clear" defaultMessage="Clear filters" description="Tooltip for button to remove any applied filters" />}>
          <IconButton id="search-fields__clear-button" onClick={handleClear} size="small">
            <ClearIcon color="primary" />
          </IconButton>
        </Tooltip>
      ) : null }
    </Box>
  );
};

FeedFilters.defaultProps = {
  currentFilters: {},
};

FeedFilters.propTypes = {
  currentFilters: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default FeedFilters;
