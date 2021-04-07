import React from 'react';
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
import deepEqual from 'deep-equal';
// import CustomFiltersManager from './CustomFiltersManager';
import AddFilterMenu from './AddFilterMenu';
import DateRangeFilter from './DateRangeFilter';
import MultiSelectFilter from './MultiSelectFilter';
import CheckContext from '../../CheckContext';
import {
  white,
  black16,
  brandHighlight,
  Row,
  units,
  borderWidthLarge,
} from '../../styles/js/shared';

const styles = theme => ({
  margin: {
    marginLeft: theme.spacing(1),
    padding: `5px ${units(2)}`,
  },
  filterInactive: {
    border: `${borderWidthLarge} solid ${black16}`,
  },
  filterActive: {
    color: white,
    backgroundColor: brandHighlight,
    border: `${borderWidthLarge} solid ${brandHighlight}`,
  },
  inputInactive: {
    borderRadius: theme.spacing(0.5),
    border: `${borderWidthLarge} solid ${black16}`,
  },
  inputActive: {
    borderRadius: theme.spacing(0.5),
    border: `${borderWidthLarge} solid ${brandHighlight}`,
  },
  startAdornmentRoot: {
    display: 'flex',
    justifyContent: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  endAdornmentRoot: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  endAdornmentInactive: {
    backgroundColor: black16,
  },
  endAdornmentActive: {
    color: 'white',
    backgroundColor: brandHighlight,
  },
  noHoverButton: {
    minWidth: 0,
    margin: theme.spacing(1),
    '&:hover': {
      background: 'transparent',
    },
  },
});

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
  },
  link: {
    id: 'search.showLinks',
    defaultMessage: 'Link',
  },
  image: {
    id: 'search.showImages',
    defaultMessage: 'Image',
  },
  video: {
    id: 'search.showVideos',
    defaultMessage: 'Video',
  },
  audio: {
    id: 'search.showAudios',
    defaultMessage: 'Audio',
  },
  blank: {
    id: 'search.showBlank',
    defaultMessage: 'Imported report',
  },
});

class SearchQueryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.searchInput = React.createRef();

    this.state = {
      query: props.query, // CODE SMELL! Caller must use `key=` to reset state on prop change
      addedFields: [],
    };
  }

  getContext() {
    return new CheckContext(this);
  }

  currentContext() {
    return this.getContext().getContextStore();
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
    console.log('this.state.addedFields', this.state.addedFields);
    const addedFields = [...this.state.addedFields, field];
    this.setState({ addedFields });
  };

  handleApplyFilters() {
    const cleanQuery = this.cleanup(this.state.query);
    if (!deepEqual(cleanQuery, this.props.query)) {
      this.props.onChange(cleanQuery);
    } else {
      this.setState({ query: cleanQuery });
    }
  }

  keywordIsActive = () => {
    const { query } = this.props;
    return query.keyword && query.keyword.trim() !== '';
  };

  filterIsAdded = field => this.state.addedFields.includes(field);

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
      'team_tasks',
    ];
    return filterFields.some(key => !!query[key]);
  };

  statusIsSelected(statusCode) {
    const array = this.state.query.verification_status;
    return array ? array.includes(statusCode) : false;
  }

  projectIsSelected(projectId) {
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

  handleKeywordConfigChange = (value) => {
    const newQuery = { ...this.state.query, ...value };
    if (Object.keys(value.keyword_fields).length === 0) {
      delete newQuery.keyword_fields;
    }
    const callback = this.state.query.keyword ? this.handleApplyFilters : null;
    this.setState({ query: newQuery }, callback);
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

  handleTagsOperator(operator) {
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
    this.props.onChange({});
  }

  render() {
    const { team, classes } = this.props;
    const { statuses } = team.verification_statuses;
    let projects = [];
    if (team.projects) {
      projects = team.projects.edges.slice().sort((a, b) =>
        a.node.title.localeCompare(b.node.title));
    }
    let users = [];
    if (team.users) {
      users = team.users.edges.slice().sort((a, b) =>
        a.node.name.localeCompare(b.node.name));
    }

    const plainTagsTexts = team.tag_texts ?
      team.tag_texts.edges.map(t => t.node.text) : [];

    const filterButtonClasses = {};
    filterButtonClasses[classes.margin] = true;
    filterButtonClasses[classes.filterActive] = this.filterIsActive();
    filterButtonClasses[classes.filterInactive] = !this.filterIsActive();

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

    return (
      <div>
        <Row flexWrap>
          { this.filterIsAdded('range') ?
            <Box maxWidth="400px" m={1}>
              <DateRangeFilter
                hide={this.hideField('date')}
                onChange={this.handleDateChange}
                value={this.state.query.range}
              />
            </Box>
            : null
          }

          { !this.hideField('tags') && plainTagsTexts.length && this.filterIsAdded('tags') ?
            <Box display="flex" alignItems="center">
              <MultiSelectFilter
                label={<FormattedMessage id="search.categoriesHeading" defaultMessage="Tags" />}
                hide={this.hideField('tags') || !plainTagsTexts.length}
                selected={plainTagsTexts.filter(t => this.tagIsSelected(t))}
                options={plainTagsTexts}
                labelProp=""
                onChange={(newValue) => {
                  this.handleTagClick(newValue);
                }}
              />
              <Button
                onClick={() => { this.handleTagsOperator('or'); }}
                style={this.tagsOperatorIs('or') ? { color: brandHighlight } : {}}
                classes={{ root: classes.noHoverButton }}
                disableRipple
              >
                <FormattedMessage
                  id="search.any"
                  defaultMessage="Any"
                />
              </Button>
              <div> | </div>
              <Button
                onClick={() => { this.handleTagsOperator('and'); }}
                style={this.tagsOperatorIs('and') ? { color: brandHighlight } : {}}
                classes={{ root: classes.noHoverButton }}
                disableRipple
              >
                <FormattedMessage
                  id="search.all"
                  defaultMessage="All"
                />
              </Button>
            </Box> : null }

          { this.filterIsAdded('show') ?
            <MultiSelectFilter
              label={<FormattedMessage id="search.show" defaultMessage="Media type" />}
              hide={this.hideField('type')}
              selected={types.filter(t => this.showIsSelected(t.value))}
              options={types}
              onChange={(newValue) => {
                this.handleShowClick(newValue.map(t => t.value));
              }}
            />
            : null
          }

          { this.filterIsAdded('verification_status') ?
            <MultiSelectFilter
              label={<FormattedMessage id="search.statusHeading" defaultMessage="Item status" />}
              hide={this.hideField('status')}
              selected={statuses.filter(s => this.statusIsSelected(s.id))}
              options={statuses}
              onChange={(newValue) => {
                this.handleStatusClick(newValue.map(s => s.id));
              }}
            />
            : null
          }

          { this.filterIsAdded('user') ?
            <MultiSelectFilter
              label={<FormattedMessage id="search.userHeading" defaultMessage="Created by" />}
              hide={this.hideField('user') || !users.length}
              selected={users.map(u => u.node).filter(u => this.userIsSelected(u.dbid))}
              options={users.map(u => u.node)}
              labelProp="name"
              onChange={(newValue) => {
                this.handleUserClick(newValue.map(u => u.dbid));
              }}
            />
            : null
          }


          {/* The only dynamic filter available right now is language */}

          { this.filterIsAdded('language') ?
            <MultiSelectFilter
              label={<FormattedMessage id="search.language" defaultMessage="Language" />}
              hide={this.hideField('dynamic') || !languages.length}
              selected={languages.filter(l => this.dynamicIsSelected('language', l.value))}
              options={languages}
              onChange={(newValue) => {
                this.handleDynamicClick('language', newValue.map(t => t.value));
              }}
            />
            : null
          }

          { this.filterIsAdded('projects') ?
            <MultiSelectFilter
              label={<FormattedMessage id="search.projectHeading" defaultMessage="List" />}
              hide={this.hideField('project') || !projects.length}
              selected={projects.map(p => p.node).filter(p => this.projectIsSelected(p.dbid))}
              options={projects.map(p => p.node)}
              labelProp="title"
              onChange={(newValue) => {
                this.handleProjectClick(newValue.map(p => p.dbid));
              }}
            />
            : null
          }

          { this.filterIsAdded('assigned_to') ?
            <MultiSelectFilter
              label={<FormattedMessage id="search.assignedTo" defaultMessage="Assigned to" />}
              hide={this.hideField('assignment') || !users.length}
              selected={users.map(u => u.node).filter(u => this.assignedUserIsSelected(u.dbid))}
              options={users.map(u => u.node)}
              labelProp="name"
              onChange={(newValue) => {
                this.handleAssignedUserClick(newValue.map(u => u.dbid));
              }}
            />
            : null
          }

          { this.hideField('read') ?
            null : (
              <FormControlLabel
                control={
                  <Switch
                    checked={this.readIsSelected(true)}
                    onChange={(e) => { this.handleReadClick(e.target.checked); }}
                  />
                }
                label={
                  <FormattedMessage id="search.readHeading" defaultMessage="Read" />
                }
              />
            )
          }
          { this.state.addedFields.length ?
            <Button
              id="search-query__submit-button"
              color="primary"
              onClick={this.handleSubmit}
            >
              <FormattedMessage id="search.applyFilters" defaultMessage="Apply filter" />
            </Button>
            : null
          }

          {(this.filterIsActive() || this.keywordIsActive()) ? (
            <Tooltip title={<FormattedMessage id="search.clear" defaultMessage="Clear filter" />}>
              <IconButton id="search-query__clear-button" onClick={this.handleClickClear}>
                <ClearIcon style={{ color: brandHighlight }} />
              </IconButton>
            </Tooltip>
          ) : null}

          <AddFilterMenu onSelect={this.handleAddField} />
        </Row>
        {/*
          <CustomFiltersManager
            onFilterChange={this.handleCustomFilterChange}
            team={team}
            query={this.state.query}
          />
        */}
      </div>
    );
  }
}

SearchQueryComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired, // onChange({ ... /* query */ }) => undefined
  team: PropTypes.shape({
    dynamic_search_fields_json_schema: PropTypes.shape({
      properties: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

SearchQueryComponent.contextTypes = {
  store: PropTypes.object,
  intl: intlShape.isRequired,
};

export default withStyles(styles)(injectIntl(SearchQueryComponent));
