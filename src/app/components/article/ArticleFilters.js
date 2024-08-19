/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddFilterMenu from '../search/AddFilterMenu';
import MultiSelectFilter from '../search/MultiSelectFilter';
import SearchFieldUser from '../search/SearchFields/SearchFieldUser';
import SearchFieldTag from '../search/SearchFields/SearchFieldTag';
import DateRangeFilter from '../search/DateRangeFilter';
import LanguageFilter from '../search/LanguageFilter';
import PersonIcon from '../../icons/person.svg';
import HowToRegIcon from '../../icons/person_check.svg';
import DescriptionIcon from '../../icons/description.svg';
import LabelIcon from '../../icons/label.svg';
import ReportIcon from '../../icons/playlist_add_check.svg';
import SearchFieldChannel from '../search/SearchFields/SearchFieldChannel';
import CheckChannels from '../../CheckChannels';
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
  currentFilters,
  defaultFilters,
  extra,
  filterOptions,
  intl,
  onSubmit,
  statuses,
  teamSlug,
  type,
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

  const handleReset = () => {
    onSubmit({ ...defaultFilters });
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

  // We can apply if the state query is dirty (differs from what is applied)
  const canApply = JSON.stringify(filters) !== JSON.stringify(currentFilters);

  // We can reset if have applied filters or the state query is dirty
  const canReset = JSON.stringify(currentFilters) !== JSON.stringify(defaultFilters) || canApply;

  return (
    <>
      { extra ? <div className={searchStyles['filters-wrapper']}>{extra}</div> : null }
      <div className={searchStyles['filters-wrapper']}>
        {Object.keys(filters).map((filter, i) => {
          const value = filters[filter];
          const connector = ((i === 0) ? null : filterConnector);

          if (filter === 'imported') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <SearchFieldChannel
                  // Little hack here to hardcode the channel for imported articles
                  query={{ channels: value && CheckChannels.FETCH }}
                  onChange={newValue => handleOptionChange('channels', newValue)}
                  onRemove={() => handleRemoveFilter('channels')}
                  readOnly
                />
              </React.Fragment>
            );
          }

          if (filter === 'users') {
            return (
              <React.Fragment key={filter}>
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
              </React.Fragment>
            );
          }

          if (filter === 'tags') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <SearchFieldTag
                  teamSlug={teamSlug}
                  query={value ? filters : { tags: [] }}
                  onChange={(newValue) => { handleOptionChange('tags', newValue); }}
                  onRemove={() => handleRemoveFilter('tags')}
                />
              </React.Fragment>
            );
          }

          if (filter === 'range') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <DateRangeFilter
                  filterKey="range"
                  onChange={handleDateRange}
                  value={value || { updated_at: {} }}
                  optionsToHide={['created_at', 'media_published_at', 'report_published_at', 'request_created_at']}
                  onRemove={() => handleRemoveFilter('range')}
                />
              </React.Fragment>
            );
          }

          if (filter === 'article_type') {
            return (
              <React.Fragment key={filter}>
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
              </React.Fragment>
            );
          }

          if (filter === 'language_filter') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <LanguageFilter
                  onChange={(newValue) => { handleOptionChange('language_filter', newValue); }}
                  value={value}
                  onRemove={() => handleRemoveFilter('language_filter')}
                  teamSlug={teamSlug}
                  optionsToHide={['request_language', 'language']}
                />
              </React.Fragment>
            );
          }

          if (filter === 'published_by') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <FormattedMessage id="articleFilters.publishedBy" defaultMessage="Publisher is" description="Prefix label for field to filter by published by">
                  { label => (
                    <SearchFieldUser
                      teamSlug={teamSlug}
                      label={label}
                      icon={<HowToRegIcon />}
                      selected={value || []}
                      value={value}
                      onChange={(newValue) => { handleOptionChange('published_by', newValue.map(userId => parseInt(userId, 10))); }}
                      onRemove={() => handleRemoveFilter('published_by')}
                    />
                  )}
                </FormattedMessage>
              </React.Fragment>
            );
          }

          if (filter === 'report_status') {
            const reportStatusOptions = [
              { label: <FormattedMessage id="articleFilters.reportStatusUnpublished" defaultMessage="Unpublished" description="Refers to a report status" />, value: 'unpublished' },
              { label: <FormattedMessage id="articleFilters.reportStatusPublished" defaultMessage="Published" description="Refers to a report status" />, value: 'published' },
              { label: <FormattedMessage id="articleFilters.reportStatusPaused" defaultMessage="Paused" description="Refers to a report status" />, value: 'paused' },
            ];
            return (
              <React.Fragment key={filter}>
                {connector}
                <FormattedMessage id="articleFilters.reportStatus" defaultMessage="Report (status) is" description="Prefix label for field to filter by report status">
                  { label => (
                    <MultiSelectFilter
                      allowSearch={false}
                      label={label}
                      icon={<ReportIcon />}
                      selected={value || []}
                      options={reportStatusOptions}
                      onChange={(newValue) => { handleOptionChange('report_status', newValue); }}
                      onRemove={() => handleRemoveFilter('report_status')}
                      readOnly={!!defaultFilters.report_status}
                    />
                  )}
                </FormattedMessage>
              </React.Fragment>
            );
          }

          if (filter === 'verification_status') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <FormattedMessage id="search.statusHeading" defaultMessage="Rating is" description="Prefix label for field to filter by status">
                  { label => (
                    <MultiSelectFilter
                      label={label}
                      icon={<LabelIcon />}
                      selected={value || []}
                      options={statuses.map(s => ({ label: s.label, value: s.id }))}
                      onChange={(newValue) => { handleOptionChange('verification_status', newValue); }}
                      onRemove={() => handleRemoveFilter('verification_status')}
                    />
                  )}
                </FormattedMessage>
              </React.Fragment>
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
        { canReset && (
          <div className={cx(searchStyles['filters-buttons-wrapper'], searchStyles['filters-buttons-wrapper-visible'])}>
            { canApply && (
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
            )}
            { canReset && (
              <ButtonMain
                className="int-search-fields__button--reset-articlefilter"
                variant="contained"
                size="default"
                theme="lightText"
                onClick={handleReset}
                label={
                  <FormattedMessage id="articleFilters.reset" defaultMessage="Reset" description="Tooltip for button to remove any applied filters" />
                }
                buttonProps={{
                  id: 'search-fields__clear-button',
                }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

ArticleFilters.defaultProps = {
  filterOptions: [],
  currentFilters: {},
  defaultFilters: {},
  extra: null,
};

ArticleFilters.propTypes = {
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  filterOptions: PropTypes.arrayOf(PropTypes.string.isRequired),
  currentFilters: PropTypes.object,
  defaultFilters: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  teamSlug: PropTypes.string.isRequired,
  statuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  extra: PropTypes.node,
  intl: intlShape.isRequired,
};

export default injectIntl(ArticleFilters);
