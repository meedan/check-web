import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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
import deepEqual from 'deep-equal';
import CustomFiltersManager from './CustomFiltersManager';
// eslint-disable-next-line no-unused-vars
import CustomTeamTaskFilter from './CustomTeamTaskFilter'; // Needed for CustomTeamTaskFilter_team fragment
import AddFilterMenu from './AddFilterMenu';
import DateRangeFilter from './DateRangeFilter';
import MultiSelectFilter from './MultiSelectFilter';
import { Row, opaqueBlack54 } from '../../styles/js/shared';

const NoHoverButton = withStyles({
  root: {
    borderRadius: 0,
    borderLeft: '2px solid white',
    borderRight: '2px solid white',
    height: '36px',
    minWidth: 0,
    margin: 0,
    '&:hover': {
      background: 'transparent',
    },
  },
  text: {
    color: opaqueBlack54,
  },
})(Button);

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

  filterIsAdded = (field) => {
    if (this.state.addedFields.includes(field) || this.props.query[field]) {
      return true;
    }
    if (field === 'projects') {
      return Boolean(this.props.project);
    }
    return false;
  };

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

  // TODO: Merge most *IsSelected and handle*Click into shared functions where possible

  statusIsSelected(statusCode) {
    const array = this.state.query.verification_status;
    return array ? array.includes(statusCode) : false;
  }

  projectIsSelected(projectId) {
    if (this.props.project && this.props.project.dbid === projectId) {
      return true;
    }
    const array = this.state.query.projects;
    return array ? array.includes(projectId) : false;
  }

  userIsSelected(userId) {
    const array = this.state.query.users;
    return array ? array.includes(userId) : false;
  }

  assignedUserIsSelected(userId) {
    const array = this.state.query.assigned_to;
    return array ? array.includes(userId) : false;
  }

  readIsSelected(isRead) {
    return this.state.query.read === isRead;
  }

  tagIsSelected(tag) {
    const array = this.state.query.tags;
    return array ? array.includes(tag) : false;
  }

  showIsSelected(type) {
    const array = this.state.query.show;
    return array ? array.includes(type) : false;
  }

  dynamicIsSelected(field, value) {
    const dynamic = this.state.query.dynamic || {};
    const array = dynamic[field];
    return array ? array.includes(value) : false;
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

  handleProjectClick(projectIds) {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'projects', projectIds),
    });
  }

  handleUserClick(userIds) {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'users', userIds),
    });
  }

  handleAssignedUserClick(userIds) {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'assigned_to', userIds),
    });
  }

  handleReadClick(isRead) {
    this.setState({
      query: { ...this.state.query, read: isRead },
    });
  }

  handleTagClick(tags) {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'tags', tags),
    });
  }

  handleTagsOperator() {
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

  handleShowClick(type) {
    this.setState({
      query: updateStateQueryArrayValue(this.state.query, 'show', type),
    });
  }

  handleDynamicClick(field, newValue) {
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

    const projects = team.projects ?
      team.projects.edges.slice()
        .sort((a, b) => a.node.title.localeCompare(b.node.title)) : [];

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

    const AnyAll = () => (
      <NoHoverButton
        onClick={() => this.handleTagsOperator()}
        disableRipple
      >
        { this.tagsOperatorIs('or') ?
          <FormattedMessage id="search.or" defaultMessage="Or" description="Logical operator to be applied when filtering by multiple tags" /> :
          <FormattedMessage id="search.and" defaultMessage="And" description="Logical operator to be applied when filtering by multiple tags" />
        }
      </NoHoverButton>
    );

    const fields = [];
    if (!(!this.filterIsAdded('projects') || !projects.length)) {
      fields.push(
        <FormattedMessage id="search.folderHeading" defaultMessage="Folder is" description="Prefix label for field to filter by folder to which items belong">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<FolderIcon />}
              hide={!this.filterIsAdded('projects') || !projects.length}
              selected={projects.map(p => p.node).filter(p => this.projectIsSelected(p.dbid))}
              options={projects.map(p => p.node)}
              labelProp="title"
              onChange={(newValue) => {
                this.handleProjectClick(newValue.map(p => p.dbid));
              }}
              readOnly={Boolean(project)}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (!(!this.filterIsAdded('range') || this.hideField('date'))) {
      fields.push(
        <Box maxWidth="400px" mr={1} mb={1}>
          { /* TODO: Move Box margin inside `DateRangeFilter` */ }
          <DateRangeFilter
            hide={!this.filterIsAdded('range') || this.hideField('date')}
            onChange={this.handleDateChange}
            value={this.state.query.range}
          />
        </Box>,
      );
    }
    if (!((!this.filterIsAdded('tags') || this.hideField('tags')) || !plainTagsTexts.length)) {
      fields.push(
        <FormattedMessage id="search.categoriesHeading" defaultMessage="Tag is" description="Prefix label for field to filter by tags">
          { label => (
            <MultiSelectFilter
              switchAndOr={<AnyAll />}
              label={label}
              icon={<LocalOfferIcon />}
              hide={(!this.filterIsAdded('tags') || this.hideField('tags')) || !plainTagsTexts.length}
              selected={plainTagsTexts.filter(t => this.tagIsSelected(t))}
              options={plainTagsTexts}
              labelProp=""
              onChange={(newValue) => {
                this.handleTagClick(newValue);
              }}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (!(!this.filterIsAdded('show') || this.hideField('type'))) {
      fields.push(
        <FormattedMessage id="search.show" defaultMessage="Media type is" description="Prefix label for field to filter by media type">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<DescriptionIcon />}
              hide={!this.filterIsAdded('show') || this.hideField('type')}
              selected={types.filter(t => this.showIsSelected(t.value))}
              options={types}
              onChange={(newValue) => {
                this.handleShowClick(newValue.map(t => t.value));
              }}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (!(!this.filterIsAdded('verification_status') || this.hideField('status'))) {
      fields.push(
        <FormattedMessage id="search.statusHeading" defaultMessage="Item status is" description="Prefix label for field to filter by status">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<LabelIcon />}
              hide={!this.filterIsAdded('verification_status') || this.hideField('status')}
              selected={statuses.filter(s => this.statusIsSelected(s.id))}
              options={statuses}
              onChange={(newValue) => {
                this.handleStatusClick(newValue.map(s => s.id));
              }}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (!(!this.filterIsAdded('users') || this.hideField('user') || !users.length)) {
      fields.push(
        <FormattedMessage id="search.userHeading" defaultMessage="Created by" description="Prefix label for field to filter by item creator">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<PersonIcon />}
              hide={!this.filterIsAdded('users') || this.hideField('user') || !users.length}
              selected={users.map(u => u.node).filter(u => this.userIsSelected(u.dbid))}
              options={users.map(u => u.node)}
              labelProp="name"
              onChange={(newValue) => {
                this.handleUserClick(newValue.map(u => u.dbid));
              }}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (!(!this.filterIsAdded('dynamic') || this.hideField('dynamic') || !languages.length)) {
      // The only dynamic filter available right now is language
      fields.push(
        <FormattedMessage id="search.language" defaultMessage="Language is" description="Prefix label for field to filter by language">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<LanguageIcon />}
              hide={!this.filterIsAdded('dynamic') || this.hideField('dynamic') || !languages.length}
              selected={languages.filter(l => this.dynamicIsSelected('language', l.value))}
              options={languages}
              onChange={(newValue) => {
                this.handleDynamicClick('language', newValue.map(t => t.value));
              }}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (!(!this.filterIsAdded('assigned_to') || this.hideField('assignment') || !users.length)) {
      fields.push(
        <FormattedMessage id="search.assignedTo" defaultMessage="Assigned to" description="Prefix label for field to filter by assigned users">
          { label => (
            <MultiSelectFilter
              label={label}
              icon={<PersonIcon />}
              hide={!this.filterIsAdded('assigned_to') || this.hideField('assignment') || !users.length}
              selected={users.map(u => u.node).filter(u => this.assignedUserIsSelected(u.dbid))}
              options={users.map(u => u.node)}
              labelProp="name"
              onChange={(newValue) => {
                this.handleAssignedUserClick(newValue.map(u => u.dbid));
              }}
            />
          )}
        </FormattedMessage>,
      );
    }
    if (!(!this.filterIsAdded('read') || this.hideField('read'))) {
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
    if (!(!this.filterIsAdded('team_tasks') || this.hideField('team_tasks'))) {
      fields.push(
        <CustomFiltersManager
          hide={!this.filterIsAdded('team_tasks') || this.hideField('team_tasks')}
          onFilterChange={this.handleCustomFilterChange}
          team={team}
          query={this.state.query}
        />,
      );
    }

    return (
      <div>
        <Row flexWrap>
          { /* FIXME: Each child in a list should have a unique "key" prop */}
          { fields.map((field, index) => index > 0 ? (
            <Box display="flex" alignItems="center">
              <Box mr={1} mb={1} height="36px" display="flex" alignItems="center">
                <FormattedMessage id="search.fieldAnd" defaultMessage="AND" description="Logical operator to be applied when filtering by multiple fields" />
              </Box>
              {field}
            </Box>
          ) : (
            <span>
              {field}
            </span>
          )) }
        </Row>

        <AddFilterMenu hideOptions={this.props.hideFields} onSelect={this.handleAddField} />
        { this.state.addedFields.length || this.filterIsApplicable() ?
          <Tooltip title={<FormattedMessage id="search.applyFilters" defaultMessage="Apply filter" description="Button to perform query with specified filters" />}>
            <IconButton id="search-fields__submit-button" onClick={this.handleSubmit}>
              <PlayArrowIcon color="primary" />
            </IconButton>
          </Tooltip>
          : null
        }
        { this.filterIsActive() ? (
          <Tooltip title={<FormattedMessage id="search.clear" defaultMessage="Clear filter" description="Tooltip for button to remove any applied filters" />}>
            <IconButton id="search-fields__clear-button" onClick={this.handleClickClear}>
              <ClearIcon color="primary" />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>
    );
  }
}

SearchFields.defaultProps = {
  project: null,
};

SearchFields.propTypes = {
  project: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired, // onChange({ ... /* query */ }) => undefined
  team: PropTypes.shape({
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
