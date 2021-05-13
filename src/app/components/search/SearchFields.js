import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ClearIcon from '@material-ui/icons/Clear';
import DescriptionIcon from '@material-ui/icons/Description';
import FolderIcon from '@material-ui/icons/Folder';
import LabelIcon from '@material-ui/icons/Label';
import LanguageIcon from '@material-ui/icons/Language';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PersonIcon from '@material-ui/icons/Person';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReportIcon from '@material-ui/icons/PlaylistAddCheck';
import deepEqual from 'deep-equal';
import CustomFiltersManager from './CustomFiltersManager';
// eslint-disable-next-line no-unused-vars
import CustomTeamTaskFilter from './CustomTeamTaskFilter'; // Needed for CustomTeamTaskFilter_team fragment
import AddFilterMenu from './AddFilterMenu';
import DateRangeFilter from './DateRangeFilter';
import MultiSelectFilter from './MultiSelectFilter';
import SaveList from './SaveList';
import { Row } from '../../styles/js/shared';

/**
 * Return `query`, with property `key` changed to the `newArray`.
 *
 * `undefined` is understood to be the empty array. This function will remove
 * the `key` filter rather than return an empty array.
 */
function updateStateQueryArrayValue(query, key, newArray) {
  if (newArray === undefined || newArray.length === 0) {
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
  blank: {
    id: 'search.showBlank',
    defaultMessage: 'Imported report',
    description: 'Describes media type unspecified',
  },
});

class SearchFields extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: props.query, // CODE SMELL! Caller must use `key=` to reset state on prop change
      addedFields: [],
    };
  }

  cleanup = (query) => {
    const cleanQuery = { ...query };
    if (query.team_tasks) {
      cleanQuery.team_tasks = query.team_tasks.filter(tt => (
        tt.id && tt.response && tt.response_type
      ));
      if (!cleanQuery.team_tasks.length) {
        delete cleanQuery.team_tasks;
      }
    }
    if (query.range) {
      const datesObj =
        query.range.created_at ||
        query.range.updated_at ||
        query.range.published_at ||
        query.range.last_seen || {};
      if (!datesObj.start_time && !datesObj.end_time) {
        delete cleanQuery.range;
      }
    }
    return cleanQuery;
  }

  handleAddField = (field) => {
    if (field === 'team_tasks') {
      const newQuery = {};
      newQuery.team_tasks = this.state.query.team_tasks ?
        [...this.state.query.team_tasks, {}] : [{}];
      this.handleCustomFilterChange(newQuery);
    }

    const addedFields = [...this.state.addedFields, field];
    this.setState({ addedFields });
  };

  handleApplyFilters() {
    const cleanQuery = this.cleanup(this.state.query);
    if (this.filterIsApplicable(cleanQuery)) {
      this.props.onChange(cleanQuery);
    } else {
      this.setState({ query: cleanQuery, addedFields: [] });
    }
  }

  fieldIsDisplayed = field => (
    (field === 'projects' && Boolean(this.props.project)) ||
    (this.state.addedFields.includes(field) || this.props.query[field])
  );

  filterIsActive = () => {
    const { query } = this.props;
    const filterFields = [
      'range',
      'verification_status',
      'projects',
      'tags',
      'type',
      'dynamic',
      'users',
      'read',
      'show',
      'team_tasks',
    ];
    return filterFields.some(key => !!query[key]) || this.state.addedFields.length > 0;
  };

  filterIsApplicable = () => {
    const cleanQuery = this.cleanup(this.state.query);
    return (!deepEqual(cleanQuery, this.props.query));
  };

  readIsSelected(isRead) {
    return this.state.query.read === isRead;
  }

  handleDateChange = (value) => {
    this.setState({ query: { ...this.state.query, range: value } });
  }

  handleCustomFilterChange = (value) => {
    this.setState({ query: { ...this.state.query, ...value } });
  }

  handleStatusClick = (statusCodes) => {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'verification_status', statusCodes),
    });
  }

  handleProjectClick = (projectIds) => {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'projects', projectIds),
    });
  }

  handleUserClick = (userIds) => {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'users', userIds),
    });
  }

  handleAssignedUserClick = (userIds) => {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'assigned_to', userIds),
    });
  }

  handleReportStatusClick = (statuses) => {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'report_status', statuses),
    });
  }

  handleReadClick = (isRead) => {
    this.setState({
      query: { ...this.state.query, read: isRead },
    });
  }

  handleTagClick = (tags) => {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'tags', tags),
    });
  }

  handleTagsOperator = () => {
    const operator = this.tagsOperatorIs('or') ? 'and' : 'or';
    this.setState({
      query: { ...this.state.query, tags_operator: operator },
    });
  }

  tagsOperatorIs(operator) {
    let currentOperator = 'or'; // "or" is the default
    if (this.state.query && this.state.query.tags_operator) {
      currentOperator = this.state.query.tags_operator;
    }
    return currentOperator === operator;
  }

  handleShowClick = (type) => {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'show', type),
    });
  }

  handleDynamicClick = (field, newValue) => {
    const { query } = this.state;
    const oldDynamic = query.dynamic ? query.dynamic : {};
    const newDynamic = updateStateQueryArrayValue(oldDynamic, field, newValue);
    if (Object.keys(newDynamic).length === 0) {
      const newQuery = { ...query };
      delete newQuery.dynamic;
      this.setState({ query: newQuery });
    } else {
      this.setState({
        query: { ...query, dynamic: newDynamic },
      });
    }
  }

  hideField(field) {
    return this.props.hideFields ? this.props.hideFields.indexOf(field) > -1 : false;
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    this.handleApplyFilters();
  }

  handleClickClear = () => {
    this.setState({ addedFields: [] });
    this.props.onChange({});
  }

  render() {
    const { team, project } = this.props;
    const { statuses } = team.verification_statuses;

    // Folder options are grouped by collection
    // FIXME: Simplify the code below and improve its performance
    const projects = team.projects.edges.slice().map(p => p.node).sort((a, b) => a.title.localeCompare(b.title));
    let projectOptions = [];
    team.project_groups.edges.slice().map(pg => pg.node).sort((a, b) => a.title.localeCompare(b.title)).forEach((pg) => {
      const subProjects = [];
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
      projectOptions.push({ label: '', value: '', orphanProjects: orphanProjects.map(op => op.label).join(',') });
      projectOptions = projectOptions.concat(orphanProjects);
    }

    const users = team.users ?
      team.users.edges.slice()
        .sort((a, b) => a.node.name.localeCompare(b.node.name)) : [];

    const plainTagsTexts = team.tag_texts ?
      team.tag_texts.edges.map(t => t.node.text) : [];

    const types = [
      { value: 'claims', label: this.props.intl.formatMessage(typeLabels.claim) },
      { value: 'links', label: this.props.intl.formatMessage(typeLabels.link) },
      { value: 'images', label: this.props.intl.formatMessage(typeLabels.image) },
      { value: 'videos', label: this.props.intl.formatMessage(typeLabels.video) },
      { value: 'audios', label: this.props.intl.formatMessage(typeLabels.audio) },
      { value: 'blank', label: this.props.intl.formatMessage(typeLabels.blank) },
    ];

    const languages = [];
    if (team.dynamic_search_fields_json_schema.properties &&
        team.dynamic_search_fields_json_schema.properties.language) {
      team.dynamic_search_fields_json_schema.properties.language.items.enum.forEach((value, i) => {
        languages.push({
          value,
          label: team.dynamic_search_fields_json_schema.properties.language.items.enumNames[i],
        });
      });
    }

    const fields = [];
    if (this.fieldIsDisplayed('projects')) {
      const selectedProjects = this.state.query.projects ? this.state.query.projects.map(p => `${p}`) : [];
      fields.push(
        <FormattedMessage id="search.folderHeading" defaultMessage="Folder is" description="Prefix label for field to filter by folder to which items belong">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<FolderIcon />}
              selected={project ? [`${project.dbid}`] : selectedProjects}
              options={projectOptions}
              onChange={this.handleProjectClick}
              readOnly={Boolean(project)}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (this.fieldIsDisplayed('range')) {
      fields.push(
        <Box maxWidth="400px">
          <DateRangeFilter
            onChange={this.handleDateChange}
            value={this.state.query.range}
          />
        </Box>,
      );
    }
    if (this.fieldIsDisplayed('tags')) {
      fields.push(
        <FormattedMessage id="search.categoriesHeading" defaultMessage="Tag is" description="Prefix label for field to filter by tags">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<LocalOfferIcon />}
              selected={this.state.query.tags}
              options={plainTagsTexts.map(t => ({ label: t, value: t }))}
              onChange={(newValue) => {
                this.handleTagClick(newValue);
              }}
              onToggleOperator={this.handleTagsOperator}
              operator={this.state.query.tags_operator}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (this.fieldIsDisplayed('show')) {
      fields.push(
        <FormattedMessage id="search.show" defaultMessage="Media type is" description="Prefix label for field to filter by media type">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<DescriptionIcon />}
              selected={this.state.query.show}
              options={types}
              onChange={this.handleShowClick}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (this.fieldIsDisplayed('verification_status')) {
      fields.push(
        <FormattedMessage id="search.statusHeading" defaultMessage="Item status is" description="Prefix label for field to filter by status">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<LabelIcon />}
              selected={this.state.query.verification_status}
              options={statuses.map(s => ({ label: s.label, value: s.id }))}
              onChange={this.handleStatusClick}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (this.fieldIsDisplayed('users')) {
      fields.push(
        <FormattedMessage id="search.userHeading" defaultMessage="Created by" description="Prefix label for field to filter by item creator">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<PersonIcon />}
              selected={this.state.query.users}
              options={users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` }))}
              onChange={this.handleUserClick}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (this.fieldIsDisplayed('dynamic')) {
      // The only dynamic filter available right now is language
      fields.push(
        <FormattedMessage id="search.language" defaultMessage="Language is" description="Prefix label for field to filter by language">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<LanguageIcon />}
              selected={this.state.query.dynamic && this.state.query.dynamic.language}
              options={languages}
              onChange={newValue => this.handleDynamicClick('language', newValue)}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (this.fieldIsDisplayed('assigned_to')) {
      fields.push(
        <FormattedMessage id="search.assignedTo" defaultMessage="Assigned to" description="Prefix label for field to filter by assigned users">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<PersonIcon />}
              selected={this.state.query.assigned_to}
              options={users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` }))}
              onChange={this.handleAssignedUserClick}
            />
          )}
        </FormattedMessage>,
      );
    }
    // TODO: Remove "read" field related code if it's not going to be used
    if (this.fieldIsDisplayed('read')) {
      fields.push(
        <FormControlLabel
          control={
            <Switch
              checked={this.readIsSelected(true)}
              onChange={(e) => { this.handleReadClick(e.target.checked); }}
            />
          }
          label={
            <FormattedMessage id="search.readHeading" defaultMessage="Read" description="Label for field to filter by 'item is marked' as read" />
          }
        />,
      );
    }
    if (this.fieldIsDisplayed('report_status')) {
      fields.push(
        <FormattedMessage id="search.reportStatus" defaultMessage="Report status is" description="Prefix label for field to filter by report status">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<ReportIcon />}
              selected={this.state.query.report_status}
              options={[
                { label: <FormattedMessage id="search.reportStatusUnpublished" defaultMessage="Unpublished" description="Refers to a report status" />, value: 'unpublished' },
                { label: <FormattedMessage id="search.reportStatusPaused" defaultMessage="Paused" description="Refers to a report status" />, value: 'paused' },
                { label: <FormattedMessage id="search.reportStatusPublished" defaultMessage="Published" description="Refers to a report status" />, value: 'published' },
              ]}
              onChange={this.handleReportStatusClick}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (this.fieldIsDisplayed('team_tasks')) {
      fields.push(
        <CustomFiltersManager
          onFilterChange={this.handleCustomFilterChange}
          team={team}
          query={this.state.query}
        />,
      );
    }

    return (
      <div>
        <Row style={{ gap: '8px' }}>
          { /* FIXME: Each child in a list should have a unique "key" prop */}
          { fields.map((field, index) => index > 0 ? (
            <React.Fragment>
              <Box height="36px" display="flex" alignItems="center">
                <FormattedMessage id="search.fieldAnd" defaultMessage="AND" description="Logical operator to be applied when filtering by multiple fields" />
              </Box>
              {field}
            </React.Fragment>
          ) : (
            <span>
              {field}
            </span>
          )) }
          <AddFilterMenu hideOptions={this.props.hideFields} onSelect={this.handleAddField} />
          { this.state.addedFields.length || this.filterIsApplicable() ?
            <Tooltip title={<FormattedMessage id="search.applyFilters" defaultMessage="Apply filter" description="Button to perform query with specified filters" />}>
              <IconButton id="search-fields__submit-button" onClick={this.handleSubmit} size="small">
                <PlayArrowIcon color="primary" />
              </IconButton>
            </Tooltip>
            : null }
          { this.filterIsActive() ? (
            <Tooltip title={<FormattedMessage id="search.clear" defaultMessage="Clear filter" description="Tooltip for button to remove any applied filters" />}>
              <IconButton id="search-fields__clear-button" onClick={this.handleClickClear} size="small">
                <ClearIcon color="primary" />
              </IconButton>
            </Tooltip>
          ) : null }
          <SaveList team={team} query={this.state.query} project={project} savedSearch={this.props.savedSearch} />
        </Row>
      </div>
    );
  }
}

SearchFields.defaultProps = {
  project: null,
  savedSearch: null,
};

SearchFields.propTypes = {
  project: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
  savedSearch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }),
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired, // onChange({ ... /* query */ }) => undefined
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired,
    verification_statuses: PropTypes.object.isRequired,
    projects: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    tag_texts: PropTypes.object.isRequired,
    dynamic_search_fields_json_schema: PropTypes.shape({
      properties: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
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
    tag_texts(first: 10000) {
      edges {
        node {
          text
        }
      }
    }
    dynamic_search_fields_json_schema
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
        }
      }
    }
    ...CustomTeamTaskFilter_team
  }
`);
