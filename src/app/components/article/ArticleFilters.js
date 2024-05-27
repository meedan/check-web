import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Divider from '@material-ui/core/Divider';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddFilterMenu from '../search/AddFilterMenu';
import SearchFieldUser from '../search/SearchFields/SearchFieldUser';
import SearchFieldTag from '../search/SearchFields/SearchFieldTag';
import DateRangeFilter from '../search/DateRangeFilter';
import PersonIcon from '../../icons/person.svg';
import styles from '../search/SearchResults.module.css';
import searchStyles from '../search/search.module.css';

const ArticleFilters = ({
  onSubmit,
  filterOptions,
  currentFilters,
  teamSlug,
  className,
  extra,
}) => {
  const [filters, setFilters] = React.useState({ ...currentFilters });

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

  return (
    <div className={cx(styles['search-results-top'], className)}>
      { extra ? <div className={searchStyles['filters-wrapper']}>{extra}</div> : null }
      <div className={searchStyles['filters-wrapper']}>
        {Object.keys(filters).map((filter) => {
          const value = filters[filter];

          if (filter === 'users') {
            return (
              <FormattedMessage id="articleFilters.createdBy" defaultMessage="Created by" description="Prefix label for field to filter by item creator.">
                { label => (
                  <SearchFieldUser
                    teamSlug={teamSlug}
                    label={label}
                    icon={<PersonIcon />}
                    selected={value || []}
                    value={value}
                    onChange={(newValue) => { handleOptionChange('users', newValue.map(userId => parseInt(userId, 10))); }}
                    onRemove={() => handleRemoveFilter('users')}
                  />
                )}
              </FormattedMessage>
            );
          }

          if (filter === 'tags') {
            return (
              <SearchFieldTag
                teamSlug={teamSlug}
                query={value ? filters : { tags: [] }}
                onChange={(newValue) => { handleOptionChange('tags', newValue); }}
                onRemove={() => handleRemoveFilter('tags')}
              />
            );
          }

          if (filter === 'range') {
            return (
              <DateRangeFilter
                key={filter}
                filterKey="range"
                onChange={handleDateRange}
                value={value || { updated_at: {} }}
                optionsToHide={['created_at', 'media_published_at', 'report_published_at', 'request_created_at']}
                onRemove={() => handleRemoveFilter('range')}
              />
            );
          }

          return null;
        })}
        <AddFilterMenu
          team={{}}
          showOptions={filterOptions}
          addedFields={Object.keys(filters)}
          onSelect={handleAddFilter}
        />
        <Divider orientation="vertical" flexItem style={{ margin: '0 8px' }} />
        { Object.keys(filters).length > 0 ?
          <ButtonMain
            className="int-search-fields__button--apply-articlefilter"
            variant="contained"
            size="default"
            theme="lightValidation"
            onClick={handleSubmit}
            label={
              <FormattedMessage id="articleFilters.applyFilters" defaultMessage="Apply" description="Button to perform query with specified filters" />
            }
            buttonProps={{
              id: 'search-fields__submit-button',
            }}
          /> : null }
        <ButtonMain
          className="int-search-fields__button--reset-articlefilter"
          variant="contained"
          size="default"
          theme="lightText"
          onClick={handleClear}
          label={
            <FormattedMessage id="articleFilters.reset" defaultMessage="Reset" description="Tooltip for button to remove any applied filters" />
          }
          buttonProps={{
            id: 'search-fields__clear-button',
          }}
        />
      </div>
    </div>
  );
};

ArticleFilters.defaultProps = {
  filterOptions: [],
  currentFilters: {},
  className: '',
  extra: null,
};

ArticleFilters.propTypes = {
  filterOptions: PropTypes.arrayOf(PropTypes.string.isRequired),
  currentFilters: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  teamSlug: PropTypes.string.isRequired,
  className: PropTypes.string,
  extra: PropTypes.node,
};

export default ArticleFilters;
