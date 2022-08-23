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
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import LabelIcon from '@material-ui/icons/Label';
import LanguageIcon from '@material-ui/icons/Language';
import PersonIcon from '@material-ui/icons/Person';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReportIcon from '@material-ui/icons/PlaylistAddCheck';
import RuleIcon from '@material-ui/icons//Rule';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
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
import CheckChannels from '../../../CheckChannels';
import SearchFieldClusterTeams from './SearchFieldClusterTeams';
import CheckArchivedFlags from '../../../CheckArchivedFlags';

/**
 * Return `query`, with property `key` changed to the `newArray`.
 *
 * `undefined` is understood to be the empty array. This function will remove
 * the `key` filter rather than return an empty array.
 */
function updateStateQueryArrayValue(query, key, newArray) {
  if (newArray === undefined) {
    const newQuery = { ...query };
    delete newQuery[key];
    return newQuery;
  }
  return { ...query, [key]: newArray };
}

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

class SearchFields extends React.Component {
  handleAddField = (field) => {
    const newQuery = { ...this.props.query };

    if (field === 'team_tasks') {
      newQuery.team_tasks = this.props.query.team_tasks ?
        [...this.props.query.team_tasks, {}] : [{}];
    } else if (field === 'range') {
      newQuery.range = { created_at: {} };
    } else {
      newQuery[field] = [];
    }

    this.props.setQuery(newQuery);
  };

  handleRemoveField = (field) => {
    const newQuery = { ...this.props.query };
    delete newQuery[field];
    this.props.setQuery(newQuery);
  };

  filterIsActive = () => Object.keys(this.props.query).filter(k => k !== 'keyword').length > 0;

  handleDateChange = (value) => {
    const newQuery = { ...this.props.query, range: value };
    this.props.setQuery(newQuery);
  }

  handleNumericRange = (filterKey, value) => {
    const newQuery = { ...this.props.query };
    newQuery[filterKey] = value;
    this.props.setQuery(newQuery);
  }

  handleCustomFilterChange = (value) => {
    const newQuery = { ...this.props.query, ...value };
    if (JSON.stringify(value) === '{}') {
      delete newQuery.team_tasks;
    }
    this.props.setQuery(newQuery);
  }

  handleReadClick = (readValue) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'read', readValue),
    );
  }

  handleStatusClick = (statusCodes) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'verification_status', statusCodes),
    );
  }

  handleProjectClick = (projectIds) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'projects', projectIds),
    );
  }

  handleHasClaimClick = (claimValue) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'has_claim', claimValue),
    );
  }

  handleUserClick = (userIds) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'users', userIds),
    );
  }

  handleChannelClick = (channelIds) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'channels', channelIds),
    );
  }

  handleTiplineRequestClick = (confirmedValue) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'archived', confirmedValue),
    );
  }

  handleAssignedUserClick = (userIds) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'assigned_to', userIds),
    );
  }

  handleReportStatusClick = (statuses) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'report_status', statuses),
    );
  }

  handlePublishedByClick = (userIds) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'published_by', userIds),
    );
  }

  handleAnnotatedByClick = (userIds) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'annotated_by', userIds),
    );
  }

  handleProjectGroupClick = (projectGroupDbids) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'project_group_id', projectGroupDbids),
    );
  }

  handleTagClick = (tags) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'tags', tags),
    );
  }

  handleSourceClick = (sources) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'sources', sources),
    );
  }

  handleClusterTeamsClick = (teamIds) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'cluster_teams', teamIds),
    );
  }

  handleClusterPublishedReportsClick = (teamIds) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'cluster_published_reports', teamIds),
    );
  }

  handleTagsOperator = () => {
    const operator = this.tagsOperatorIs('or') ? 'and' : 'or';
    this.props.setQuery(
      { ...this.props.query, tags_operator: operator },
    );
  }

  handleSwitchOperator = (key) => {
    const operator = this.switchOperatorIs('or', key) ? 'and' : 'or';
    const query = { ...this.props.query };
    query[key] = operator;
    this.props.setQuery(query);
  }

  switchOperatorIs(operator, key) {
    let currentOperator = 'or'; // "or" is the default
    if (this.props.query && this.props.query[key]) {
      currentOperator = this.props.query[key];
    }
    return currentOperator === operator;
  }

  handleShowClick = (type) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'show', type),
    );
  }

  handleLanguageClick = (language) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'language', language),
    );
  }

  handleClickClear = () => {
    const { keyword } = this.props.query;
    const newQuery = { keyword };
    this.props.setQuery(newQuery);
    this.props.onChange(newQuery);
  };

  handleOperatorClick = () => {
    const operator = this.props.query.operator === 'OR' ? 'AND' : 'OR';
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'operator', operator),
    );
  }

  render() {
    const {
      team,
      project,
      projectGroup,
      feedTeam,
      readOnlyFields,
    } = this.props;
    const { statuses } = team.verification_statuses;

    // Folder options are grouped by collection
    // FIXME: Simplify the code below and improve its performance
    const projects = team.projects.edges.slice().map(p => p.node).sort((a, b) => a.title.localeCompare(b.title));
    let projectOptions = [];
    const projectGroupOptions = [];
    team.project_groups.edges.slice().map(pg => pg.node).sort((a, b) => a.title.localeCompare(b.title)).forEach((pg) => {
      const subProjects = [];
      projectGroupOptions.push({ label: pg.title, value: `${pg.dbid}` });
      projects.filter(p => p.project_group_id === pg.dbid).forEach((p) => {
        subProjects.push({ label: p.title, value: `${p.dbid}` });
      });
      if (subProjects.length > 0) {
        projectOptions.push({ label: pg.title, value: '', projectsTitles: subProjects.map(sp => sp.label).join(',') });
        projectOptions = projectOptions.concat(subProjects);
      }
    });
    const orphanProjects = [];
    projects.filter(p => !p.project_group_id).forEach((p) => {
      orphanProjects.push({ label: p.title, value: `${p.dbid}` });
    });
    if (orphanProjects.length > 0) {
      projectOptions.push({
        label: <FormattedMessage id="search.notInAny" defaultMessage="Not in any collection" description="Label displayed before listing all folders that are not part of any collection" />,
        value: '',
        orphanProjects: orphanProjects.map(op => op.label).join(','),
      });
      projectOptions = projectOptions.concat(orphanProjects);
    }

    const users = team.users ?
      team.users.edges.slice()
        .filter(u => !u.node.is_bot)
        .sort((a, b) => a.node.name.localeCompare(b.node.name)) : [];

    const types = [
      { value: 'claims', label: this.props.intl.formatMessage(messages.claim) },
      { value: 'links', label: this.props.intl.formatMessage(messages.link) },
      { value: 'images', label: this.props.intl.formatMessage(messages.image) },
      { value: 'videos', label: this.props.intl.formatMessage(messages.video) },
      { value: 'audios', label: this.props.intl.formatMessage(messages.audio) },
    ];

    const readValues = [
      { value: '0', label: this.props.intl.formatMessage(messages.unread) },
      { value: '1', label: this.props.intl.formatMessage(messages.read) },
    ];

    const confirmedValues = [
      { value: CheckArchivedFlags.NONE.toString(), label: this.props.intl.formatMessage(messages.confirmed) },
      { value: CheckArchivedFlags.UNCONFIRMED.toString(), label: this.props.intl.formatMessage(messages.unconfirmed) },
    ];

    const hasClaimOptions = [
      { label: this.props.intl.formatMessage(messages.notEmpty), value: 'ANY_VALUE', exclusive: true },
      { label: this.props.intl.formatMessage(messages.empty), value: 'NO_VALUE', exclusive: true },
    ];

    const assignedToOptions = [
      { label: this.props.intl.formatMessage(messages.notEmptyAssign), value: 'ANY_VALUE', exclusive: true },
      { label: this.props.intl.formatMessage(messages.emptyAssign), value: 'NO_VALUE', exclusive: true },
      { label: '', value: '' },
    ];

    const languages = team.get_languages ? JSON.parse(team.get_languages).map(code => ({ value: code, label: languageLabel(code) })) : [];

    const selectedProjects = this.props.query.projects ? this.props.query.projects.map(p => `${p}`) : [];
    const selectedProjectGroups = this.props.query.project_group_id ? this.props.query.project_group_id.map(p => `${p}`) : [];
    let selectedChannels = [];
    if (/tipline-inbox/.test(window.location.pathname)) {
      selectedChannels = [CheckChannels.ANYTIPLINE];
    }
    if (/imported-reports/.test(window.location.pathname)) {
      selectedChannels = [CheckChannels.FETCH];
    }

    const reportStatusOptions = [
      { label: <FormattedMessage id="search.reportStatusUnpublished" defaultMessage="Unpublished" description="Refers to a report status" />, value: 'unpublished' },
      { label: <FormattedMessage id="search.reportStatusPublished" defaultMessage="Published" description="Refers to a report status" />, value: 'published' },
    ];
    if (!/feed/.test(window.location.pathname)) {
      reportStatusOptions.push({ label: <FormattedMessage id="search.reportStatusPaused" defaultMessage="Paused" description="Refers to a report status" />, value: 'paused' });
    }

    const isSpecialPage = /\/(tipline-inbox|imported-reports|suggested-matches)+/.test(window.location.pathname);

    const OperatorToggle = () => {
      let operatorProps = { style: { minWidth: 0, color: checkBlue }, onClick: this.handleOperatorClick };
      if (this.props.page === 'feed') {
        operatorProps = { style: { minWidth: 0, color: 'black' }, disabled: true };
      }
      return (
        <Button {...operatorProps}>
          { this.props.query.operator === 'OR' ?
            <FormattedMessage id="search.fieldOr" defaultMessage="or" description="Logical operator 'OR' to be applied when filtering by multiple fields" /> :
            <FormattedMessage id="search.fieldAnd" defaultMessage="and" description="Logical operator 'AND' to be applied when filtering by multiple fields" />
          }
        </Button>
      );
    };

    const fieldComponents = {
      projects: (
        <FormattedMessage id="search.folderHeading" defaultMessage="Folder is" description="Prefix label for field to filter by folder to which items belong">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<FolderOpenIcon />}
              selected={project ? [`${project.dbid}`] : selectedProjects}
              options={projectOptions}
              onChange={this.handleProjectClick}
              readOnly={Boolean(project) || readOnlyFields.includes('projects')}
              onRemove={() => this.handleRemoveField('projects')}
            />
          )}
        </FormattedMessage>
      ),
      has_claim: (
        <FormattedMessage id="search.claim" defaultMessage="Claim field is" description="Prefix label for field to filter by claim">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<RuleIcon />}
              allowSearch={false}
              selected={this.props.query.has_claim}
              options={hasClaimOptions}
              readOnly={readOnlyFields.includes('has_claim')}
              onChange={this.handleHasClaimClick}
              onRemove={() => this.handleRemoveField('has_claim')}
            />
          )}
        </FormattedMessage>
      ),
      project_group_id: (
        <FormattedMessage id="search.collection" defaultMessage="Collection is" description="Prefix label for field to filter by collection">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<FolderSpecialIcon />}
              selected={projectGroup ? [`${projectGroup.dbid}`] : selectedProjectGroups}
              options={projectGroupOptions}
              onChange={this.handleProjectGroupClick}
              readOnly={Boolean(projectGroup) || readOnlyFields.includes('projects')}
              onRemove={() => this.handleRemoveField('project_group_id')}
            />
          )}
        </FormattedMessage>
      ),
      range: (
        <Box maxWidth="900px">
          <DateRangeFilter
            onChange={this.handleDateChange}
            value={this.props.query.range}
            readOnly={readOnlyFields.includes('range')}
            onRemove={() => this.handleRemoveField('range')}
          />
        </Box>
      ),
      tags: (
        <SearchFieldTag
          teamSlug={team.slug}
          selected={this.props.query.tags}
          onChange={(newValue) => {
            this.handleTagClick(newValue);
          }}
          onToggleOperator={() => this.handleSwitchOperator('tags_operator')}
          operator={this.props.query.tags_operator}
          readOnly={readOnlyFields.includes('tags')}
          onRemove={() => this.handleRemoveField('tags')}
        />
      ),
      show: (
        <FormattedMessage id="search.show" defaultMessage="Type is" description="Prefix label for field to filter by media type">
          { label => (
            <MultiSelectFilter
              allowSearch={false}
              label={label}
              icon={<DescriptionIcon />}
              selected={this.props.query.show}
              options={types}
              readOnly={readOnlyFields.includes('show')}
              onChange={this.handleShowClick}
              onRemove={() => this.handleRemoveField('show')}
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
              selected={this.props.query.read}
              options={readValues}
              readOnly={readOnlyFields.includes('read')}
              onChange={this.handleReadClick}
              onRemove={() => this.handleRemoveField('read')}
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
              selected={this.props.query.verification_status}
              options={statuses.map(s => ({ label: s.label, value: s.id }))}
              readOnly={readOnlyFields.includes('verification_status')}
              onChange={this.handleStatusClick}
              onRemove={() => this.handleRemoveField('verification_status')}
            />
          )}
        </FormattedMessage>
      ),
      users: (
        <FormattedMessage id="search.userHeading" defaultMessage="Created by" description="Prefix label for field to filter by item creator">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<PersonIcon />}
              selected={this.props.query.users}
              options={users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` }))}
              readOnly={readOnlyFields.includes('users')}
              onChange={this.handleUserClick}
              onRemove={() => this.handleRemoveField('users')}
            />
          )}
        </FormattedMessage>
      ),
      channels: (
        <SearchFieldChannel
          selected={this.props.query.channels || selectedChannels}
          onChange={this.handleChannelClick}
          onRemove={() => this.handleRemoveField('channels')}
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
              selected={this.props.query.archived}
              options={confirmedValues}
              readOnly={readOnlyFields.includes('archived')}
              onChange={this.handleTiplineRequestClick}
              onRemove={() => this.handleRemoveField('archived')}
              single
            />
          )}
        </FormattedMessage>
      ),
      linked_items_count: (
        <Box maxWidth="700px">
          <NumericRangeFilter
            filterKey="linked_items_count"
            onChange={this.handleNumericRange}
            value={this.props.query.linked_items_count}
            readOnly={readOnlyFields.includes('linked_items_count')}
            onRemove={() => this.handleRemoveField('linked_items_count')}
          />
        </Box>
      ),
      suggestions_count: (
        <Box maxWidth="700px">
          <NumericRangeFilter
            filterKey="suggestions_count"
            onChange={this.handleNumericRange}
            value={this.props.query.suggestions_count}
            onRemove={() => this.handleRemoveField('suggestions_count')}
            readOnly={isSpecialPage || readOnlyFields.includes('suggestions_count')}
          />
        </Box>
      ),
      demand: (
        <Box maxWidth="700px">
          <NumericRangeFilter
            filterKey="demand"
            onChange={this.handleNumericRange}
            readOnly={readOnlyFields.includes('demand')}
            value={this.props.query.demand}
            onRemove={() => this.handleRemoveField('demand')}
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
              selected={this.props.query.report_status}
              options={reportStatusOptions}
              readOnly={readOnlyFields.includes('report_status')}
              onChange={this.handleReportStatusClick}
              onRemove={() => this.handleRemoveField('report_status')}
            />
          )}
        </FormattedMessage>
      ),
      published_by: (
        <FormattedMessage id="search.publishedBy" defaultMessage="Report published by" description="Prefix label for field to filter by published by">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<HowToRegIcon />}
              selected={this.props.query.published_by}
              options={users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` }))}
              readOnly={readOnlyFields.includes('published_by')}
              onChange={this.handlePublishedByClick}
              onRemove={() => this.handleRemoveField('published_by')}
            />
          )}
        </FormattedMessage>
      ),
      annotated_by: (
        <FormattedMessage id="search.annotatedBy" defaultMessage="Annotated by" description="Prefix label for field to filter by annotated by">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<PersonIcon />}
              selected={this.props.query.annotated_by}
              options={users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` }))}
              readOnly={readOnlyFields.includes('annotated_by')}
              onChange={this.handleAnnotatedByClick}
              onRemove={() => this.handleRemoveField('annotated_by')}
              onToggleOperator={() => this.handleSwitchOperator('annotated_by_operator')}
              operator={this.props.query.annotated_by_operator}
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
              selected={this.props.query.language}
              options={languages}
              readOnly={readOnlyFields.includes('language')}
              onChange={(newValue) => { this.handleLanguageClick(newValue); }}
              onRemove={() => this.handleRemoveField('language')}
            />
          )}
        </FormattedMessage>
      ),
      assigned_to: (
        <FormattedMessage id="search.assignedTo" defaultMessage="Assigned to" description="Prefix label for field to filter by assigned users">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<PersonIcon />}
              selected={this.props.query.assigned_to}
              options={assignedToOptions.concat(users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` })))}
              readOnly={readOnlyFields.includes('assigned_to')}
              onChange={this.handleAssignedUserClick}
              onRemove={() => this.handleRemoveField('assigned_to')}
            />
          )}
        </FormattedMessage>
      ),
      team_tasks: (
        <CustomFiltersManager
          onFilterChange={this.handleCustomFilterChange}
          team={team}
          query={this.props.query}
          operatorToggle={<OperatorToggle />}
        />
      ),
      sources: (
        <SearchFieldSource
          teamSlug={team.slug}
          selected={this.props.query.sources}
          readOnly={readOnlyFields.includes('sources')}
          onChange={(newValue) => { this.handleSourceClick(newValue); }}
          onRemove={() => this.handleRemoveField('sources')}
        />
      ),
      cluster_teams: (
        <FormattedMessage id="search.clusterTeams" defaultMessage="Organization is" description="Prefix label for field to filter by workspace">
          { label => (
            <SearchFieldClusterTeams
              label={label}
              icon={<CorporateFareIcon />}
              teamSlug={team.slug}
              selected={this.props.query.cluster_teams}
              readOnly={readOnlyFields.includes('cluster_teams')}
              onChange={(newValue) => { this.handleClusterTeamsClick(newValue); }}
              onRemove={() => this.handleRemoveField('cluster_teams')}
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
              selected={this.props.query.cluster_published_reports}
              readOnly={readOnlyFields.includes('cluster_published_reports')}
              onChange={(newValue) => { this.handleClusterPublishedReportsClick(newValue); }}
              onRemove={() => this.handleRemoveField('cluster_published_reports')}
            />
          )}
        </FormattedMessage>
      ),
    };

    let fieldKeys = [];
    if (this.props.project) fieldKeys.push('projects');
    if (this.props.projectGroup) fieldKeys.push('project_group_id');
    if (/\/(tipline-inbox|imported-reports)+/.test(window.location.pathname)) fieldKeys.push('channels');

    const { hideFields } = this.props;

    fieldKeys = fieldKeys.concat(Object.keys(this.props.query).filter(k => k !== 'keyword' && hideFields.indexOf(k) === -1 && fieldComponents[k]));
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
            onSelect={this.handleAddField}
          />
          <Tooltip title={<FormattedMessage id="search.applyFilters" defaultMessage="Apply filter" description="Button to perform query with specified filters" />}>
            <IconButton id="search-fields__submit-button" onClick={this.props.handleSubmit} size="small">
              <PlayArrowIcon color="primary" />
            </IconButton>
          </Tooltip>
          { this.filterIsActive() ? (
            <Tooltip title={<FormattedMessage id="searchFields.clear" defaultMessage="Clear filters" description="Tooltip for button to remove any applied filters" />}>
              <IconButton id="search-fields__clear-button" onClick={this.handleClickClear} size="small">
                <ClearIcon color="primary" />
              </IconButton>
            </Tooltip>
          ) : null }
          { can(team.permissions, 'update Team') ?
            <SaveList team={team} query={this.props.query} project={project} projectGroup={projectGroup} savedSearch={this.props.savedSearch} feedTeam={feedTeam} />
            : null }
        </Row>
      </div>
    );
  }
}

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
    projects: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
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
    projects(first: 10000) {
      edges {
        node {
          title
          dbid
          id
          description
          project_group_id
        }
      }
    }
    project_groups(first: 10000) {
      edges {
        node {
          title
          dbid
        }
      }
    }
    users(first: 10000) {
      edges {
        node {
          id
          dbid
          name
          is_bot
        }
      }
    }
  }
`);
