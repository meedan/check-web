import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FilterListIcon from '@material-ui/icons/FilterList';
import ClearIcon from '@material-ui/icons/Clear';
import FlatButton from 'material-ui/FlatButton';
import deepEqual from 'deep-equal';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { searchPrefixFromUrl, searchQueryFromUrl, urlFromSearchQuery } from './Search';
import DateRangeFilter from './DateRangeFilter';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import { bemClass } from '../../helpers';
import { teamStatuses } from '../../customHelpers';
import {
  white,
  black87,
  black38,
  black16,
  black05,
  black54,
  Row,
  ContentColumn,
  units,
  caption,
  borderWidthSmall,
  transitionSpeedDefault,
  mediaQuery,
  ellipsisStyles,
} from '../../styles/js/shared';

const statusKey = config.appName === 'bridge' ? 'translation_status' : 'verification_status';

// https://github.com/styled-components/styled-components/issues/305#issuecomment-298680960
const swallowingStyled = (WrappedComponent, { swallowProps = [] } = {}) => {
  const Wrapper = ({ children, ...props }) => {
    const remainingProps = props;
    swallowProps.forEach((propName) => {
      delete remainingProps[propName];
    });
    return <WrappedComponent {...remainingProps}>{children}</WrappedComponent>;
  };
  return styled(Wrapper);
};

export const StyledSearchInput = styled.input`
  background-repeat: no-repeat;
  background-color: ${white};
  background-image: url('/images/search.svg');
  background-position: ${props => (props.isRtl ? `calc(100% - ${units(2)})` : units(2))} center;
  border: ${borderWidthSmall} solid ${black16};
  border-radius: ${units(0.5)};
  height: ${units(5)};
  outline: none;
  width: 100%;
  font-size: 16px;
  padding-${props => (props.isRtl ? 'right' : 'left')}: ${units(6)};
`;

const StyledPopper = swallowingStyled(Popper, { swallowProps: ['isRtl'] })`
  width: 100%;
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
    padding-${props => (props.isRtl ? 'right' : 'left')}: ${units(1)};
  }

  button {
    color: ${black54};
    float: ${props => (props.isRtl ? 'left' : 'right')};
  }
`;

const StyledSearchFiltersSection = styled.section`
  padding: ${units(1)};
  margin-top: ${units(1)};

  ${mediaQuery.handheld`
    padding: ${units(2)} 0;
  `}

  .search__filters-loader {
    margin: ${units(4)} 0;
    text-align: center;
  }
`;

const StyledFilterRow = swallowingStyled(Row, { swallowProps: ['isRtl'] })`
  height: ${props => (props.height ? props.height : units(5))};

  overflow-y: ${props => (props.overflowY ? props.overflowY : 'auto')};

  flex-wrap: wrap;

  h4 {
    color: ${black87};
    margin: 0;
    min-width: ${units(6)};
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  }

  ${mediaQuery.tablet`
    justify-content: flex-end;
    h4 {
      margin-${props => (props.isRtl ? 'left' : 'right')}: auto;
    }
  `};

  ${mediaQuery.handheld`
    // Make them a single row that scrolls horizontally.
    // DEPRECATED: upgrade this component to use dropdowns per spec.
    // CGB 2017-10-10
    padding: 0;
    flex-wrap: nowrap;
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
      text-align: ${props => (props.isRtl ? 'right' : 'left')};
      margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
    }
  `}
`;

const StyledFilterButton = styled.div`
  margin: 0 ${units(0.5)} ${units(0.5)}};
  background-color: ${black05};
  border-radius: ${units(3)};
  padding: 0 ${units(1.5)};
  font: ${caption};
  line-height: ${units(3.5)};
  transition: all ${transitionSpeedDefault};
  white-space: nowrap;
  max-width: ${units(20)};
  ${ellipsisStyles}
  &:hover {
    cursor: pointer;
    background-color: ${black16};
  }
  ${props =>
    props.active
      ? `color: ${black87}!important; font-weight: 700;`
      : `color: ${black38};
  `}
`;

const messages = defineMessages({
  title: {
    id: 'search.title',
    defaultMessage: 'Search',
  },
  searchInputHint: {
    id: 'search.inputHint',
    defaultMessage: 'Search',
  },
  applyFilters: {
    id: 'search.applyFilters',
    defaultMessage: 'Done',
  },
  cancel: {
    id: 'search.cancel',
    defaultMessage: 'Cancel',
  },
  reset: {
    id: 'search.reset',
    defaultMessage: 'Reset',
  },
  filterItems: {
    id: 'search.filterItems',
    defaultMessage: 'Filter items',
  },
});

const mediaTypes = ['claims', 'links', 'images', 'videos'];

class SearchQueryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: {},
      popper: {
        open: false,
        allowed: true,
        anchorEl: null,
      },
      dialogOpen: false,
    };
  }

  componentWillMount() {
    const context = this.getContext();
    if (context.getContextStore().project && /\/search/.test(window.location.pathname)) {
      context.setContextStore({ project: null });
    }

    const query = searchQueryFromUrl();
    this.setState({ query });
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillReceiveProps() {
    const query = searchQueryFromUrl();
    if (!deepEqual(this.state.query, query)) {
      this.setState({ query });
    }
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

  handleApplyFilters() {
    const { query } = this.state;
    query.esoffset = 0;

    const prefix = searchPrefixFromUrl();
    const url = urlFromSearchQuery(query, prefix);

    this.getContext().getContextStore().history.push(url);
  }

  statusIsSelected(statusCode, state = this.state) {
    const selectedStatuses = state.query[statusKey] || [];
    return selectedStatuses.length && selectedStatuses.includes(statusCode);
  }

  projectIsSelected(projectId, state = this.state) {
    const selectedProjects = state.query.projects || [];
    return selectedProjects.length && selectedProjects.includes(projectId);
  }

  tagIsSelected(tag, state = this.state) {
    const selectedTags = state.query.tags || [];
    return selectedTags.length && selectedTags.includes(tag);
  }

  sortIsSelected(sortParam, state = this.state) {
    if (['ASC', 'DESC'].includes(sortParam)) {
      return (
        state.query.sort_type === sortParam || (!state.query.sort_type && sortParam === 'DESC')
      );
    }
    return state.query.sort === sortParam || (!state.query.sort && sortParam === 'recent_added');
  }

  sortLabel(sortParam, state = this.state) {
    const { sort } = state.query || {};
    if (!sort || sort === 'recent_added' || sort === 'recent_activity') {
      return sortParam === 'ASC' ?
        (<FormattedMessage id="search.sortByOldest" defaultMessage="Oldest first" />) :
        (<FormattedMessage id="search.sortByNewest" defaultMessage="Newest first" />);
    }
    const schema = this.props.team.dynamic_search_fields_json_schema;
    const labels = schema.properties.sort.properties[sort].items.enum;
    return sortParam === 'ASC' ? labels[0] : labels[1];
  }

  showIsSelected(show, state = this.state) {
    const selected = state.query.show || [...mediaTypes];
    return selected.includes(show);
  }

  ruleIsSelected(rule, state = this.state) {
    const selected = state.query.rules || [];
    return selected.includes(rule);
  }

  dynamicIsSelected(field, value, state = this.state) {
    const dynamic = state.query.dynamic || {};
    const selected = dynamic[field] || [];
    return selected.includes(value);
  }

  handleDateChange = (value) => {
    const query = Object.assign({}, this.state.query);
    query.range = value;
    this.setState({ query });
  };

  handleStatusClick(statusCode) {
    const query = Object.assign({}, this.state.query);
    const statusIsSelected = this.statusIsSelected(statusCode, this.state);
    const selectedStatuses = query[statusKey] || []; // TODO Avoid ambiguous reference

    if (statusIsSelected) {
      selectedStatuses.splice(selectedStatuses.indexOf(statusCode), 1); // remove from array
      if (!selectedStatuses.length) {
        delete query[statusKey];
      }
    } else {
      query[statusKey] = selectedStatuses.concat(statusCode);
    }
    this.setState({ query });
  }

  handleProjectClick(projectId) {
    const query = Object.assign({}, this.state.query);
    const projectIsSelected = this.projectIsSelected(projectId, this.state);
    const selectedProjects = query.projects || [];

    if (projectIsSelected) {
      selectedProjects.splice(selectedProjects.indexOf(projectId), 1);
      if (!selectedProjects.length) {
        delete query.projects;
      }
    } else {
      query.projects = selectedProjects.concat(projectId);
    }
    this.setState({ query });
  }

  handleTagClick(tag) {
    const query = Object.assign({}, this.state.query);
    const tagIsSelected = this.tagIsSelected(tag, this.state);
    const selectedTags = query.tags || [];

    if (tagIsSelected) {
      selectedTags.splice(selectedTags.indexOf(tag), 1); // remove from array
      if (!selectedTags.length) {
        delete query.tags;
      }
    } else {
      query.tags = selectedTags.concat(tag);
    }
    this.setState({ query });
  }

  handleSortClick(sortParam) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      if (['ASC', 'DESC'].includes(sortParam)) {
        state.query.sort_type = sortParam;
        return { query: state.query };
      }
      state.query.sort = sortParam;
      return { query: state.query };
    });
  }

  handleRuleClick(rule) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      if (!state.query.rules) {
        state.query.rules = [];
      }
      const i = state.query.rules.indexOf(rule);
      if (i === -1) {
        state.query.rules.push(rule);
      } else {
        state.query.rules.splice(i, 1);
      }
      return { query: state.query };
    });
  }

  handleShowClick(show) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      if (!state.query.show) {
        state.query.show = [...mediaTypes];
      }

      const toggleMedia = (t) => {
        const i = state.query.show.indexOf(t);
        if (i === -1) {
          state.query.show.push(t);
        } else {
          state.query.show.splice(i, 1);
        }
      };

      toggleMedia(show);

      return { query: state.query };
    });
  }

  handleDynamicClick(field, value) {
    const query = Object.assign({}, this.state.query);
    if (!query.dynamic) {
      query.dynamic = {};
    }
    if (!query.dynamic[field]) {
      query.dynamic[field] = [];
    }
    const i = query.dynamic[field].indexOf(value);
    if (i === -1) {
      query.dynamic[field].push(value);
    } else {
      query.dynamic[field].splice(i, 1);
    }
    if (!query.dynamic[field].length) {
      delete query.dynamic[field];
    }
    if (!Object.keys(query.dynamic).length) {
      delete query.dynamic;
    }
    this.setState({ query });
  }

  handleDialogOpen = () => {
    this.setState({
      dialogOpen: true,
      popper: {
        open: false,
        allowed: this.state.popper.allowed,
        anchorEl: null,
      },
    });
  };

  handleDialogClose = () => {
    const query = searchQueryFromUrl();
    this.setState({
      query,
      dialogOpen: false,
      popper: {
        open: false,
        allowed: this.state.popper.allowed,
        anchorEl: null,
      },
    });
  };

  // Create title out of query parameters
  title(statuses, projects) {
    const { query } = this.state;
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
            query[statusKey]
              ? query[statusKey].map((s) => {
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
        .trim() || this.props.intl.formatMessage(messages.title)
    );
  }

  showField(field) {
    return this.props.fields ? this.props.fields.indexOf(field) > -1 : true;
  }

  handleInputChange = () => {
    // Open the search help when
    // - user has typed something
    // - user has not explicitly closed the help
    // - user has reset the keywords
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      state.query.keyword = this.searchInput.value;
      return {
        query: state.query,
        popper: {
          open: this.searchInput.value.length > 0 && this.state.popper.allowed,
          anchorEl: this.searchInput,
          allowed: this.state.popper.allowed || !this.searchInput.value.length,
        },
      };
    });
  };

  handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleApplyFilters();
    }
  };

  handleBlur = () => {
    const query = searchQueryFromUrl();
    const value = this.searchInput.value.trim();
    if (value || query.keyword) {
      if (value !== query.keyword) {
        this.handleApplyFilters();
      }
    }
  };

  handlePopperClick() {
    this.setState({ popper: { open: false, allowed: false } });
  }

  cancelFilters() {
    const query = searchQueryFromUrl();
    this.setState({ dialogOpen: false, query });
  }

  resetFilters() {
    this.searchInput.value = '';
    this.setState({ query: { esoffset: 0 } });
  }

  doneButtonDisabled() {
    const query = searchQueryFromUrl();
    return deepEqual(this.state.query, query);
  }

  subscribe() {
    const { pusher } = this.currentContext();
    if (pusher) {
      pusher.subscribe(this.props.team.pusher_channel).bind('tagtext_updated', 'SearchQueryComponent', (data, run) => {
        if (this.currentContext().clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `team-${this.props.team.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });

      pusher.subscribe(this.props.team.pusher_channel).bind('project_updated', 'SearchQueryComponent', (data, run) => {
        if (this.currentContext().clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `team-${this.props.team.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.currentContext();
    if (pusher) {
      pusher.unsubscribe(this.props.team.pusher_channel, 'tagtext_updated', 'SearchQueryComponent');
      pusher.unsubscribe(this.props.team.pusher_channel, 'project_updated', 'SearchQueryComponent');
    }
  }

  render() {
    const { team } = this.props;
    const { statuses } = teamStatuses(team);
    let projects = [];
    if (team.projects) {
      projects = team.projects.edges.sortp((a, b) =>
        a.node.title.localeCompare(b.node.title));
    }

    const suggestedTags = team.teamwide_tags.edges.map(t => t.node.text);

    const title =
      this.props.title ||
      (this.props.project ? this.props.project.title : this.title(statuses, projects));

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const hasRules = team.rules_search_fields_json_schema &&
      Object.keys(team.rules_search_fields_json_schema.properties.rules.properties).length > 0;

    return (
      <div>
        <Row>
          <form
            id="search-form"
            className="search__form"
            autoComplete="off"
          >
            <StyledSearchInput
              placeholder={this.props.intl.formatMessage(messages.searchInputHint)}
              name="search-input"
              id="search-input"
              defaultValue={this.state.query.keyword || ''}
              isRtl={isRtl}
              onKeyPress={this.handleKeyPress}
              onBlur={this.handleBlur}
              onChange={this.handleInputChange}
              innerRef={(i) => { this.searchInput = i; }}
              autofocus
            />
            <StyledPopper
              id="search-help"
              isRtl={isRtl}
              open={this.state.popper.open}
              anchorEl={this.state.popper.anchorEl}
            >
              <Paper>
                <IconButton style={{ fontSize: '20px' }} onClick={this.handlePopperClick.bind(this)}>
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
          <Tooltip title={this.props.intl.formatMessage(messages.filterItems)}>
            <Button
              style={{ margin: `0 ${units(2)}` }}
              variant="contained"
              id="search__open-dialog-button"
              onClick={this.handleDialogOpen}
            >
              <FilterListIcon />
              <FormattedMessage id="search.Filter" defaultMessage="Filter" />
            </Button>
          </Tooltip>
        </Row>
        <PageTitle prefix={title} skipTeam={false} team={this.props.team}>
          <Dialog
            className="search__query-dialog"
            maxWidth="md"
            fullWidth
            open={this.state.dialogOpen}
            onClose={this.handleDialogClose}
          >
            <DialogContent>
              <ContentColumn>
                <StyledSearchFiltersSection>
                  <DateRangeFilter
                    hidden={!this.showField('date')}
                    onChange={this.handleDateChange}
                    value={this.state.query.range}
                  />
                  {this.showField('status') ?
                    <StyledFilterRow isRtl={isRtl}>
                      <h4><FormattedMessage id="search.statusHeading" defaultMessage="Status" /></h4>
                      {statuses.map(status => (
                        <StyledFilterButton
                          active={this.statusIsSelected(status.id)}
                          key={status.id}
                          title={status.description}
                          onClick={this.handleStatusClick.bind(this, status.id)}
                          className={bemClass(
                            'search-query__filter-button',
                            this.statusIsSelected(status.id),
                            '--selected',
                          )}
                        >
                          {status.label}
                        </StyledFilterButton>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('project') ?
                    <StyledFilterRow>
                      <h4>
                        <FormattedMessage id="search.projectHeading" defaultMessage="List" />
                      </h4>
                      {projects.map(project => (
                        <StyledFilterButton
                          active={this.projectIsSelected(project.node.dbid)}
                          key={project.node.dbid}
                          onClick={this.handleProjectClick.bind(this, project.node.dbid)}
                          className={bemClass(
                            'search-filter__project-chip',
                            this.projectIsSelected(project.node.dbid),
                            '--selected',
                          )}
                        >
                          {project.node.title}
                        </StyledFilterButton>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('tags') && suggestedTags.length ?
                    <StyledFilterRow>
                      <h4>
                        <FormattedMessage id="status.categoriesHeading" defaultMessage="Default Tags" />
                      </h4>
                      {suggestedTags.map(tag => (
                        <StyledFilterButton
                          active={this.tagIsSelected(tag)}
                          key={tag}
                          title={null}
                          onClick={this.handleTagClick.bind(this, tag)}
                          className={bemClass(
                            'search-query__filter-button',
                            this.tagIsSelected(tag),
                            '--selected',
                          )}
                        >
                          {tag}
                        </StyledFilterButton>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('sort') ?
                    <StyledFilterRow className="search-query__sort-actions">
                      <h4><FormattedMessage id="search.sort" defaultMessage="Sort" /></h4>

                      <StyledFilterButton
                        active={this.sortIsSelected('recent_added')}
                        onClick={this.handleSortClick.bind(this, 'recent_added')}
                        className={['search-query__recent-added-button', bemClass(
                          'search-query__filter-button',
                          this.sortIsSelected('recent_added'),
                          '--selected',
                        )].join(' ')}
                      >
                        <FormattedMessage id="search.sortByCreated" defaultMessage="Created" />
                      </StyledFilterButton>
                      <StyledFilterButton
                        active={this.sortIsSelected('recent_activity')}
                        onClick={this.handleSortClick.bind(this, 'recent_activity')}
                        className={['search-query__recent-activity-button', bemClass(
                          'search-query__filter-button',
                          this.sortIsSelected('recent_activity'),
                          '--selected',
                        )].join(' ')}
                      >
                        <FormattedMessage
                          id="search.sortByRecentActivity"
                          defaultMessage="Recent activity"
                        />
                      </StyledFilterButton>

                      {Object
                        .keys(team.dynamic_search_fields_json_schema.properties.sort.properties)
                        .map((id) => {
                          const { sort } = team.dynamic_search_fields_json_schema.properties;
                          const label = sort.properties[id].title;
                          return (
                            <StyledFilterButton
                              key={`dynamic-sort-${id}`}
                              active={this.sortIsSelected(id)}
                              onClick={this.handleSortClick.bind(this, id)}
                              className={bemClass(
                                'search-query__filter-button',
                                this.sortIsSelected(id),
                                '--selected',
                              )}
                            >
                              <span>{label}</span>
                            </StyledFilterButton>
                          );
                        })
                      }

                      <StyledFilterButton
                        style={isRtl ? { marginRight: units(3) } : { marginLeft: units(3) }}
                        active={this.sortIsSelected('DESC')}
                        onClick={this.handleSortClick.bind(this, 'DESC')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.sortIsSelected('DESC'),
                          '--selected',
                        )}
                      >
                        {this.sortLabel('DESC')}
                      </StyledFilterButton>
                      <StyledFilterButton
                        active={this.sortIsSelected('ASC')}
                        onClick={this.handleSortClick.bind(this, 'ASC')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.sortIsSelected('ASC'),
                          '--selected',
                        )}
                      >
                        {this.sortLabel('ASC')}
                      </StyledFilterButton>
                    </StyledFilterRow>
                    : null}

                  {this.showField('show') ?
                    <StyledFilterRow className="search-query__sort-actions">
                      <h4><FormattedMessage id="search.show" defaultMessage="Type" /></h4>
                      <StyledFilterButton
                        active={this.showIsSelected('claims')}
                        onClick={this.handleShowClick.bind(this, 'claims')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.showIsSelected('claims'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showClaims" defaultMessage="Texts" />
                      </StyledFilterButton>
                      <StyledFilterButton
                        active={this.showIsSelected('links')}
                        onClick={this.handleShowClick.bind(this, 'links')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.showIsSelected('links'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showLinks" defaultMessage="Links" />
                      </StyledFilterButton>
                      <StyledFilterButton
                        active={this.showIsSelected('images')}
                        onClick={this.handleShowClick.bind(this, 'images')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.showIsSelected('images'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showImages" defaultMessage="Images" />
                      </StyledFilterButton>
                      <StyledFilterButton
                        active={this.showIsSelected('videos')}
                        onClick={this.handleShowClick.bind(this, 'videos')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.showIsSelected('videos'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showVideos" defaultMessage="Videos" />
                      </StyledFilterButton>
                    </StyledFilterRow>
                    : null}

                  {this.showField('dynamic') ?
                    (Object.keys(team.dynamic_search_fields_json_schema.properties).map((key) => {
                      if (key === 'sort') {
                        return null;
                      }

                      const annotationType = team.dynamic_search_fields_json_schema.properties[key];

                      const fields = [];

                      if (annotationType.type === 'array') {
                        annotationType.items.enum.forEach((value, i) => {
                          const label = annotationType.items.enumNames[i];
                          const option = (
                            <StyledFilterButton
                              key={`dynamic-field-${key}-option-${value}`}
                              active={this.dynamicIsSelected(key, value)}
                              onClick={this.handleDynamicClick.bind(this, key, value)}
                              className={bemClass(
                                'search-query__filter-button',
                                this.dynamicIsSelected(key, value),
                                '--selected',
                              )}
                            >
                              <span>{label}</span>
                            </StyledFilterButton>
                          );
                          fields.push(option);
                        });
                      }

                      return (
                        <StyledFilterRow key={`dynamic-field-${key}`} className="search-query__dynamic">
                          <h4>{annotationType.title}</h4>
                          {fields}
                        </StyledFilterRow>
                      );
                    }))
                    : null}

                  {hasRules && this.showField('rules') ?
                    <StyledFilterRow className="search-query__sort-actions">
                      <h4><FormattedMessage id="search.rules" defaultMessage="Rules" /></h4>
                      {Object
                        .keys(team.rules_search_fields_json_schema.properties.rules.properties)
                        .map((id) => {
                          const label = team.rules_search_fields_json_schema.properties
                            .rules.properties[id].title;
                          return (
                            <StyledFilterButton
                              key={id}
                              active={this.ruleIsSelected(id)}
                              onClick={this.handleRuleClick.bind(this, id)}
                              className={bemClass(
                                'search-query__filter-button',
                                this.ruleIsSelected(id),
                                '--selected',
                              )}
                            >
                              {label}
                            </StyledFilterButton>
                          );
                        })
                      }
                    </StyledFilterRow> : null}

                  <p style={{ textAlign: 'right' }}>
                    <FlatButton
                      id="search-query__cancel-button"
                      label={this.props.intl.formatMessage(messages.cancel)}
                      onClick={this.cancelFilters.bind(this)}
                    />

                    <FlatButton
                      id="search-query__reset-button"
                      label={this.props.intl.formatMessage(messages.reset)}
                      onClick={this.resetFilters.bind(this)}
                    />

                    <FlatButton
                      id="search-query__submit-button"
                      label={this.props.intl.formatMessage(messages.applyFilters)}
                      onClick={this.handleApplyFilters.bind(this)}
                      disabled={this.doneButtonDisabled()}
                      primary
                    />
                  </p>
                </StyledSearchFiltersSection>

                {this.props.addons}
              </ContentColumn>
            </DialogContent>
          </Dialog>
        </PageTitle>
      </div>
    );
  }
}

SearchQueryComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

SearchQueryComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(SearchQueryComponent);
export { StyledFilterRow };
