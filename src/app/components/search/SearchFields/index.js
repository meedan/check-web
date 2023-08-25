/* eslint-disable relay/unused-fields */
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import CustomFiltersManager from '../CustomFiltersManager';
import AddFilterMenu from '../AddFilterMenu';
import DateRangeFilter from '../DateRangeFilter';
import LanguageFilter from '../LanguageFilter';
import NumericRangeFilter from '../NumericRangeFilter';
import MultiSelectFilter from '../MultiSelectFilter';
import SaveList from '../SaveList';
import { Row } from '../../../styles/js/shared';
import SearchFieldDummy from './SearchFieldDummy';
import SearchFieldSource from './SearchFieldSource';
import SearchFieldTag from './SearchFieldTag';
import SearchFieldChannel from './SearchFieldChannel';
import SearchFieldUser from './SearchFieldUser';
import SearchFieldClusterTeams from './SearchFieldClusterTeams';
import CheckArchivedFlags from '../../../CheckArchivedFlags';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
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
    defaultMessage: 'Twitter post',
    description: 'Allow user to filter items by twitter posts',
  },
  tiktok: {
    id: 'search.tiktok',
    defaultMessage: 'Tiktok post',
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
  intl,
  team,
  query,
  currentQuery,
  defaultQuery,
  feedTeam,
  readOnlyFields,
  setQuery,
  onChange,
  page,
  handleSubmit,
  savedSearch,
  hideFields,
}) => {
  /**
  * Return `query`, with property `key` changed to the `newArray`.
  *
  * `undefined` is understood to be the empty array. This function will remove
  * the `key` filter rather than return an empty array.
  */
  const updateStateQueryArrayValue = (key, newArray) => {
    if (newArray === undefined) {
      const newQuery = { ...query };
      delete newQuery[key];
      return newQuery;
    }
    return { ...query, [key]: newArray };
  };

  const handleAddField = (field) => {
    const newQuery = { ...query };

    if (field === 'team_tasks') {
      newQuery.team_tasks = query.team_tasks ?
        [...query.team_tasks, {}] : [{}];
    } else if (field === 'range') {
      newQuery.range = { created_at: {} };
    } else {
      newQuery[field] = [];
    }

    setQuery(newQuery);
  };

  const handleRemoveField = (field) => {
    const newQuery = { ...query };
    delete newQuery[field];
    setQuery(newQuery);
  };

  // const filterIsActive = () => Object.keys(query).filter(k => k !== 'keyword').length > 0;

  const handleDateChange = (value) => {
    const newQuery = { ...query, range: value };
    setQuery(newQuery);
  };

  const handleLanguageChange = (value) => {
    const newQuery = { ...query, language_filter: value };
    setQuery(newQuery);
  };

  const handleNumericRange = (filterKey, value) => {
    const newQuery = { ...query };
    newQuery[filterKey] = value;
    setQuery(newQuery);
  };

  const handleCustomFilterChange = (value) => {
    const newQuery = { ...query, ...value };
    if (JSON.stringify(value) === '{}') {
      delete newQuery.team_tasks;
    }
    setQuery(newQuery);
  };

  const handleFilterClick = (values, filterName) => {
    setQuery(
      updateStateQueryArrayValue(filterName, values),
    );
  };

  const switchOperatorIs = (operator, key) => {
    let currentOperator = 'or'; // "or" is the default
    if (query && query[key]) {
      currentOperator = query[key];
    }
    return currentOperator === operator;
  };

  const handleSwitchOperator = (key) => {
    const operator = switchOperatorIs('or', key) ? 'and' : 'or';
    const newQuery = { ...query };
    newQuery[key] = operator;
    setQuery(newQuery);
  };

  const handleClickClear = () => {
    const { keyword } = query;
    const newQuery = keyword ? { keyword } : {};
    newQuery.sort = 'clear';
    setQuery(newQuery);
    onChange(newQuery);
  };

  const handleOperatorClick = () => {
    const operator = query.operator === 'OR' ? 'AND' : 'OR';
    setQuery(
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
    { label: <FormattedMessage id="search.reportStatusUnpublished" defaultMessage="Unpublished" description="Refers to a report status" />, value: 'unpublished' },
    { label: <FormattedMessage id="search.reportStatusPublished" defaultMessage="Published" description="Refers to a report status" />, value: 'published' },
    { label: <FormattedMessage id="search.reportStatusPaused" defaultMessage="Paused" description="Refers to a report status" />, value: 'paused' },
  ];

  const OperatorToggle = () => {
    let operatorProps = { style: { minWidth: 0, color: 'var(--brandMain)' }, onClick: handleOperatorClick };
    if (page === 'feed') {
      operatorProps = { style: { minWidth: 0, color: 'var(--textPrimary)' }, disabled: true };
    }
    return (
      <Button {...operatorProps}>
        { query.operator === 'OR' ?
          <FormattedMessage id="search.fieldOr" defaultMessage="or" description="Logical operator 'OR' to be applied when filtering by multiple fields" /> :
          <FormattedMessage id="search.fieldAnd" defaultMessage="and" description="Logical operator 'AND' to be applied when filtering by multiple fields" />
        }
      </Button>
    );
  };

  const fieldComponents = {
    has_claim: (
      <FormattedMessage id="search.claim" defaultMessage="Claim field is" description="Prefix label for field to filter by claim">
        { label => (
          <MultiSelectFilter
            label={label}
            icon={<LabelIcon />}
            allowSearch={false}
            selected={query.has_claim}
            options={hasClaimOptions}
            readOnly={readOnlyFields.includes('has_claim')}
            onChange={(newValue) => { handleFilterClick(newValue, 'has_claim'); }}
            onRemove={() => handleRemoveField('has_claim')}
          />
        )}
      </FormattedMessage>
    ),
    range: (
      <Box maxWidth="900px">
        <DateRangeFilter
          onChange={handleDateChange}
          value={query.range}
          readOnly={readOnlyFields.includes('range')}
          optionsToHide={['request_created_at']}
          onRemove={() => handleRemoveField('range')}
        />
      </Box>
    ),
    tags: (
      <SearchFieldTag
        teamSlug={team.slug}
        query={query}
        onChange={(newValue) => { handleFilterClick(newValue, 'tags'); }}
        onToggleOperator={() => handleSwitchOperator('tags_operator')}
        operator={query.tags_operator}
        readOnly={readOnlyFields.includes('tags')}
        onRemove={() => handleRemoveField('tags')}
      />
    ),
    show: (
      <FormattedMessage id="search.show" defaultMessage="Type is" description="Prefix label for field to filter by media type">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            label={label}
            icon={<DescriptionIcon />}
            selected={query.show}
            options={types}
            readOnly={readOnlyFields.includes('show')}
            onChange={(newValue) => { handleFilterClick(newValue, 'show'); }}
            onRemove={() => handleRemoveField('show')}
          />
        )}
      </FormattedMessage>
    ),
    unmatched: (
      <FormattedMessage id="search.unmatched" defaultMessage="Media is unmatched" description="Label for field to filter by unmatched media">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            label={label}
            icon={<UnmatchedIcon />}
            selected={query.unmatched}
            options={unmatchedValues}
            oneOption
            readOnly={readOnlyFields.includes('unmatched')}
            onChange={(newValue) => { handleFilterClick(newValue, 'unmatched'); }}
            onRemove={() => handleRemoveField('unmatched')}
          />
        )}
      </FormattedMessage>
    ),
    read: (
      <FormattedMessage id="search.read" defaultMessage="Item is" description="Prefix label for field to filter by media read">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            label={label}
            icon={<MarkunreadIcon />}
            selected={query.read}
            options={readValues}
            readOnly={readOnlyFields.includes('read')}
            onChange={(newValue) => { handleFilterClick(newValue, 'read'); }}
            onRemove={() => handleRemoveField('read')}
          />
        )}
      </FormattedMessage>
    ),
    verification_status: (
      <FormattedMessage id="search.statusHeading" defaultMessage="Rating is" description="Prefix label for field to filter by status">
        { label => (
          <MultiSelectFilter
            label={label}
            icon={<LabelIcon />}
            selected={query.verification_status}
            options={statuses.map(s => ({ label: s.label, value: s.id }))}
            readOnly={readOnlyFields.includes('verification_status')}
            onChange={(newValue) => { handleFilterClick(newValue, 'verification_status'); }}
            onRemove={() => handleRemoveField('verification_status')}
          />
        )}
      </FormattedMessage>
    ),
    users: (
      <FormattedMessage id="search.userHeading" defaultMessage="Created by" description="Prefix label for field to filter by item creator">
        { label => (
          <SearchFieldUser
            teamSlug={team.slug}
            label={label}
            icon={<PersonIcon />}
            selected={query.users}
            onChange={(newValue) => { handleFilterClick(newValue, 'users'); }}
            readOnly={readOnlyFields.includes('users')}
            onRemove={() => handleRemoveField('users')}
          />
        )}
      </FormattedMessage>
    ),
    channels: (
      <SearchFieldChannel
        query={query}
        onChange={(newValue) => { handleFilterClick(newValue, 'channels'); }}
        onRemove={() => handleRemoveField('channels')}
        readOnly={readOnlyFields.includes('channels')}
      />
    ),
    archived: (
      <FormattedMessage id="search.archived" defaultMessage="Tipline request is" description="Prefix label for field to filter by Tipline request">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            label={label}
            icon={<ErrorIcon />}
            selected={query.archived}
            options={confirmedValues}
            readOnly={readOnlyFields.includes('archived')}
            onChange={(newValue) => { handleFilterClick(newValue, 'archived'); }}
            onRemove={() => handleRemoveField('archived')}
            single
          />
        )}
      </FormattedMessage>
    ),
    linked_items_count: (
      <Box maxWidth="700px">
        <NumericRangeFilter
          filterKey="linked_items_count"
          onChange={handleNumericRange}
          value={query.linked_items_count}
          readOnly={readOnlyFields.includes('linked_items_count')}
          onRemove={() => handleRemoveField('linked_items_count')}
        />
      </Box>
    ),
    suggestions_count: (
      <Box maxWidth="700px">
        <NumericRangeFilter
          filterKey="suggestions_count"
          onChange={handleNumericRange}
          value={query.suggestions_count}
          onRemove={() => handleRemoveField('suggestions_count')}
          readOnly={readOnlyFields.includes('suggestions_count')}
        />
      </Box>
    ),
    demand: (
      <Box maxWidth="700px">
        <NumericRangeFilter
          filterKey="demand"
          onChange={handleNumericRange}
          readOnly={readOnlyFields.includes('demand')}
          value={query.demand}
          onRemove={() => handleRemoveField('demand')}
        />
      </Box>
    ),
    report_status: (
      <FormattedMessage id="search.reportStatus" defaultMessage="Report status is" description="Prefix label for field to filter by report status">
        { label => (
          <MultiSelectFilter
            allowSearch={false}
            label={label}
            icon={<ReportIcon />}
            selected={query.report_status}
            options={reportStatusOptions}
            readOnly={readOnlyFields.includes('report_status')}
            onChange={(newValue) => { handleFilterClick(newValue, 'report_status'); }}
            onRemove={() => handleRemoveField('report_status')}
          />
        )}
      </FormattedMessage>
    ),
    published_by: (
      <FormattedMessage id="search.publishedBy" defaultMessage="Report published by" description="Prefix label for field to filter by published by">
        { label => (
          <SearchFieldUser
            teamSlug={team.slug}
            label={label}
            icon={<HowToRegIcon />}
            selected={query.published_by}
            onChange={(newValue) => { handleFilterClick(newValue, 'published_by'); }}
            readOnly={readOnlyFields.includes('published_by')}
            onRemove={() => handleRemoveField('published_by')}
          />
        )}
      </FormattedMessage>
    ),
    annotated_by: (
      <FormattedMessage id="search.annotatedBy" defaultMessage="Annotated by" description="Prefix label for field to filter by annotated by">
        { label => (
          <SearchFieldUser
            teamSlug={team.slug}
            label={label}
            icon={<PersonIcon />}
            selected={query.annotated_by}
            onChange={(newValue) => { handleFilterClick(newValue, 'annotated_by'); }}
            readOnly={readOnlyFields.includes('annotated_by')}
            onRemove={() => handleRemoveField('annotated_by')}
            onToggleOperator={() => handleSwitchOperator('annotated_by_operator')}
            operator={query.annotated_by_operator}
          />
        )}
      </FormattedMessage>
    ),
    language_filter: (
      <Box maxWidth="900px">
        <LanguageFilter
          onChange={handleLanguageChange}
          value={query.language_filter}
          readOnly={readOnlyFields.includes('language_filter')}
          onRemove={() => handleRemoveField('language_filter')}
          teamSlug={team.slug}
        />
      </Box>
    ),
    assigned_to: (
      <FormattedMessage id="search.assignedTo" defaultMessage="Assigned to" description="Prefix label for field to filter by assigned users">
        { label => (
          <SearchFieldUser
            teamSlug={team.slug}
            label={label}
            icon={<PersonIcon />}
            selected={query.assigned_to}
            onChange={(newValue) => { handleFilterClick(newValue, 'assigned_to'); }}
            readOnly={readOnlyFields.includes('assigned_to')}
            onRemove={() => handleRemoveField('assigned_to')}
            extraOptions={assignedToOptions}
          />
        )}
      </FormattedMessage>
    ),
    team_tasks: (
      <CustomFiltersManager
        onFilterChange={handleCustomFilterChange}
        team={team}
        query={query}
        operatorToggle={<OperatorToggle />}
      />
    ),
    sources: (
      <SearchFieldSource
        teamSlug={team.slug}
        selected={query.sources}
        readOnly={readOnlyFields.includes('sources')}
        onChange={(newValue) => { handleFilterClick(newValue, 'sources'); }}
        onRemove={() => handleRemoveField('sources')}
      />
    ),
    cluster_teams: (
      <FormattedMessage id="search.clusterTeams" defaultMessage="Organization is" description="Prefix label for field to filter by workspace">
        { label => (
          <SearchFieldClusterTeams
            label={label}
            icon={<CorporateFareIcon />}
            teamSlug={team.slug}
            selected={query.cluster_teams}
            readOnly={readOnlyFields.includes('cluster_teams')}
            onChange={(newValue) => { handleFilterClick(newValue, 'cluster_teams'); }}
            onRemove={() => handleRemoveField('cluster_teams')}
          />
        )}
      </FormattedMessage>
    ),
    cluster_published_reports: (
      <FormattedMessage id="search.publishedBy" defaultMessage="Report published by" description="Prefix label for field to filter by published by">
        { label => (
          <SearchFieldClusterTeams
            label={label}
            icon={<HowToRegIcon />}
            teamSlug={team.slug}
            selected={query.cluster_published_reports}
            readOnly={readOnlyFields.includes('cluster_published_reports')}
            onChange={(newValue) => { handleFilterClick(newValue, 'cluster_published_reports'); }}
            onRemove={() => handleRemoveField('cluster_published_reports')}
          />
        )}
      </FormattedMessage>
    ),
    spam: (
      <SearchFieldDummy
        icon={<SpamIcon />}
        label={<FormattedMessage id="search.spam" defaultMessage="Item is marked as spam" description="Label for spam filter field" />}
      />
    ),
    trash: (
      <SearchFieldDummy
        icon={<DeleteIcon />}
        label={<FormattedMessage id="search.trash" defaultMessage="Item is in the Trash" description="Label for spam filter field" />}
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

  fieldKeys = fieldKeys.concat(Object.keys(query).filter(k => k !== 'keyword' && !hideFields.includes(k) && fieldComponents[k]));

  const addedFields = fieldKeys.filter(i => i !== 'team_tasks');

  const stripTimestamp = (obj) => {
    const ret = { ...obj };
    delete ret.timestamp;
    return ret;
  };

  const stateQueryWithoutTimestamp = stripTimestamp(query);
  const appliedQueryWithoutTimestamp = stripTimestamp(currentQuery);

  console.log('stateQueryWithoutTimestamp', stateQueryWithoutTimestamp); // eslint-disable-line
  console.log('appliedQueryWithoutTimestamp', appliedQueryWithoutTimestamp); // eslint-disable-line

  // We can apply if the state query is dirty (differs from what is applied)
  const canApply = JSON.stringify(stateQueryWithoutTimestamp) !== JSON.stringify(appliedQueryWithoutTimestamp);
  // We can save if the applied query is different from the default query
  const canSave = JSON.stringify(appliedQueryWithoutTimestamp) !== JSON.stringify(defaultQuery);
  const canReset = canApply || canSave;

  return (
    <div>
      <Row flexWrap style={{ gap: '8px' }}>
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
            <span key={key}>
              { fieldComponents[key] }
            </span>
          );
        })}
        <AddFilterMenu
          team={team}
          hideOptions={hideFields}
          addedFields={addedFields}
          onSelect={handleAddField}
        />
        { canReset && <Divider orientation="vertical" flexItem style={{ margin: '0 8px' }} /> }
        { canReset && (
          <ButtonMain
            variant="contained"
            size="default"
            theme="lightText"
            onClick={handleClickClear}
            label={
              <FormattedMessage id="search.resetFilter" defaultMessage="Reset" description="Button label to reset search filters." />
            }
            buttonProps={{
              id: 'search-fields__clear-button',
            }}
          />
        )}
        { canApply && (
          <ButtonMain
            variant="contained"
            size="default"
            theme="lightValidation"
            onClick={handleSubmit}
            label={
              <FormattedMessage id="search.applyFilter" defaultMessage="Apply" description="Button label to apply search filters." />
            }
            buttonProps={{
              id: 'search-fields__submit-button',
            }}
          />
        )}
        { canSave && (
          <SaveList
            team={team}
            query={query}
            savedSearch={savedSearch}
            feedTeam={feedTeam}
            page={page}
          />
        )}
      </Row>
    </div>
  );
};

SearchFields.defaultProps = {
  savedSearch: null,
  feedTeam: null,
  readOnlyFields: [],
};

SearchFields.propTypes = {
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filters: PropTypes.object,
    feedFilters: PropTypes.object,
  }),
  savedSearch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }),
  query: PropTypes.object.isRequired, // FIXME rename to stateQuery
  currentQuery: PropTypes.object.isRequired, // FIXME rename to appliedQuery
  defaultQuery: PropTypes.object.isRequired,
  setQuery: PropTypes.func.isRequired, // FIXME rename to setStateQuery
  onChange: PropTypes.func.isRequired, // onChange({ ... /* query */ }) => undefined
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash']).isRequired, // FIXME Define listing types as a global constant
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
