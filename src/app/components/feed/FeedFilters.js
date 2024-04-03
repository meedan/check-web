import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import Divider from '@material-ui/core/Divider';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import HowToRegIcon from '../../icons/person_check.svg';
import DescriptionIcon from '../../icons/description.svg';
import AddFilterMenu from '../search/AddFilterMenu';
import NumericRangeFilter from '../search/NumericRangeFilter';
import DateRangeFilter from '../search/DateRangeFilter';
import MultiSelectFilter from '../search/MultiSelectFilter';
import SearchFieldChannel from '../search/SearchFields/SearchFieldChannel';
import { withSetFlashMessage } from '../FlashMessage';
import styles from '../search/SearchResults.module.css';
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
  onSubmit,
  filterOptions,
  currentFilters,
  feedTeam,
  className,
  disableSave,
  extra,
  intl,
  setFlashMessage,
}) => {
  const [filters, setFilters] = React.useState({ ...currentFilters });

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

  return (
    <div className={cx(styles['search-results-top'], className)}>
      { extra ? <div className={searchStyles['filters-wrapper']}>{extra}</div> : null }
      <div className={searchStyles['filters-wrapper']}>
        {Object.keys(filters).map((filter) => {
          const value = filters[filter];

          if (filter === 'linked_items_count') {
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
            return (
              <DateRangeFilter
                key={filter}
                filterKey="range"
                onChange={handleDateRange}
                value={value || { request_created_at: {} }}
                optionsToHide={['created_at', 'media_published_at', 'report_published_at', 'request_created_at']}
                onRemove={() => handleRemoveFilter('range')}
              />
            );
          }

          if (filter === 'feed_fact_checked_by') {
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

          if (filter === 'channels') {
            return (
              <SearchFieldChannel
                key={filter}
                query={{ channels: value }}
                onChange={newValue => handleOptionChange('channels', newValue)}
                page="feed"
                onRemove={() => handleRemoveFilter('channels')}
              />
            );
          }

          if (filter === 'show') {
            return (
              <MultiSelectFilter
                allowSearch={false}
                label={<FormattedMessage id="feedFilters.mediaType" defaultMessage="Media (type)" description="Field label for feed filter" />}
                icon={<DescriptionIcon />}
                selected={value || []}
                options={[
                  { value: 'UploadedAudio', label: intl.formatMessage(messages.mediaTypeAudio) },
                  { value: 'UploadedImage', label: intl.formatMessage(messages.mediaTypeImage) },
                  { value: 'UploadedVideo', label: intl.formatMessage(messages.mediaTypeVideo) },
                  { value: 'Claim', label: intl.formatMessage(messages.mediaTypeText) },
                  { value: 'Link', label: intl.formatMessage(messages.mediaTypeLink) },
                ]}
                onChange={newValue => handleOptionChange('show', newValue)}
                onRemove={() => handleRemoveFilter('show')}
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
            className="int-search-fields__button--apply-feedfilter"
            variant="contained"
            size="default"
            theme="lightValidation"
            onClick={handleSubmit}
            label={
              <FormattedMessage id="feedFilters.applyFilters" defaultMessage="Apply" description="Button to perform query with specified filters" />
            }
            buttonProps={{
              id: 'search-fields__submit-button',
            }}
          /> : null }
        <ButtonMain
          className="int-search-fields__button--reset-feedfilter"
          variant="contained"
          size="default"
          theme="lightText"
          onClick={handleClear}
          label={
            <FormattedMessage id="feedFilters.reset" defaultMessage="Reset" description="Tooltip for button to remove any applied filters" />
          }
          buttonProps={{
            id: 'search-fields__clear-button',
          }}
        />
        { !disableSave ?
          <ButtonMain
            variant="contained"
            size="default"
            theme="lightBrand"
            buttonProps={{
              id: 'save-list__button',
            }}
            onClick={handleSaveFilters}
            label={
              <FormattedMessage
                id="feedFilters.saveFilters"
                defaultMessage="Save"
                description="'Save filters' here are in infinitive form - it's a button label, to save the current set of filters applied to a search result as feed requests filters."
              />
            }
          />
          : null }
      </div>
    </div>
  );
};

FeedFilters.defaultProps = {
  filterOptions: [],
  currentFilters: {},
  className: '',
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
  className: PropTypes.string,
  disableSave: PropTypes.bool,
  extra: PropTypes.node,
  intl: intlShape.isRequired,
};

export default withSetFlashMessage(injectIntl(FeedFilters));
