/* eslint-disable relay/unused-fields */
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import ClearIcon from '@material-ui/icons/Clear';
import DescriptionIcon from '@material-ui/icons/Description';
import LabelIcon from '@material-ui/icons/Label';
import LanguageIcon from '@material-ui/icons/Language';
import PersonIcon from '@material-ui/icons/Person';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReportIcon from '@material-ui/icons/PlaylistAddCheck';
import RuleIcon from '@material-ui/icons//Rule';
import MarkunreadIcon from '@material-ui/icons/Markunread';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import ErrorIcon from '@material-ui/icons/Error';
import CorporateFareIcon from '@material-ui/icons/CorporateFare';
import CustomFiltersManager from '../CustomFiltersManager';
import AddFilterMenu from '../AddFilterMenu';
import DateRangeFilter from '../DateRangeFilter';
import NumericRangeFilter from '../NumericRangeFilter';
import MultiSelectFilter from '../MultiSelectFilter';
import SaveList from '../SaveList';
import { can } from '../../Can';
import { languageLabel } from '../../../LanguageRegistry';
import { Row, checkBlue } from '../../../styles/js/shared';
import SearchFieldSource from './SearchFieldSource';
import SearchFieldTag from './SearchFieldTag';
import SearchFieldChannel from './SearchFieldChannel';
import SearchFieldProject from './SearchFieldProject';
import SearchFieldProjectGroup from './SearchFieldProjectGroup';
import SearchFieldUser from './SearchFieldUser';
import SearchFieldClusterTeams from './SearchFieldClusterTeams';
import CheckArchivedFlags from '../../../CheckArchivedFlags';

const messages = defineMessages({
  claim: {
    id: 'search.showClaims',
    defaultMessage: 'Text',
    description: 'Describes media type Text',
  },
  link: {
    id: 'search.showLinks',
    defaultMessage: 'Link',
    description: 'Describes media type Link',
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
  project,
  projectGroup,
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

  const filterIsActive = () => Object.keys(query).filter(k => k !== 'keyword').length > 0;

  const handleDateChange = (value) => {
    const newQuery = { ...query, range: value };
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
    const newQuery = { keyword };
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
    { value: 'claims', label: intl.formatMessage(messages.claim) },
    { value: 'links', label: intl.formatMessage(messages.link) },
    { value: 'images', label: intl.formatMessage(messages.image) },
    { value: 'videos', label: intl.formatMessage(messages.video) },
    { value: 'audios', label: intl.formatMessage(messages.audio) },
  ];

  const readValues = [
    { value: '0', label: intl.formatMessage(messages.unread) },
    { value: '1', label: intl.formatMessage(messages.read) },
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

  const languages = team.get_languages ? JSON.parse(team.get_languages).map(code => ({ value: code, label: languageLabel(code) })) : [];

  const reportStatusOptions = [
    { label: <FormattedMessage id="search.reportStatusUnpublished" defaultMessage="Unpublished" description="Refers to a report status" />, value: 'unpublished' },
    { label: <FormattedMessage id="search.reportStatusPublished" defaultMessage="Published" description="Refers to a report status" />, value: 'published' },
  ];
  if (!/feed/.test(window.location.pathname)) {
    reportStatusOptions.push({ label: <FormattedMessage id="search.reportStatusPaused" defaultMessage="Paused" description="Refers to a report status" />, value: 'paused' });
  }

  const isSpecialPage = /\/(tipline-inbox|imported-reports|suggested-matches)+/.test(window.location.pathname);

  const OperatorToggle = () => {
    let operatorProps = { style: { minWidth: 0, color: checkBlue }, onClick: handleOperatorClick };
    if (page === 'feed') {
      operatorProps = { style: { minWidth: 0, color: 'black' }, disabled: true };
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
    projects: (
      <SearchFieldProject
        teamSlug={team.slug}
        query={query}
        project={project}
        onChange={(newValue) => { handleFilterClick(newValue, 'projects'); }}
        readOnly={Boolean(project) || readOnlyFields.includes('projects')}
        onRemove={() => handleRemoveField('projects')}
      />
    ),
    has_claim: (
      <FormattedMessage id="search.claim" defaultMessage="Claim field is" description="Prefix label for field to filter by claim">
        { label => (
          <MultiSelectFilter
            label={label}
            icon={<RuleIcon />}
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
    project_group_id: (
      <SearchFieldProjectGroup
        teamSlug={team.slug}
        projectGroup={projectGroup}
        query={query}
        onChange={(newValue) => { handleFilterClick(newValue, 'project_group_id'); }}
        readOnly={Boolean(projectGroup) || readOnlyFields.includes('project_group_id')}
        onRemove={() => handleRemoveField('project_group_id')}
      />
    ),
    range: (
      <Box maxWidth="900px">
        <DateRangeFilter
          onChange={handleDateChange}
          value={query.range}
          readOnly={readOnlyFields.includes('range')}
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
      <FormattedMessage id="search.statusHeading" defaultMessage="Item status is" description="Prefix label for field to filter by status">
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
        readOnly={isSpecialPage || readOnlyFields.includes('channels')}
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
          readOnly={isSpecialPage || readOnlyFields.includes('suggestions_count')}
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
    language: (
      <FormattedMessage id="search.language" defaultMessage="Language is" description="Prefix label for field to filter by language">
        { label => (
          <MultiSelectFilter
            label={label}
            icon={<LanguageIcon />}
            selected={query.language}
            options={languages}
            readOnly={readOnlyFields.includes('language')}
            onChange={(newValue) => { handleFilterClick(newValue, 'language'); }}
            onRemove={() => handleRemoveField('language')}
          />
        )}
      </FormattedMessage>
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
  };

  let fieldKeys = [];
  if (project) fieldKeys.push('projects');
  if (projectGroup) fieldKeys.push('project_group_id');
  if (/\/(tipline-inbox|imported-reports)+/.test(window.location.pathname)) fieldKeys.push('channels');

  fieldKeys = fieldKeys.concat(Object.keys(query).filter(k => k !== 'keyword' && hideFields.indexOf(k) === -1 && fieldComponents[k]));
  const addedFields = fieldKeys.filter(i => i !== 'team_tasks');

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
        <Tooltip title={<FormattedMessage id="search.applyFilters" defaultMessage="Apply filter" description="Button to perform query with specified filters" />}>
          <IconButton id="search-fields__submit-button" onClick={handleSubmit} size="small">
            <PlayArrowIcon color="primary" />
          </IconButton>
        </Tooltip>
        { filterIsActive() ? (
          <Tooltip title={<FormattedMessage id="searchFields.clear" defaultMessage="Clear filters" description="Tooltip for button to remove any applied filters" />}>
            <IconButton id="search-fields__clear-button" onClick={handleClickClear} size="small">
              <ClearIcon color="primary" />
            </IconButton>
          </Tooltip>
        ) : null }
        { can(team.permissions, 'update Team') ?
          <SaveList team={team} query={query} project={project} projectGroup={projectGroup} savedSearch={savedSearch} feedTeam={feedTeam} />
          : null }
      </Row>
    </div>
  );
};

SearchFields.defaultProps = {
  project: null,
  projectGroup: null,
  savedSearch: null,
  feedTeam: null,
  readOnlyFields: [],
};

SearchFields.propTypes = {
  project: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
  projectGroup: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
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
  query: PropTypes.object.isRequired,
  setQuery: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired, // onChange({ ... /* query */ }) => undefined
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
    verification_statuses: PropTypes.object.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
  page: PropTypes.string.isRequired,
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
    get_languages
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
