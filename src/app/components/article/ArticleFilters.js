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
  articleTypeReadOnly,
  currentFilters,
  defaultFilters,
  extra,
  filterOptions,
  intl,
  onChangeArticleType,
  onSubmit,
  statuses,
  teamSlug,
  type,
}) => {
  const [filters, setFilters] = React.useState({ ...currentFilters });

  const [typeFilter, setTypeFilter] = React.useState([type]);

  // handling the setting here before sending it up to the page to prevent the page from re-rendering with an empty article_type.
  const handleTypeFilter = (value) => {
    if (!value.length) {
      setTypeFilter([]);
    } else {
      onChangeArticleType(value);
    }
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
      customStyle={{ fontWeight: 'bold' }}
      label={<FormattedMessage defaultMessage="and" description="Logical operator 'AND' to be applied when filtering articles by multiple fields." id="search.connectorAnd" />}
      size="small"
      theme="lightInfo"
      variant="contained"
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
                  readOnly
                  onChange={newValue => handleOptionChange('channels', newValue)}
                  onRemove={() => handleRemoveFilter('channels')}
                />
              </React.Fragment>
            );
          }

          if (filter === 'users') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <FormattedMessage defaultMessage="Created by" description="Prefix label for field to filter by item creator." id="articleFilters.createdBy">
                  { label => (
                    <SearchFieldUser
                      icon={<PersonIcon />}
                      label={label}
                      selected={value || []}
                      teamSlug={teamSlug}
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
                  query={value ? filters : { tags: [] }}
                  teamSlug={teamSlug}
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
                  optionsToHide={['created_at', 'media_published_at', 'report_published_at', 'request_created_at']}
                  value={value || { updated_at: {} }}
                  onChange={handleDateRange}
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
                  icon={<DescriptionIcon />}
                  label={<FormattedMessage defaultMessage="Article type is" description="Prefix label for field to filter by article type." id="articleFilters.articleType" />}
                  options={[
                    { value: 'explainer', label: intl.formatMessage(messages.explainer) },
                    { value: 'fact-check', label: intl.formatMessage(messages.factCheck) },
                  ]}
                  readOnly={articleTypeReadOnly}
                  selected={typeFilter}
                  single
                  onChange={(newValue) => { handleTypeFilter(newValue); }}
                />
              </React.Fragment>
            );
          }

          if (filter === 'language_filter') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <LanguageFilter
                  optionsToHide={['request_language', 'language']}
                  teamSlug={teamSlug}
                  value={value}
                  onChange={(newValue) => { handleOptionChange('language_filter', newValue); }}
                  onRemove={() => handleRemoveFilter('language_filter')}
                />
              </React.Fragment>
            );
          }

          if (filter === 'published_by') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <FormattedMessage defaultMessage="Publisher is" description="Prefix label for field to filter by published by" id="articleFilters.publishedBy">
                  { label => (
                    <SearchFieldUser
                      icon={<HowToRegIcon />}
                      label={label}
                      selected={value || []}
                      teamSlug={teamSlug}
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
              { label: <FormattedMessage defaultMessage="Unpublished" description="Refers to a report status" id="articleFilters.reportStatusUnpublished" />, value: 'unpublished' },
              { label: <FormattedMessage defaultMessage="Published" description="Refers to a report status" id="articleFilters.reportStatusPublished" />, value: 'published' },
              { label: <FormattedMessage defaultMessage="Paused" description="Refers to a report status" id="articleFilters.reportStatusPaused" />, value: 'paused' },
            ];
            return (
              <React.Fragment key={filter}>
                {connector}
                <FormattedMessage defaultMessage="Report (status) is" description="Prefix label for field to filter by report status" id="articleFilters.reportStatus">
                  { label => (
                    <MultiSelectFilter
                      allowSearch={false}
                      icon={<ReportIcon />}
                      label={label}
                      options={reportStatusOptions}
                      readOnly={!!defaultFilters.report_status}
                      selected={value || []}
                      onChange={(newValue) => { handleOptionChange('report_status', newValue); }}
                      onRemove={() => handleRemoveFilter('report_status')}
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
                <FormattedMessage defaultMessage="Rating is" description="Prefix label for field to filter by status" id="search.statusHeading">
                  { label => (
                    <MultiSelectFilter
                      icon={<LabelIcon />}
                      label={label}
                      options={statuses.map(s => ({ label: s.label, value: s.id }))}
                      selected={value || []}
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
          addedFields={Object.keys(filters)}
          showOptions={filterOptions}
          team={{}}
          onSelect={handleAddFilter}
        />
        { canReset && (
          <div className={cx(searchStyles['filters-buttons-wrapper'], searchStyles['filters-buttons-wrapper-visible'])}>
            { canApply && (
              <ButtonMain
                buttonProps={{
                  id: 'search-fields__submit-button',
                }}
                className="int-search-fields__button--apply-articlefilter"
                label={
                  <FormattedMessage defaultMessage="Apply" description="Button to perform query with specified filters" id="articleFilters.applyFilters" />
                }
                size="default"
                theme="lightValidation"
                variant="contained"
                onClick={handleSubmit}
              />
            )}
            { canReset && (
              <ButtonMain
                buttonProps={{
                  id: 'search-fields__clear-button',
                }}
                className="int-search-fields__button--reset-articlefilter"
                label={
                  <FormattedMessage defaultMessage="Reset" description="Tooltip for button to remove any applied filters" id="articleFilters.reset" />
                }
                size="default"
                theme="lightText"
                variant="contained"
                onClick={handleReset}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

ArticleFilters.defaultProps = {
  articleTypeReadOnly: true,
  currentFilters: {},
  defaultFilters: {},
  extra: null,
  filterOptions: [],
  onChangeArticleType: null,
};

ArticleFilters.propTypes = {
  articleTypeReadOnly: PropTypes.bool,
  currentFilters: PropTypes.object,
  defaultFilters: PropTypes.object,
  extra: PropTypes.node,
  filterOptions: PropTypes.arrayOf(PropTypes.string.isRequired),
  intl: intlShape.isRequired,
  statuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  teamSlug: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  onChangeArticleType: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
};

export default injectIntl(ArticleFilters);
