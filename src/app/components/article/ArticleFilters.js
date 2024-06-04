import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import Divider from '@material-ui/core/Divider';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddFilterMenu from '../search/AddFilterMenu';
import MultiSelectFilter from '../search/MultiSelectFilter';
import SearchFieldUser from '../search/SearchFields/SearchFieldUser';
import SearchFieldTag from '../search/SearchFields/SearchFieldTag';
import DateRangeFilter from '../search/DateRangeFilter';
import LanguageFilter from '../search/LanguageFilter';
import PersonIcon from '../../icons/person.svg';
import DescriptionIcon from '../../icons/description.svg';
import styles from '../search/SearchResults.module.css';
import searchStyles from '../search/search.module.css';

const messages = defineMessages({
  explainer: {
    id: 'articleFilters.explainer',
    defaultMessage: 'Explainer',
    description: 'Describes the article type Explainer',
  },
  factCheck: {
    id: 'articleFilters.factCheck',
    defaultMessage: 'Fact-Check',
    description: 'Describes the article type Fact-Check',
  },
});

const ArticleFilters = ({
  type,
  onSubmit,
  filterOptions,
  currentFilters,
  teamSlug,
  className,
  extra,
  intl,
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

  const filterConnector = (
    <ButtonMain
      className="int-search-fields__button--and-operator"
      variant="contained"
      size="small"
      theme="lightBrand"
      customStyle={{ fontWeight: 'bold' }}
      label={<FormattedMessage id="search.connectorAnd" defaultMessage="and" description="Logical operator 'AND' to be applied when filtering articles by multiple fields." />}
    />
  );

  return (
    <div className={cx(styles['search-results-top'], className)}>
      { extra ? <div className={searchStyles['filters-wrapper']}>{extra}</div> : null }
      <div className={searchStyles['filters-wrapper']}>
        {Object.keys(filters).map((filter, i) => {
          const value = filters[filter];
          const connector = ((i === 0) ? null : filterConnector);

          if (filter === 'users') {
            return (
              <>
                {connector}
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
              </>
            );
          }

          if (filter === 'tags') {
            return (
              <>
                {connector}
                <SearchFieldTag
                  teamSlug={teamSlug}
                  query={value ? filters : { tags: [] }}
                  onChange={(newValue) => { handleOptionChange('tags', newValue); }}
                  onRemove={() => handleRemoveFilter('tags')}
                />
              </>
            );
          }

          if (filter === 'range') {
            return (
              <>
                {connector}
                <DateRangeFilter
                  key={filter}
                  filterKey="range"
                  onChange={handleDateRange}
                  value={value || { updated_at: {} }}
                  optionsToHide={['created_at', 'media_published_at', 'report_published_at', 'request_created_at']}
                  onRemove={() => handleRemoveFilter('range')}
                />
              </>
            );
          }

          if (filter === 'article_type') {
            return (
              <>
                {connector}
                <MultiSelectFilter
                  allowSearch={false}
                  label={<FormattedMessage id="articleFilters.articleType" defaultMessage="Article type is" description="Prefix label for field to filter by article type." />}
                  icon={<DescriptionIcon />}
                  selected={[type]}
                  options={[
                    { value: 'explainer', label: intl.formatMessage(messages.explainer) },
                    { value: 'fact-check', label: intl.formatMessage(messages.factCheck) },
                  ]}
                  readOnly
                />
              </>
            );
          }

          if (filter === 'language_filter') {
            return (
              <>
                {connector}
                <LanguageFilter
                  onChange={(newValue) => { handleOptionChange('language_filter', newValue); }}
                  value={value}
                  onRemove={() => handleRemoveFilter('language_filter')}
                  teamSlug={teamSlug}
                  optionsToHide={['request_language', 'language']}
                />
              </>
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
        { Object.keys(filters).length > 1 && ( // Filter by article type is fixed
          <>
            <Divider orientation="vertical" flexItem style={{ margin: '0 8px' }} />
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
            />
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
          </>
        )}
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
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  filterOptions: PropTypes.arrayOf(PropTypes.string.isRequired),
  currentFilters: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  teamSlug: PropTypes.string.isRequired,
  className: PropTypes.string,
  extra: PropTypes.node,
  intl: intlShape.isRequired,
};

export default injectIntl(ArticleFilters);
