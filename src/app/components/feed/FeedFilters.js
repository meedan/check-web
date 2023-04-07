import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import ListIcon from '@material-ui/icons/List';
import ClearIcon from '../../icons/clear.svg';
import AddFilterMenu from '../search/AddFilterMenu';
import NumericRangeFilter from '../search/NumericRangeFilter';
import DateRangeFilter from '../search/DateRangeFilter';
import MultiSelectFilter from '../search/MultiSelectFilter';
import { withSetFlashMessage } from '../FlashMessage';

const useStyles = makeStyles(theme => ({
  flex: {
    gap: `${theme.spacing(1)}px`,
    flexWrap: 'wrap',
  },
  saveButton: {
    color: 'var(--brandMain)',
  },
}));

const FeedFilters = ({
  onSubmit,
  currentFilters,
  feedTeam,
  setFlashMessage,
}) => {
  const [filters, setFilters] = React.useState({ ...currentFilters });
  const classes = useStyles();

  const handleError = () => {
    setFlashMessage((
      <FormattedMessage
        id="feedFilters.defaultErrorMessage"
        defaultMessage="Could not save filters, please try again"
        description="Error message displayed when it's not possible to save feed requests filters"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setFlashMessage((
      <FormattedMessage
        id="feedFilters.savedSuccessfully"
        defaultMessage="Filters saved successfully"
        description="Success message displayed when feed requests filters are saved"
      />
    ), 'success');
  };

  const handleSaveFilters = () => {
    const filtersToSave = { ...filters };
    delete filtersToSave.page;

    const mutation = graphql`
      mutation FeedFiltersUpdateFeedTeamMutation($input: UpdateFeedTeamInput!) {
        updateFeedTeam(input: $input) {
          feed_team {
            requests_filters
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: feedTeam.id,
          requests_filters: JSON.stringify(filtersToSave),
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

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

  const handleOptionChange = (filter, value) => {
    const newFilters = { ...filters };
    newFilters[filter] = value;
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

        if (filter === 'feed_fact_checked_by') {
          filtersCount += 1;
          return (
            <MultiSelectFilter
              key={filter}
              label={<FormattedMessage id="feedFilters.factCheckedBy" defaultMessage="Fact-checked by" description="Field label for feed filter" />}
              icon={<HowToRegIcon />}
              selected={['ANY', 'NONE'].includes(value) ? [value] : []}
              options={[
                { key: 'ANY', label: <FormattedMessage id="feedFilters.factCheckByAny" defaultMessage="Any organization" description="Filter option for feed filter 'Fact-checked by'" />, value: 'ANY' },
                { key: 'NONE', label: <FormattedMessage id="feedFilters.factCheckByNone" defaultMessage="No organization" description="Filter option for feed filter 'Fact-checked by'" />, value: 'NONE' },
              ]}
              onChange={newValue => handleOptionChange('feed_fact_checked_by', newValue)}
              onRemove={() => handleRemoveFilter('feed_fact_checked_by')}
              allowSearch={false}
              single
            />
          );
        }

        return null;
      })}
      <AddFilterMenu
        team={{}}
        showOptions={['linked_items_count', 'demand', 'range', 'feed_fact_checked_by']}
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
      <Button
        id="save-list__button"
        className={classes.saveButton}
        startIcon={<ListIcon />}
        onClick={handleSaveFilters}
      >
        <FormattedMessage
          id="feedFilters.saveFilters"
          defaultMessage="Save filters"
          description="'Save filters' here are in infinitive form - it's a button label, to save the current set of filters applied to a search result as feed requests filters."
        />
      </Button>
    </Box>
  );
};

FeedFilters.defaultProps = {
  currentFilters: {},
};

FeedFilters.propTypes = {
  currentFilters: PropTypes.object,
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    requests_filters: PropTypes.object,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default withSetFlashMessage(FeedFilters);
