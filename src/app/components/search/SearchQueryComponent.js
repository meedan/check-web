import React from 'react';
import classNames from 'classnames';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ClearIcon from '@material-ui/icons/Clear';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import CustomFiltersManager from './CustomFiltersManager';
import DateRangeFilter from './DateRangeFilter';
import MultiSelectFilter from './MultiSelectFilter';
import SearchKeywordMenu from './SearchKeywordConfig/SearchKeywordMenu';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import {
  white,
  black87,
  black16,
  black54,
  highlightOrange,
  Row,
  units,
  caption,
  borderWidthLarge,
  mediaQuery,
  inProgressYellow,
} from '../../styles/js/shared';

const StyledPopper = styled(Popper)`
  width: 80%;
  padding: 0 ${units(1)};
  z-index: 10000;

  table {
    width: 100%;
    display: block;
  }

  td {
    padding: ${units(1)};
  }

  a {
    font: ${caption};
    padding-${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${units(1)};
  }

  button {
    color: ${black54};
    float: ${props => (props.theme.dir === 'rtl' ? 'left' : 'right')};
  }
`;

const StyledSearchFiltersSection = styled.section`
  ${mediaQuery.handheld`
    padding: ${units(2)} 0;
  `}

  .search__filters-loader {
    margin: ${units(4)} 0;
    text-align: center;
  }
`;

const StyledFilterRow = styled(Row)`
  min-height: ${units(5)};
  margin-bottom: ${units(2)};
  flex-wrap: wrap;

  h4 {
    text-transform: uppercase;
    color: ${black87};
    margin: 0;
    min-width: ${units(6)};
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(2)};
    line-height: ${units(4 /* eyeballing it */)};
  }

  ${mediaQuery.tablet`
    justify-content: flex-end;
    h4 {
      margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: auto;
    }
  `};

  ${mediaQuery.handheld`
    padding: 0;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: auto;
    &::-webkit-scrollbar { // Hide scrollbar
      width: 0px;
      height: 0px;
      background: transparent;
    }

    h4 {
      padding: ${units(0.5)};
      text-align: ${props => (props.theme.dir === 'rtl' ? 'right' : 'left')};
      margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(2)};
    }
  `}
`;

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
    backgroundColor: highlightOrange,
    border: `${borderWidthLarge} solid ${highlightOrange}`,
  },
  inputInactive: {
    borderRadius: theme.spacing(0.5),
    border: `${borderWidthLarge} solid ${black16}`,
  },
  inputActive: {
    borderRadius: theme.spacing(0.5),
    border: `${borderWidthLarge} solid ${highlightOrange}`,
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
    backgroundColor: highlightOrange,
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
  claims: {
    id: 'search.showClaims',
    defaultMessage: 'Texts',
  },
  links: {
    id: 'search.showLinks',
    defaultMessage: 'Links',
  },
  images: {
    id: 'search.showImages',
    defaultMessage: 'Images',
  },
  videos: {
    id: 'search.showVideos',
    defaultMessage: 'Videos',
  },
  audios: {
    id: 'search.showAudios',
    defaultMessage: 'Audios',
  },
  blank: {
    id: 'search.showBlank',
    defaultMessage: 'Report',
  },
});

class SearchQueryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.searchInput = React.createRef();

    this.state = {
      query: props.query, // CODE SMELL! Caller must use `key=` to reset state on prop change
      isPopperClosed: false, // user sets this once per page load
      dialogOpen: false, // true when user opens the "Filter" dialog
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
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

  handleApplyFilters() {
    const cleanQuery = this.cleanup(this.state.query);
    if (!deepEqual(cleanQuery, this.props.query)) {
      this.props.onChange(cleanQuery);
    } else {
      this.setState({ dialogOpen: false, query: cleanQuery });
    }
  }

  keywordIsActive = () => {
    const { query } = this.props;
    return query.keyword && query.keyword.trim() !== '';
  };

  keywordConfigIsActive = () => {
    const { query } = this.state;
    return query.keyword_fields;
  }

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
  }

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

  handleDialogOpen = () => {
    this.setState({ dialogOpen: true });
  }

  handleDialogClose = () => {
    this.setState({
      dialogOpen: false,
      query: this.props.query, // undo changes
    });
  }

  // Create title out of query parameters
  //
  // Returns either a String or a <FormattedMessage> component.
  title(statuses, projects) {
    const { query } = this.props;
    return (
      // Merge/flatten the array constructed below
      // http://stackoverflow.com/a/10865042/209184
      [].concat // eslint-disable-line prefer-spread
        .apply(
          [],
          [
            query.projects
              ? query.projects.map((p) => {
                const project = projects.find(pr => pr.node.dbid === p);
                return project ? project.node.title : '';
              })
              : [],
            query.verification_status
              ? query.verification_status.map((s) => {
                const status = statuses.find(so => so.id === s);
                return status ? status.label : '';
              })
              : [],
            query.keyword,
            query.tags,
          // Remove empty entries
          // http://stackoverflow.com/a/19888749/209184
          ].filter(Boolean),
        )
        .join(' ')
        .trim()
    ) || (
      <FormattedMessage id="search.title" defaultMessage="All items" />
    );
  }

  hideField(field) {
    return this.props.hideFields ? this.props.hideFields.indexOf(field) > -1 : false;
  }

  handleInputChange = (ev) => {
    const { keyword, ...newQuery } = this.state.query;
    const newKeyword = ev.target.value;
    if (newKeyword) { // empty string => remove property from query
      newQuery.keyword = newKeyword;
    }
    this.setState({ query: newQuery });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    this.handleApplyFilters();
  }

  handleBlur = () => {
    this.handleApplyFilters();
  }

  handlePopperClick = (ev) => {
    ev.preventDefault();
    this.setState({ isPopperClosed: true });
  }

  handleClickCancel = () => {
    const { query } = this.props;
    this.setState({ dialogOpen: false, query });
  }

  handleClickClear = () => {
    this.props.onChange({});
  }

  handleClickReset = () => {
    this.setState({ query: {} });
  }

  subscribe() {
    const { pusher, clientSessionId, team } = this.props;
    pusher.subscribe(team.pusher_channel).bind('tagtext_updated', 'SearchQueryComponent', (data, run) => {
      if (clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `team-${team.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });

    pusher.subscribe(team.pusher_channel).bind('project_updated', 'SearchQueryComponent', (data, run) => {
      if (clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `team-${team.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, team } = this.props;
    pusher.unsubscribe(team.pusher_channel, 'tagtext_updated', 'SearchQueryComponent');
    pusher.unsubscribe(team.pusher_channel, 'project_updated', 'SearchQueryComponent');
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

    const title = (this.filterIsActive() || this.keywordIsActive())
      ? this.title(statuses, projects)
      : (this.props.title || (this.props.project ? this.props.project.title : null));

    const filterButtonClasses = {};
    filterButtonClasses[classes.margin] = true;
    filterButtonClasses[classes.filterActive] = this.filterIsActive();
    filterButtonClasses[classes.filterInactive] = !this.filterIsActive();

    const types = [
      { value: 'claims', label: this.props.intl.formatMessage(typeLabels.claims) },
      { value: 'links', label: this.props.intl.formatMessage(typeLabels.links) },
      { value: 'images', label: this.props.intl.formatMessage(typeLabels.images) },
      { value: 'videos', label: this.props.intl.formatMessage(typeLabels.videos) },
      { value: 'audios', label: this.props.intl.formatMessage(typeLabels.audios) },
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
      <div style={{ minWidth: 350 }}>
        <Row>
          <form
            id="search-form"
            className="search__form"
            onSubmit={this.handleSubmit}
            autoComplete="off"
          >
            <FormattedMessage id="search.inputHint" defaultMessage="Search">
              { placeholder => (
                <InputBase
                  classes={{
                    root: (
                      this.keywordIsActive() || this.keywordConfigIsActive() ?
                        classes.inputActive :
                        classes.inputInactive
                    ),
                  }}
                  placeholder={placeholder}
                  name="search-input"
                  id="search-input"
                  defaultValue={this.state.query.keyword || ''}
                  onBlur={this.handleBlur}
                  onChange={this.handleInputChange}
                  ref={this.searchInput}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment
                        classes={{
                          root: classes.startAdornmentRoot,
                        }}
                      >
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        classes={{
                          root: classes.endAdornmentRoot,
                          filled: (
                            this.keywordConfigIsActive() ?
                              classes.endAdornmentActive :
                              classes.endAdornmentInactive
                          ),
                        }}
                        variant="filled"
                      >
                        <SearchKeywordMenu
                          teamSlug={this.props.team.slug}
                          onChange={this.handleKeywordConfigChange}
                          query={this.state.query}
                        />
                      </InputAdornment>
                    ),
                  }}
                  autoFocus
                />
              )}
            </FormattedMessage>
            <StyledPopper
              id="search-help"
              open={
                // Open the search help when
                // - user has typed something
                // - user has not explicitly closed the help
                this.state.query.keyword !== this.props.query.keyword &&
                !this.state.isPopperClosed
              }
              anchorEl={() => this.searchInput.current}
            >
              <Paper>
                <IconButton onClick={this.handlePopperClick}>
                  <ClearIcon />
                </IconButton>
                <FormattedHTMLMessage
                  id="search.help"
                  defaultMessage='
                    <table>
                      <tbody>
                        <tr><td>+</td><td>Tree + Leaf</td><td>Items with both Tree AND Leaf</td></tr>
                        <tr><td>|</td><td>Tree | Leaf</td><td>Items with either Tree OR Leaf</td></tr>
                        <tr><td>()</td><td>Tree + (Leaf | Branch)</td><td>Items with Tree AND Leaf OR items with Tree AND Branch</td></tr>
                      </tbody>
                    </table>
                    <div>
                      <a href="https://medium.com/meedan-user-guides/search-on-check-25c752bd8cc1" target="_blank" >
                        Learn more about search techniques
                      </a>
                    </div>'
                />
              </Paper>
            </StyledPopper>
          </form>
          <Button
            className={classNames(filterButtonClasses)}
            variant="outlined"
            id="search__open-dialog-button"
            onClick={this.handleDialogOpen}
          >
            <FilterListIcon />
            <FormattedMessage id="search.Filter" defaultMessage="Filter" />
          </Button>
          {(this.filterIsActive() || this.keywordIsActive()) ? (
            <Tooltip title={<FormattedMessage id="search.clear" defaultMessage="Clear filter" />}>
              <IconButton id="search-query__clear-button" onClick={this.handleClickClear}>
                <ClearIcon style={{ color: highlightOrange }} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Row>
        <PageTitle prefix={title} team={this.props.team}>
          <Dialog
            className="search__query-dialog"
            scroll="paper"
            open={this.state.dialogOpen}
            onClose={this.handleDialogClose}
          >
            <DialogContent id="search__query-dialog-content">
              <StyledSearchFiltersSection>
                <DateRangeFilter
                  hide={this.hideField('date')}
                  onChange={this.handleDateChange}
                  value={this.state.query.range}
                />

                { !this.hideField('tags') && plainTagsTexts.length ?
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
                      style={this.tagsOperatorIs('or') ? { color: inProgressYellow } : {}}
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
                      style={this.tagsOperatorIs('and') ? { color: inProgressYellow } : {}}
                      classes={{ root: classes.noHoverButton }}
                      disableRipple
                    >
                      <FormattedMessage
                        id="search.all"
                        defaultMessage="All"
                      />
                    </Button>
                  </Box> : null }

                <Box display="flex" style={{ gap: units(3) }}>
                  <MultiSelectFilter
                    label={<FormattedMessage id="search.show" defaultMessage="Media type" />}
                    hide={this.hideField('type')}
                    selected={types.filter(t => this.showIsSelected(t.value))}
                    options={types}
                    onChange={(newValue) => {
                      this.handleShowClick(newValue.map(t => t.value));
                    }}
                  />

                  <MultiSelectFilter
                    label={<FormattedMessage id="search.statusHeading" defaultMessage="Item status" />}
                    hide={this.hideField('status')}
                    selected={statuses.filter(s => this.statusIsSelected(s.id))}
                    options={statuses}
                    onChange={(newValue) => {
                      this.handleStatusClick(newValue.map(s => s.id));
                    }}
                  />
                </Box>

                <Box display="flex" style={{ gap: units(3) }}>
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

                  {/* The only dynamic filter available right now is language */}

                  <MultiSelectFilter
                    label={<FormattedMessage id="search.language" defaultMessage="Language" />}
                    hide={this.hideField('dynamic') || !languages.length}
                    selected={languages.filter(l => this.dynamicIsSelected('language', l.value))}
                    options={languages}
                    onChange={(newValue) => {
                      this.handleDynamicClick('language', newValue.map(t => t.value));
                    }}
                  />
                </Box>

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

                { this.hideField('read') ?
                  null : (
                    <StyledFilterRow>
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
                    </StyledFilterRow>
                  )
                }

                <CustomFiltersManager
                  onFilterChange={this.handleCustomFilterChange}
                  team={team}
                  query={this.state.query}
                />
              </StyledSearchFiltersSection>
            </DialogContent>
            <DialogActions>
              <Button id="search-query__cancel-button" onClick={this.handleClickCancel}>
                <FormattedMessage id="search.cancel" defaultMessage="Cancel" />
              </Button>

              <Button id="search-query__reset-button" onClick={this.handleClickReset}>
                <FormattedMessage id="search.reset" defaultMessage="Reset" />
              </Button>

              <Button
                id="search-query__submit-button"
                type="submit"
                form="search-form"
                color="primary"
              >
                <FormattedMessage id="search.applyFilters" defaultMessage="Filter" />
              </Button>
            </DialogActions>
          </Dialog>
        </PageTitle>
      </div>
    );
  }
}

SearchQueryComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
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

export default withStyles(styles)(withPusher(injectIntl(SearchQueryComponent)));
export { StyledFilterRow };
