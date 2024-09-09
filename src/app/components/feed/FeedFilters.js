/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ListSort, { sortLabels } from '../cds/inputs/ListSort';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import HowToRegIcon from '../../icons/person_check.svg';
import DescriptionIcon from '../../icons/description.svg';
import AddFilterMenu from '../search/AddFilterMenu';
import NumericRangeFilter from '../search/NumericRangeFilter';
import DateRangeFilter from '../search/DateRangeFilter';
import MultiSelectFilter from '../search/MultiSelectFilter';
import SearchFieldChannel from '../search/SearchFields/SearchFieldChannel';
import { withSetFlashMessage } from '../FlashMessage';
import searchStyles from '../search/search.module.css';

const messages = defineMessages({
  mediaTypeAudio: {
    id: 'feedFilters.mediaTypeAudio',
    defaultMessage: 'Audio',
    description: 'Describes a media type.',
  },
  mediaTypeImage: {
    id: 'feedFilters.mediaTypeImage',
    defaultMessage: 'Image',
    description: 'Describes a media type.',
  },
  mediaTypeVideo: {
    id: 'feedFilters.mediaTypeVideo',
    defaultMessage: 'Video',
    description: 'Describes a media type.',
  },
  mediaTypeText: {
    id: 'feedFilters.mediaTypeText',
    defaultMessage: 'Text',
    description: 'Describes a media type.',
  },
  mediaTypeLink: {
    id: 'feedFilters.mediaTypeLink',
    defaultMessage: 'Link',
    description: 'Describes a media type.',
  },
});

const FeedFilters = ({
  currentFilters,
  disableSave,
  extra,
  feed,
  feedTeam,
  filterOptions,
  intl,
  onChangeSort,
  onSubmit,
  setFlashMessage,
  sort,
  sortType,
}) => {
  const [filters, setFilters] = React.useState({ ...currentFilters });

  const handleError = () => {
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Could not save filters, please try again"
        description="Error message displayed when it's not possible to save feed requests filters"
        id="feedFilters.defaultErrorMessage"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Filters saved successfully"
        description="Success message displayed when feed requests filters are saved"
        id="feedFilters.savedSuccessfully"
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

  const sortOptions = [
    { value: 'requests_count', label: intl.formatMessage(sortLabels.sortRequestsCount) },
    { value: 'title', label: intl.formatMessage(sortLabels.sortTitle) },
    { value: 'media_count', label: intl.formatMessage(sortLabels.sortMediaCount) },
    { value: 'last_request_date', label: intl.formatMessage(sortLabels.sortUpdated) },
  ];
  if (feed.data_points?.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS)) {
    sortOptions.push({ value: 'fact_checks_count', label: intl.formatMessage(sortLabels.sortFactChecksCount) });
  }

  return (
    <>
      { extra ? <div className={searchStyles['filters-wrapper']}>{extra}</div> : null }
      <div className={searchStyles['filters-wrapper']}>
        <ListSort
          className={searchStyles['filters-sorting']}
          options={sortOptions}
          sort={sort}
          sortType={sortType}
          onChange={onChangeSort}
        />
        {Object.keys(filters).map((filter) => {
          const value = filters[filter];

          if (filter === 'linked_items_count') {
            return (
              <NumericRangeFilter
                filterKey="linked_items_count"
                key={filter}
                value={value}
                onChange={handleNumericRange}
                onRemove={() => handleRemoveFilter('linked_items_count')}
              />
            );
          }

          if (filter === 'demand') {
            return (
              <NumericRangeFilter
                filterKey="demand"
                key={filter}
                value={value}
                onChange={handleNumericRange}
                onRemove={() => handleRemoveFilter('demand')}
              />
            );
          }

          if (filter === 'range') {
            return (
              <DateRangeFilter
                filterKey="range"
                key={filter}
                optionsToHide={['created_at', 'media_published_at', 'report_published_at', 'request_created_at']}
                value={value || { request_created_at: {} }}
                onChange={handleDateRange}
                onRemove={() => handleRemoveFilter('range')}
              />
            );
          }

          if (filter === 'feed_fact_checked_by') {
            return (
              <MultiSelectFilter
                allowSearch={false}
                icon={<HowToRegIcon />}
                key={filter}
                label={<FormattedMessage defaultMessage="Fact-checked by" description="Field label for feed filter" id="feedFilters.factCheckedBy" />}
                options={[
                  { key: 'ANY', label: <FormattedMessage defaultMessage="Any organization" description="Filter option for feed filter 'Fact-checked by'" id="feedFilters.factCheckByAny" />, value: 'ANY' },
                  { key: 'NONE', label: <FormattedMessage defaultMessage="No organization" description="Filter option for feed filter 'Fact-checked by'" id="feedFilters.factCheckByNone" />, value: 'NONE' },
                ]}
                selected={['ANY', 'NONE'].includes(value) ? [value] : []}
                single
                onChange={newValue => handleOptionChange('feed_fact_checked_by', newValue)}
                onRemove={() => handleRemoveFilter('feed_fact_checked_by')}
              />
            );
          }

          if (filter === 'channels') {
            return (
              <SearchFieldChannel
                key={filter}
                page="feed"
                query={{ channels: value }}
                onChange={newValue => handleOptionChange('channels', newValue)}
                onRemove={() => handleRemoveFilter('channels')}
              />
            );
          }

          if (filter === 'show') {
            return (
              <MultiSelectFilter
                allowSearch={false}
                icon={<DescriptionIcon />}
                label={<FormattedMessage defaultMessage="Media (type)" description="Field label for feed filter" id="feedFilters.mediaType" />}
                options={[
                  { value: 'UploadedAudio', label: intl.formatMessage(messages.mediaTypeAudio) },
                  { value: 'UploadedImage', label: intl.formatMessage(messages.mediaTypeImage) },
                  { value: 'UploadedVideo', label: intl.formatMessage(messages.mediaTypeVideo) },
                  { value: 'Claim', label: intl.formatMessage(messages.mediaTypeText) },
                  { value: 'Link', label: intl.formatMessage(messages.mediaTypeLink) },
                ]}
                selected={value || []}
                onChange={newValue => handleOptionChange('show', newValue)}
                onRemove={() => handleRemoveFilter('show')}
              />
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
        { Object.keys(filters).length > 0 ?
          <div className={cx(searchStyles['filters-buttons-wrapper'], searchStyles['filters-buttons-wrapper-visible'])}>
            <ButtonMain
              buttonProps={{
                id: 'search-fields__submit-button',
              }}
              className="int-search-fields__button--apply-feedfilter"
              label={
                <FormattedMessage defaultMessage="Apply" description="Button to perform query with specified filters" id="feedFilters.applyFilters" />
              }
              size="default"
              theme="lightValidation"
              variant="contained"
              onClick={handleSubmit}
            />
            <ButtonMain
              buttonProps={{
                id: 'search-fields__clear-button',
              }}
              className="int-search-fields__button--reset-feedfilter"
              label={
                <FormattedMessage defaultMessage="Reset" description="Tooltip for button to remove any applied filters" id="feedFilters.reset" />
              }
              size="default"
              theme="lightText"
              variant="contained"
              onClick={handleClear}
            />
          </div>
          : null }
        { disableSave ?
          <ButtonMain
            buttonProps={{
              id: 'save-list__button',
            }}
            label={
              <FormattedMessage
                defaultMessage="Save"
                description="'Save filters' here are in infinitive form - it's a button label, to save the current set of filters applied to a search result as feed requests filters."
                id="feedFilters.saveFilters"
              />
            }
            size="default"
            theme="lightInfo"
            variant="contained"
            onClick={handleSaveFilters}
          />
          : null }
      </div>
    </>
  );
};

FeedFilters.defaultProps = {
  filterOptions: [],
  currentFilters: {},
  disableSave: false,
  extra: null,
};

FeedFilters.propTypes = {
  filterOptions: PropTypes.arrayOf(PropTypes.string.isRequired),
  currentFilters: PropTypes.object,
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    requests_filters: PropTypes.object,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disableSave: PropTypes.bool,
  extra: PropTypes.node,
  intl: intlShape.isRequired,
};

export default withSetFlashMessage(injectIntl(FeedFilters));
