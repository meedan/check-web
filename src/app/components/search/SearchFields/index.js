/* eslint-disable relay/unused-fields */
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import SearchFieldDummy from './SearchFieldDummy';
import SearchFieldSource from './SearchFieldSource';
import SearchFieldTag from './SearchFieldTag';
import SearchFieldChannel from './SearchFieldChannel';
import SearchFieldUser from './SearchFieldUser';
import SearchFieldClusterTeams from './SearchFieldClusterTeams';
import CustomFiltersManager from '../CustomFiltersManager';
import AddFilterMenu from '../AddFilterMenu';
import DateRangeFilter from '../DateRangeFilter';
import LanguageFilter from '../LanguageFilter';
import NumericRangeFilter from '../NumericRangeFilter';
import MultiSelectFilter from '../MultiSelectFilter';
import SaveList from '../SaveList';
import CheckArchivedFlags from '../../../CheckArchivedFlags';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import ListSort, { sortLabels } from '../../cds/inputs/ListSort';
import CorporateFareIcon from '../../../icons/corporate_fare.svg';
import DeleteIcon from '../../../icons/delete.svg';
import DescriptionIcon from '../../../icons/description.svg';
import ErrorIcon from '../../../icons/error_outline.svg';
import HowToRegIcon from '../../../icons/person_check.svg';
import LabelIcon from '../../../icons/label.svg';
import PersonIcon from '../../../icons/person.svg';
import ReportIcon from '../../../icons/playlist_add_check.svg';
import SpamIcon from '../../../icons/report.svg';
import MarkunreadIcon from '../../../icons/mail.svg';
import UnmatchedIcon from '../../../icons/unmatched.svg';
import styles from '../search.module.css';

const messages = defineMessages({
  claim: {
    id: 'search.showClaims',
    defaultMessage: 'Text',
    description: 'Describes media type Text',
  },
  image: {
    id: 'search.showImages',
    defaultMessage: 'Image',
    description: 'Describes media type Image',
  },
  video: {
    id: 'search.showVideos',
    defaultMessage: 'Video',
    description: 'Describes media type Video',
  },
  audio: {
    id: 'search.showAudios',
    defaultMessage: 'Audio',
    description: 'Describes media type Audio',
  },
  socialMedia: {
    id: 'search.socialMedia',
    defaultMessage: 'Social media',
    description: 'Allow user to filter by social media links',
  },
  facebook: {
    id: 'search.facebook',
    defaultMessage: 'Facebook post',
    description: 'Allow user to filter items by facebook posts',
  },
  twitter: {
    id: 'search.twitter',
    defaultMessage: 'X (Twitter) post',
    description: 'Allow user to filter items by x (twitter) posts',
  },
  tiktok: {
    id: 'search.tiktok',
    defaultMessage: 'TikTok post',
    description: 'Allow user to filter items by tiktok posts',
  },
  youtube: {
    id: 'search.youtube',
    defaultMessage: 'Youtube video',
    description: 'Allow user to filter items by youtube videos',
  },
  instagram: {
    id: 'search.instagram',
    defaultMessage: 'Instagram post',
    description: 'Allow user to filter items by instagram posts',
  },
  telegram: {
    id: 'search.telegram',
    defaultMessage: 'Telegram',
    description: 'Allow user to filter items by Telegram posts',
  },
  webLink: {
    id: 'search.webLink',
    defaultMessage: 'webLink',
    description: 'Allow user to filter items by links of type page',
  },
  read: {
    id: 'search.itemRead',
    defaultMessage: 'Read',
    description: 'Describes media read',
  },
  unread: {
    id: 'search.itemUnread',
    defaultMessage: 'Unread',
    description: 'Describes media unread',
  },
  unmatched: {
    id: 'search.mediaUnmatched',
    defaultMessage: 'Unmatched',
    description: 'Describes media that is unmatched as in "Media is [unmatched]"',
  },
  empty: {
    id: 'search.empty',
    defaultMessage: 'Empty',
    description: 'Allow filtering by claim with no value set',
  },
  notEmpty: {
    id: 'search.notEmpty',
    defaultMessage: 'Not empty',
    description: 'Allow filtering by claim with any value set',
  },
  emptyAssign: {
    id: 'search.emptyAssign',
    defaultMessage: 'Not assigned',
    description: 'Allow filtering by assigned_to with no value set',
  },
  notEmptyAssign: {
    id: 'search.notEmptyAssign',
    defaultMessage: 'Assigned',
    description: 'Allow filtering by assigned_to with any value set',
  },
  confirmed: {
    id: 'search.confirmed',
    defaultMessage: 'Confirmed',
    description: 'Allow filtering by confirmed items',
  },
  unconfirmed: {
    id: 'search.unconfirmed',
    defaultMessage: 'Unconfirmed',
    description: 'Allow filtering by unconfirmed items',
  },
});

const SearchFields = ({
  appliedQuery,
  defaultQuery,
  feedTeam,
  handleSubmit,
  hideFields,
  intl,
  onChange,
  onChangeSort,
  page,
  readOnlyFields,
  savedSearch,
  setStateQuery,
  stateQuery,
  team,
}) => {
  /**
  * Return `query`, with property `key` changed to the `newArray`.
  *
  * `undefined` is understood to be the empty array. This function will remove
  * the `key` filter rather than return an empty array.
  */
  const updateStateQueryArrayValue = (key, newArray) => {
    if (newArray === undefined) {
      const newQuery = { ...stateQuery };
      delete newQuery[key];
      return newQuery;
    }
    return { ...stateQuery, [key]: newArray };
  };

  const handleAddField = (field) => {
    const newQuery = { ...stateQuery };

    if (field === 'team_tasks') {
      newQuery.team_tasks = stateQuery.team_tasks ?
        [...stateQuery.team_tasks, {}] : [{}];
    } else if (field === 'range') {
      newQuery.range = { created_at: {} };
    } else {
      newQuery[field] = [];
    }

    setStateQuery(newQuery);
  };

  const handleRemoveField = (field) => {
    const newQuery = { ...stateQuery };
    delete newQuery[field];
    setStateQuery(newQuery);
  };

  const handleDateChange = (value) => {
    const newQuery = { ...stateQuery, range: value };
    setStateQuery(newQuery);
  };

  const handleLanguageChange = (value) => {
    const newQuery = { ...stateQuery, language_filter: value };
    setStateQuery(newQuery);
  };

  const handleNumericRange = (filterKey, value) => {
    const newQuery = { ...stateQuery };
    newQuery[filterKey] = value;
    setStateQuery(newQuery);
  };

  const handleCustomFilterChange = (value) => {
    const newQuery = { ...stateQuery, ...value };
    if (JSON.stringify(value) === '{}') {
      delete newQuery.team_tasks;
    }
    setStateQuery(newQuery);
  };

  const handleFilterClick = (values, filterName) => {
    setStateQuery(
      updateStateQueryArrayValue(filterName, values),
    );
  };

  const switchOperatorIs = (operator, key) => {
    let currentOperator = 'or'; // "or" is the default
    if (stateQuery && stateQuery[key]) {
      currentOperator = stateQuery[key];
    }
    return currentOperator === operator;
  };

  const handleSwitchOperator = (key) => {
    const operator = switchOperatorIs('or', key) ? 'and' : 'or';
    const newQuery = { ...stateQuery };
    newQuery[key] = operator;
    setStateQuery(newQuery);
  };

  const handleClickClear = () => {
    const { keyword } = stateQuery;
    const newQuery = keyword ? { keyword } : {};
    newQuery.sort = 'clear';
    setStateQuery(newQuery);
    onChange(newQuery);
  };

  const handleOperatorClick = () => {
    const operator = stateQuery.operator === 'OR' ? 'AND' : 'OR';
    setStateQuery(
      updateStateQueryArrayValue('operator', operator),
    );
  };

  const { statuses } = team.verification_statuses;

  const types = [
    { value: 'audios', label: intl.formatMessage(messages.audio) },
    { value: 'images', label: intl.formatMessage(messages.image) },
    { value: 'videos', label: intl.formatMessage(messages.video) },
    { value: '', label: '' },
    { value: 'social_media', label: intl.formatMessage(messages.socialMedia), hasChildren: true },
    { value: 'facebook', label: intl.formatMessage(messages.facebook), parent: 'social_media' },
    { value: 'instagram', label: intl.formatMessage(messages.instagram), parent: 'social_media' },
    { value: 'telegram', label: intl.formatMessage(messages.telegram), parent: 'social_media' },
    { value: 'tiktok', label: intl.formatMessage(messages.tiktok), parent: 'social_media' },
    { value: 'twitter', label: intl.formatMessage(messages.twitter), parent: 'social_media' },
    { value: 'youtube', label: intl.formatMessage(messages.youtube), parent: 'social_media' },
    { value: '', label: '' },
    { value: 'claims', label: intl.formatMessage(messages.claim) },
    { value: 'weblink', label: intl.formatMessage(messages.webLink) },
  ];

  const readValues = [
    { value: '0', label: intl.formatMessage(messages.unread) },
    { value: '1', label: intl.formatMessage(messages.read) },
  ];

  const showSimilarValues = [
    { value: '1', label: '' }, // Label not necessary for "oneOption" filters
  ];

  const unmatchedValues = [
    { value: '1', label: intl.formatMessage(messages.unmatched) },
  ];

  const confirmedValues = [
    { value: CheckArchivedFlags.NONE.toString(), label: intl.formatMessage(messages.confirmed) },
    { value: CheckArchivedFlags.UNCONFIRMED.toString(), label: intl.formatMessage(messages.unconfirmed) },
  ];

  const hasClaimOptions = [
    { label: intl.formatMessage(messages.notEmpty), value: 'ANY_VALUE', exclusive: true },
    { label: intl.formatMessage(messages.empty), value: 'NO_VALUE', exclusive: true },
  ];

  const assignedToOptions = [
    { label: intl.formatMessage(messages.notEmptyAssign), value: 'ANY_VALUE', exclusive: true },
    { label: intl.formatMessage(messages.emptyAssign), value: 'NO_VALUE', exclusive: true },
    { label: '', value: '' },
  ];

  const reportStatusOptions = [
    { label: <FormattedMessage defaultMessage="Unpublished" description="Refers to a report status" id="search.reportStatusUnpublished" />, value: 'unpublished' },
    { label: <FormattedMessage defaultMessage="Published" description="Refers to a report status" id="search.reportStatusPublished" />, value: 'published' },
    { label: <FormattedMessage defaultMessage="Paused" description="Refers to a report status" id="search.reportStatusPaused" />, value: 'paused' },
  ];

  const OperatorToggle = () => {
    let operatorProps = { onClick: handleOperatorClick };
    if (page === 'feed') {
      operatorProps = { disabled: true };
    }
    return (
      <Tooltip
        arrow
        title={
          <FormattedMessage defaultMessage="Toggle AND/OR" description="Tooltip to tell the user they can switch the logical operator between 'AND/OR' when filtering by multiple fields" id="search.switchOperator" />
        }
      >
        <span>
          <ButtonMain
            className="int-search-fields__button--toggle-and-or-operator"
            customStyle={{ fontWeight: 'bold' }}
            label={stateQuery.operator === 'OR' ?
              <FormattedMessage defaultMessage="or" description="Logical operator 'OR' to be applied when filtering by multiple fields" id="search.fieldOr" /> :
              <FormattedMessage defaultMessage="and" description="Logical operator 'AND' to be applied when filtering by multiple fields" id="search.fieldAnd" />
            }
            size="small"
            theme={page === 'feed' ? 'text' : 'lightInfo'}
            variant="contained"
            {...operatorProps}
          />
        </span>
      </Tooltip>
    );
  };

  const fieldComponents = {
    has_claim: (
      <FormattedMessage defaultMessage="Claim is" description="Prefix label for field to filter by claim" id="search.claim">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            icon={<LabelIcon />}
            label={label}
            options={hasClaimOptions}
            readOnly={readOnlyFields.includes('has_claim')}
            selected={stateQuery.has_claim}
            onChange={(newValue) => { handleFilterClick(newValue, 'has_claim'); }}
            onRemove={() => handleRemoveField('has_claim')}
          />
        )}
      </FormattedMessage>
    ),
    range: (
      <DateRangeFilter
        optionsToHide={['request_created_at']}
        readOnly={readOnlyFields.includes('range')}
        value={stateQuery.range}
        onChange={handleDateChange}
        onRemove={() => handleRemoveField('range')}
      />
    ),
    tags: (
      <SearchFieldTag
        operator={stateQuery.tags_operator}
        query={stateQuery}
        readOnly={readOnlyFields.includes('tags')}
        teamSlug={team.slug}
        onChange={(newValue) => { handleFilterClick(newValue, 'tags'); }}
        onRemove={() => handleRemoveField('tags')}
        onToggleOperator={() => handleSwitchOperator('tags_operator')}
      />
    ),
    show: (
      <FormattedMessage defaultMessage="Media in cluster is" description="Prefix label for field to filter by media type" id="search.show">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            icon={<DescriptionIcon />}
            label={label}
            options={types}
            readOnly={readOnlyFields.includes('show')}
            selected={stateQuery.show}
            onChange={(newValue) => { handleFilterClick(newValue, 'show'); }}
            onRemove={() => handleRemoveField('show')}
          />
        )}
      </FormattedMessage>
    ),
    show_similar: (
      <FormattedMessage defaultMessage="Include matched media clusters" description="Label for filter field to display matched media" id="search.showSimilar">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            icon={<UnmatchedIcon />}
            label={label}
            oneOption
            options={showSimilarValues}
            readOnly={readOnlyFields.includes('show_similar')}
            selected={stateQuery.show_similar}
            onChange={(newValue) => { handleFilterClick(newValue, 'show_similar'); }}
            onRemove={() => handleRemoveField('show_similar')}
          />
        )}
      </FormattedMessage>
    ),
    unmatched: (
      <FormattedMessage defaultMessage="Media Cluster is unmatched" description="Label for field to filter by unmatched media" id="search.unmatched">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            icon={<UnmatchedIcon />}
            label={label}
            oneOption
            options={unmatchedValues}
            readOnly={readOnlyFields.includes('unmatched')}
            selected={stateQuery.unmatched}
            onChange={(newValue) => { handleFilterClick(newValue, 'unmatched'); }}
            onRemove={() => handleRemoveField('unmatched')}
          />
        )}
      </FormattedMessage>
    ),
    read: (
      <FormattedMessage defaultMessage="Media Cluster is" description="Prefix label for field to filter by media read" id="search.read">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            icon={<MarkunreadIcon />}
            label={label}
            options={readValues}
            readOnly={readOnlyFields.includes('read')}
            selected={stateQuery.read}
            onChange={(newValue) => { handleFilterClick(newValue, 'read'); }}
            onRemove={() => handleRemoveField('read')}
          />
        )}
      </FormattedMessage>
    ),
    verification_status: (
      <FormattedMessage defaultMessage="Rating is" description="Prefix label for field to filter by status" id="search.statusHeading">
        { label => (
          <MultiSelectFilter
            icon={<LabelIcon />}
            label={label}
            options={statuses.map(s => ({ label: s.label, value: s.id }))}
            readOnly={readOnlyFields.includes('verification_status')}
            selected={stateQuery.verification_status}
            onChange={(newValue) => { handleFilterClick(newValue, 'verification_status'); }}
            onRemove={() => handleRemoveField('verification_status')}
          />
        )}
      </FormattedMessage>
    ),
    users: (
      <FormattedMessage defaultMessage="Created by" description="Prefix label for field to filter by item creator" id="search.userHeading">
        { label => (
          <SearchFieldUser
            icon={<PersonIcon />}
            label={label}
            readOnly={readOnlyFields.includes('users')}
            selected={stateQuery.users}
            teamSlug={team.slug}
            onChange={(newValue) => { handleFilterClick(newValue, 'users'); }}
            onRemove={() => handleRemoveField('users')}
          />
        )}
      </FormattedMessage>
    ),
    channels: (
      <SearchFieldChannel
        page={page}
        query={stateQuery}
        readOnly={readOnlyFields.includes('channels')}
        onChange={(newValue) => { handleFilterClick(newValue, 'channels'); }}
        onRemove={() => handleRemoveField('channels')}
      />
    ),
    archived: (
      <FormattedMessage defaultMessage="Request is" description="Prefix label for field to filter by Tipline request" id="search.archived">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            icon={<ErrorIcon />}
            label={label}
            options={confirmedValues}
            readOnly={readOnlyFields.includes('archived')}
            selected={stateQuery.archived}
            single
            onChange={(newValue) => { handleFilterClick(newValue, 'archived'); }}
            onRemove={() => handleRemoveField('archived')}
          />
        )}
      </FormattedMessage>
    ),
    linked_items_count: (
      <NumericRangeFilter
        filterKey="linked_items_count"
        readOnly={readOnlyFields.includes('linked_items_count')}
        value={stateQuery.linked_items_count}
        onChange={handleNumericRange}
        onRemove={() => handleRemoveField('linked_items_count')}
      />
    ),
    suggestions_count: (
      <NumericRangeFilter
        filterKey="suggestions_count"
        readOnly={readOnlyFields.includes('suggestions_count')}
        value={stateQuery.suggestions_count}
        onChange={handleNumericRange}
        onRemove={() => handleRemoveField('suggestions_count')}
      />
    ),
    demand: (
      <NumericRangeFilter
        filterKey="demand"
        readOnly={readOnlyFields.includes('demand')}
        value={stateQuery.demand}
        onChange={handleNumericRange}
        onRemove={() => handleRemoveField('demand')}
      />
    ),
    report_status: (
      <FormattedMessage defaultMessage="Report (status) is" description="Prefix label for field to filter by report status" id="search.reportStatus">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            icon={<ReportIcon />}
            label={label}
            options={reportStatusOptions}
            readOnly={readOnlyFields.includes('report_status')}
            selected={stateQuery.report_status}
            onChange={(newValue) => { handleFilterClick(newValue, 'report_status'); }}
            onRemove={() => handleRemoveField('report_status')}
          />
        )}
      </FormattedMessage>
    ),
    published_by: (
      <FormattedMessage defaultMessage="Publisher is" description="Prefix label for field to filter by published by" id="search.publishedBy">
        { label => (
          <SearchFieldUser
            icon={<HowToRegIcon />}
            label={label}
            readOnly={readOnlyFields.includes('published_by')}
            selected={stateQuery.published_by}
            teamSlug={team.slug}
            onChange={(newValue) => { handleFilterClick(newValue, 'published_by'); }}
            onRemove={() => handleRemoveField('published_by')}
          />
        )}
      </FormattedMessage>
    ),
    annotated_by: (
      <FormattedMessage defaultMessage="Annotater is" description="Prefix label for field to filter by annotated by" id="search.annotatedBy">
        { label => (
          <SearchFieldUser
            icon={<PersonIcon />}
            label={label}
            operator={stateQuery.annotated_by_operator}
            readOnly={readOnlyFields.includes('annotated_by')}
            selected={stateQuery.annotated_by}
            teamSlug={team.slug}
            onChange={(newValue) => { handleFilterClick(newValue, 'annotated_by'); }}
            onRemove={() => handleRemoveField('annotated_by')}
            onToggleOperator={() => handleSwitchOperator('annotated_by_operator')}
          />
        )}
      </FormattedMessage>
    ),
    language_filter: (
      <LanguageFilter
        optionsToHide={page === 'feed' ? ['request_language', 'language'] : []}
        readOnly={readOnlyFields.includes('language_filter')}
        teamSlug={team.slug}
        value={stateQuery.language_filter}
        onChange={handleLanguageChange}
        onRemove={() => handleRemoveField('language_filter')}
      />
    ),
    assigned_to: (
      <FormattedMessage defaultMessage="Assigned to" description="Prefix label for field to filter by assigned users" id="search.assignedTo">
        { label => (
          <SearchFieldUser
            extraOptions={assignedToOptions}
            icon={<PersonIcon />}
            label={label}
            readOnly={readOnlyFields.includes('assigned_to')}
            selected={stateQuery.assigned_to}
            teamSlug={team.slug}
            onChange={(newValue) => { handleFilterClick(newValue, 'assigned_to'); }}
            onRemove={() => handleRemoveField('assigned_to')}
          />
        )}
      </FormattedMessage>
    ),
    team_tasks: (
      <CustomFiltersManager
        operatorToggle={<OperatorToggle />}
        query={stateQuery}
        team={team}
        onFilterChange={handleCustomFilterChange}
      />
    ),
    sources: (
      <SearchFieldSource
        readOnly={readOnlyFields.includes('sources')}
        selected={stateQuery.sources}
        teamSlug={team.slug}
        onChange={(newValue) => { handleFilterClick(newValue, 'sources'); }}
        onRemove={() => handleRemoveField('sources')}
      />
    ),
    cluster_teams: (
      <FormattedMessage defaultMessage="Organization is" description="Prefix label for field to filter by workspace" id="search.clusterTeams">
        { label => (
          <SearchFieldClusterTeams
            icon={<CorporateFareIcon />}
            label={label}
            readOnly={readOnlyFields.includes('cluster_teams')}
            selected={stateQuery.cluster_teams}
            teamSlug={team.slug}
            onChange={(newValue) => { handleFilterClick(newValue, 'cluster_teams'); }}
            onRemove={() => handleRemoveField('cluster_teams')}
          />
        )}
      </FormattedMessage>
    ),
    cluster_published_reports: (
      <FormattedMessage defaultMessage="Publisher is" description="Prefix label for field to filter by published by" id="search.publishedBy">
        { label => (
          <SearchFieldClusterTeams
            icon={<HowToRegIcon />}
            label={label}
            readOnly={readOnlyFields.includes('cluster_published_reports')}
            selected={stateQuery.cluster_published_reports}
            teamSlug={team.slug}
            onChange={(newValue) => { handleFilterClick(newValue, 'cluster_published_reports'); }}
            onRemove={() => handleRemoveField('cluster_published_reports')}
          />
        )}
      </FormattedMessage>
    ),
    spam: (
      <SearchFieldDummy
        icon={<SpamIcon />}
        label={<FormattedMessage defaultMessage="Item is marked as spam" description="Label for spam filter field" id="search.spam" />}
      />
    ),
    trash: (
      <SearchFieldDummy
        icon={<DeleteIcon />}
        label={<FormattedMessage defaultMessage="Item is in the Trash" description="Label for spam filter field" id="search.trash" />}
      />
    ),
  };

  let fieldKeys = [];
  /*
    spam and trash are added manually because they work with the `archived` filter field
    and it gets mixed with the "tipline request is confirmed/unconfirmed" filter. :cry:
    for the same reason, `archived` is a `hideFields` value for both lists.
  */
  if (page === 'spam') fieldKeys.push('spam');
  if (page === 'trash') fieldKeys.push('trash');

  fieldKeys = fieldKeys.concat(Object.keys(stateQuery).filter(k => k !== 'keyword' && !hideFields.includes(k) && fieldComponents[k]));

  const addedFields = fieldKeys.filter(i => i !== 'team_tasks');

  const stripTimestamp = (obj) => {
    const ret = { ...obj };
    delete ret.timestamp;
    return ret;
  };

  const stateQueryWithoutTimestamp = stripTimestamp(stateQuery);
  const appliedQueryWithoutTimestamp = stripTimestamp(appliedQuery);
  const defaultQueryWithoutTimestamp = stripTimestamp(defaultQuery);

  // We can apply if the state query is dirty (differs from what is applied)
  const canApply = JSON.stringify(stateQueryWithoutTimestamp) !== JSON.stringify(appliedQueryWithoutTimestamp);
  // We can save if the applied query is different from the default query
  const canSave = JSON.stringify(appliedQueryWithoutTimestamp) !== JSON.stringify(defaultQueryWithoutTimestamp);
  const canReset = canApply || canSave;

  const feedSortOptions = [
    { value: 'title', label: intl.formatMessage(sortLabels.sortTitle) },
    { value: 'recent_activity', label: intl.formatMessage(sortLabels.sortUpdated) },
    { value: 'status_index', label: intl.formatMessage(sortLabels.sortRating) },
  ];

  const listSortOptions = [
    { value: 'fact_check_published_on', label: intl.formatMessage(sortLabels.sortFactCheckPublishedOn) },
    { value: 'last_seen', label: intl.formatMessage(sortLabels.sortLastSeen) },
    { value: 'related', label: intl.formatMessage(sortLabels.sortMediaCount) },
    { value: 'report_status', label: intl.formatMessage(sortLabels.sortReportStatus) },
    { value: 'demand', label: intl.formatMessage(sortLabels.sortRequestsCount) },
    { value: 'recent_added', label: intl.formatMessage(sortLabels.sortSubmitted) },
    { value: 'suggestions_count', label: intl.formatMessage(sortLabels.sortSuggestionsCount) },
    { value: 'title', label: intl.formatMessage(sortLabels.sortTitle) },
    { value: 'recent_activity', label: intl.formatMessage(sortLabels.sortUpdated) },
  ];

  // if searching for a keyword, default sort by score but only show option when searching
  if (stateQuery.keyword && stateQuery.keyword.length > 0) {
    listSortOptions.unshift({ value: 'score', label: intl.formatMessage(sortLabels.sortScore) });
  }

  return (
    <div className={styles['filters-wrapper']}>
      <ListSort
        className={styles['filters-sorting']}
        options={page === 'feed' ? feedSortOptions : listSortOptions}
        sort={stateQuery.sort}
        sortType={stateQuery.sort_type}
        onChange={({ sort, sortType }) => { onChangeSort({ key: sort, ascending: (sortType === 'ASC') }); }}
      />
      { fieldKeys.map((key, index) => {
        if (index > 0) {
          return (
            <React.Fragment key={key}>
              <OperatorToggle />
              { fieldComponents[key] }
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={key}>
            { fieldComponents[key] }
          </React.Fragment>
        );
      })}
      <AddFilterMenu
        addedFields={addedFields}
        hideOptions={hideFields}
        team={team}
        onSelect={handleAddField}
      />
      <div
        className={cx(
          styles['filters-buttons-wrapper'],
          {
            [styles['filters-buttons-wrapper-visible']]: canReset,
          })
        }
      >
        { canReset && (
          <ButtonMain
            buttonProps={{
              id: 'search-fields__clear-button',
            }}
            className="int-search-fields__button--reset-filter"
            label={
              <FormattedMessage defaultMessage="Reset" description="Button label to reset search filters." id="search.resetFilter" />
            }
            size="default"
            theme="lightText"
            variant="contained"
            onClick={handleClickClear}
          />
        )}
        { canApply && (
          <ButtonMain
            buttonProps={{
              id: 'search-fields__submit-button',
            }}
            className="int-search-fields__button--apply-filter"
            label={
              <FormattedMessage defaultMessage="Apply" description="Button label to apply search filters." id="search.applyFilter" />
            }
            size="default"
            theme="lightValidation"
            variant="contained"
            onClick={handleSubmit}
          />
        )}
        { canSave && (
          <SaveList
            feedTeam={feedTeam}
            page={page}
            query={stateQuery}
            savedSearch={savedSearch}
            team={team}
          />
        )}
      </div>
    </div>
  );
};

SearchFields.defaultProps = {
  savedSearch: null,
  feedTeam: null,
  readOnlyFields: [],
};

SearchFields.propTypes = {
  appliedQuery: PropTypes.object.isRequired,
  defaultQuery: PropTypes.object.isRequired,
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filters: PropTypes.object,
    feedFilters: PropTypes.object,
  }),
  handleSubmit: PropTypes.func.isRequired,
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash', 'assigned-to-me']).isRequired, // FIXME Define listing types as a global constant
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
  savedSearch: PropTypes.shape({
    filters: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  setStateQuery: PropTypes.func.isRequired,
  stateQuery: PropTypes.object.isRequired,
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired, // onChange({ ... /* query */ }) => undefined
};

SearchFields.contextTypes = {
  intl: intlShape.isRequired,
};

export default createFragmentContainer(injectIntl(SearchFields), graphql`
  fragment SearchFields_team on Team {
    id
    dbid
    slug
    permissions
    verification_statuses
    get_tipline_inbox_filters
    smooch_bot: team_bot_installation(bot_identifier: "smooch") {
      id
    }
    alegre_bot: team_bot_installation(bot_identifier: "alegre") {
      id
      alegre_settings
    }
  }
`);
