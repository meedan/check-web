import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
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
import SaveList from '../search/SaveList';
import PersonIcon from '../../icons/person.svg';
import HowToRegIcon from '../../icons/person_check.svg';
import DescriptionIcon from '../../icons/description.svg';
import LabelIcon from '../../icons/label.svg';
import ReportIcon from '../../icons/playlist_add_check.svg';
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
  onSubmit,
  pageName,
  savedSearch,
  statuses,
  team,
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
    const newFilters = { ...filters };
    // Creator filter called `users` and mapped to `user_ids` for article filters so no need to keep the `user_ids` when save article filters.
    if (newFilters.user_ids) {
      delete newFilters.user_ids;
    }
    setFilters(newFilters);
    onSubmit(newFilters);
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
      className={cx('int-search-fields__button--and-operator', searchStyles['filter-toggle-and-or-operator'])}
      label={<FormattedMessage defaultMessage="and" description="Logical operator 'AND' to be applied when filtering articles by multiple fields." id="search.connectorAnd" />}
      size="small"
      theme="lightInfo"
      variant="contained"
    />
  );

  // We can apply if the state query is dirty (differs from what is applied)
  const canApply = JSON.stringify(filters) !== JSON.stringify(currentFilters);

  // We can reset if have applied filters or the state query is dirty
  const canSave = JSON.stringify(currentFilters) !== JSON.stringify(defaultFilters);

  const canReset = canApply || canSave;

  return (
    <>
      { extra ? <div className={searchStyles['filters-wrapper']}>{extra}</div> : null }
      <div className={searchStyles['filters-wrapper']}>
        {Object.keys(filters).map((filter, i) => {
          const value = filters[filter];
          const connector = ((i === 0) ? null : filterConnector);

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
                      teamSlug={team.slug}
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
                  teamSlug={team.slug}
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
                  optionsToHide={['media_published_at', 'report_published_at', 'request_created_at']}
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
                  selected={value || []}
                  single
                  onChange={(newValue) => { handleOptionChange('article_type', newValue); }}
                  onRemove={() => handleRemoveFilter('article_type')}
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
                  teamSlug={team.slug}
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
                      teamSlug={team.slug}
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

          if (filter === 'channels') {
            return (
              <React.Fragment key={filter}>
                {connector}
                <MultiSelectFilter
                  icon={<DescriptionIcon />}
                  label={<FormattedMessage defaultMessage="Article channel is" description="Prefix label for field to filter by article channel." id="articleFilters.articleChannel" />}
                  options={[
                    { value: 'api', label: 'API' },
                    { value: 'manual', label: 'Manual' },
                    { value: 'imported', label: 'Batch' },
                    { value: 'zapier', label: 'Zapier' },
                  ]}
                  readOnly={Boolean(defaultFilters.channels)}
                  selected={value || []}
                  onChange={newValue => handleOptionChange('channels', newValue)}
                  onRemove={() => handleRemoveFilter('channels')}
                />
              </React.Fragment>
            );
          }

          return null;
        })}
        <AddFilterMenu
          addedFields={Object.keys(filters)}
          showOptions={filterOptions.concat(['article_type'])}
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
            { canSave && (
              <SaveList
                listType="article"
                page={pageName}
                query={filters}
                routePrefix="articles"
                savedSearch={savedSearch}
                team={team}
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
  savedSearch: null,
};

ArticleFilters.propTypes = {
  articleTypeReadOnly: PropTypes.bool,
  currentFilters: PropTypes.object,
  defaultFilters: PropTypes.object,
  extra: PropTypes.node,
  filterOptions: PropTypes.arrayOf(PropTypes.string.isRequired),
  intl: intlShape.isRequired,
  pageName: PropTypes.oneOf(['all-items', 'imported-fact-checks', 'fact-checks', 'explainers', 'published', 'articles', 'trash']).isRequired,
  savedSearch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }),
  statuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default createFragmentContainer(injectIntl(ArticleFilters), graphql`
  fragment ArticleFilters_team on Team {
    ...SaveList_team
  }
`);
