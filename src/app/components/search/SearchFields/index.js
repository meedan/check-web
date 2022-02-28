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
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PersonIcon from '@material-ui/icons/Person';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReportIcon from '@material-ui/icons/PlaylistAddCheck';
import RuleIcon from '@material-ui/icons//Rule';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import MarkunreadIcon from '@material-ui/icons/Markunread';
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
import SearchFieldChannel from './SearchFieldChannel';
import CheckChannels from '../../../CheckChannels';
import SearchFieldCountry from './SearchFieldCountry';

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

const typeLabels = defineMessages({
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
});

const readLabels = defineMessages({
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
});

const hasClaimLabels = defineMessages({
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
      updateStateQueryArrayValue(this.props.query, 'has_claim', claimValue[0]),
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

  handleCountryClick = (country) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'country', country),
    );
  }

  handleTagsOperator = () => {
    const operator = this.tagsOperatorIs('or') ? 'and' : 'or';
    this.props.setQuery(
      { ...this.props.query, tags_operator: operator },
    );
  }

  tagsOperatorIs(operator) {
    let currentOperator = 'or'; // "or" is the default
    if (this.props.query && this.props.query.tags_operator) {
      currentOperator = this.props.query.tags_operator;
    }
    return currentOperator === operator;
  }

  handleShowClick = (type) => {
    this.props.setQuery(
      updateStateQueryArrayValue(this.props.query, 'show', type),
    );
  }

  handleDynamicClick = (field, newValue) => {
    const { query } = this.props;
    const oldDynamic = query.dynamic ? query.dynamic : {};
    const newDynamic = updateStateQueryArrayValue(oldDynamic, field, newValue);
    if (Object.keys(newDynamic).length === 0) {
      const newQuery = { ...query };
      delete newQuery.dynamic;
      this.props.setQuery(newQuery);
    } else {
      this.props.setQuery({ ...query, dynamic: newDynamic });
    }
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
    const { team, project, projectGroup } = this.props;
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

    const plainTagsTexts = team.tag_texts ?
      team.tag_texts.edges.map(t => t.node.text) : [];

    const types = [
      { value: 'claims', label: this.props.intl.formatMessage(typeLabels.claim) },
      { value: 'links', label: this.props.intl.formatMessage(typeLabels.link) },
      { value: 'images', label: this.props.intl.formatMessage(typeLabels.image) },
      { value: 'videos', label: this.props.intl.formatMessage(typeLabels.video) },
      { value: 'audios', label: this.props.intl.formatMessage(typeLabels.audio) },
    ];

    const readValues = [
      { value: '0', label: this.props.intl.formatMessage(readLabels.unread) },
      { value: '1', label: this.props.intl.formatMessage(readLabels.read) },
    ];

    const hasClaimOptions = [
      { label: this.props.intl.formatMessage(hasClaimLabels.notEmpty), value: 'ANY_VALUE', exclusive: true },
      { label: this.props.intl.formatMessage(hasClaimLabels.empty), value: 'NO_VALUE', exclusive: true },
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

    const isSpecialPage = /\/(tipline-inbox|imported-reports|suggested-matches)+/.test(window.location.pathname);

    const OperatorToggle = () => (
      <Button style={{ minWidth: 0, color: checkBlue }} onClick={this.handleOperatorClick}>
        { this.props.query.operator === 'OR' ?
          <FormattedMessage id="search.fieldOr" defaultMessage="or" description="Logical operator 'OR' to be applied when filtering by multiple fields" /> :
          <FormattedMessage id="search.fieldAnd" defaultMessage="and" description="Logical operator 'AND' to be applied when filtering by multiple fields" />
        }
      </Button>
    );

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
              readOnly={Boolean(project)}
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
              readOnly={Boolean(projectGroup)}
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
            onRemove={() => this.handleRemoveField('range')}
          />
        </Box>
      ),
      tags: (
        <FormattedMessage id="search.categoriesHeading" defaultMessage="Tag is" description="Prefix label for field to filter by tags">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<LocalOfferIcon />}
              selected={this.props.query.tags}
              options={plainTagsTexts.map(t => ({ label: t, value: t }))}
              onChange={(newValue) => {
                this.handleTagClick(newValue);
              }}
              onToggleOperator={this.handleTagsOperator}
              operator={this.props.query.tags_operator}
              onRemove={() => this.handleRemoveField('tags')}
            />
          )}
        </FormattedMessage>
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
          readOnly={isSpecialPage}
        />
      ),
      linked_items_count: (
        <Box maxWidth="700px">
          <NumericRangeFilter
            filterKey="linked_items_count"
            onChange={this.handleNumericRange}
            value={this.props.query.linked_items_count}
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
            readOnly={isSpecialPage}
          />
        </Box>
      ),
      demand: (
        <Box maxWidth="700px">
          <NumericRangeFilter
            filterKey="demand"
            onChange={this.handleNumericRange}
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
              options={[
                { label: <FormattedMessage id="search.reportStatusUnpublished" defaultMessage="Unpublished" description="Refers to a report status" />, value: 'unpublished' },
                { label: <FormattedMessage id="search.reportStatusPaused" defaultMessage="Paused" description="Refers to a report status" />, value: 'paused' },
                { label: <FormattedMessage id="search.reportStatusPublished" defaultMessage="Published" description="Refers to a report status" />, value: 'published' },
              ]}
              onChange={this.handleReportStatusClick}
              onRemove={() => this.handleRemoveField('report_status')}
            />
          )}
        </FormattedMessage>
      ),
      dynamic: (
        <FormattedMessage id="search.language" defaultMessage="Language is" description="Prefix label for field to filter by language">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<LanguageIcon />}
              selected={this.props.query.dynamic && this.props.query.dynamic.language}
              options={languages}
              onChange={newValue => this.handleDynamicClick('language', newValue)}
              onRemove={() => this.handleRemoveField('dynamic')}
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
              options={users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` }))}
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
          onChange={(newValue) => { this.handleSourceClick(newValue); }}
          onRemove={() => this.handleRemoveField('sources')}
        />
      ),
      country: (
        <SearchFieldCountry
          selected={team?.country || this.props.query.country}
          onChange={(newValue) => { this.handleCountryClick(newValue); }}
          onRemove={() => this.handleRemoveField('country')}
          readOnly
        />
      ),
    };

    let fieldKeys = [];
    if (this.props.project) fieldKeys.push('projects');
    if (this.props.projectGroup) fieldKeys.push('project_group_id');
    if (/\/(tipline-inbox|imported-reports)+/.test(window.location.pathname)) fieldKeys.push('channels');

    fieldKeys = fieldKeys.concat(Object.keys(this.props.query).filter(k => k !== 'keyword' && fieldComponents[k]));
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
            hideOptions={this.props.hideFields}
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
            <SaveList team={team} query={this.props.query} project={project} projectGroup={projectGroup} savedSearch={this.props.savedSearch} />
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
};

SearchFields.propTypes = {
  project: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
  projectGroup: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
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
    tag_texts: PropTypes.object.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
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
    country
    smooch_bot: team_bot_installation(bot_identifier: "smooch") {
      id
    }
    alegre_bot: team_bot_installation(bot_identifier: "alegre") {
      id
      alegre_settings
    }
    tag_texts(first: 10000) {
      edges {
        node {
          text
        }
      }
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
    ...CustomFiltersManager_team
  }
`);
