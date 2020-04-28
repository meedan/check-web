import React from 'react';
import classNames from 'classnames';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FilterListIcon from '@material-ui/icons/FilterList';
import ClearIcon from '@material-ui/icons/Clear';
import deepEqual from 'deep-equal';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import { withPusher, pusherShape } from '../../pusher';
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
  checkBlue,
  highlightOrange,
  Row,
  ContentColumn,
  units,
  caption,
  borderWidthLarge,
  transitionSpeedDefault,
  mediaQuery,
  ellipsisStyles,
} from '../../styles/js/shared';

const statusKey = 'verification_status';

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
  border: ${borderWidthLarge} solid ${props => (props.active ? highlightOrange : black16)};
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
  ${mediaQuery.handheld`
    padding: ${units(2)} 0;
  `}

  .search__filters-loader {
    margin: ${units(4)} 0;
    text-align: center;
  }
`;

const StyledFilterRow = swallowingStyled(Row, { swallowProps: ['isRtl'] })`
  min-height: ${units(5)};
  margin-bottom: ${units(2)};
  flex-wrap: wrap;

  h4 {
    text-transform: uppercase;
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

const StyledFilterChip = styled.div`
  margin: ${units(0.5)};
  background-color: ${black05};
  border-radius: ${units(3)};
  padding: 0 ${units(1.5)};
  font: ${caption};
  line-height: ${units(3.5)};
  transition: all ${transitionSpeedDefault};
  white-space: nowrap;
  min-width: ${units(5)};
  max-width: ${units(20)};
  ${ellipsisStyles}
  ${props =>
    props.active
      ? `color: ${white}; font-weight: 700;`
      : `color: ${black38};
  `}
  ${props =>
    props.active
      ? `background-color: ${checkBlue};`
      : `background-color: ${black05};
  `}
  &:hover {
    color: ${black87};
    cursor: pointer;
    background-color: ${black16};
  }
`;

const styles = theme => ({
  margin: {
    margin: theme.spacing.unit,
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
});

const messages = defineMessages({
  title: {
    id: 'search.title',
    defaultMessage: 'All items',
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
  clear: {
    id: 'search.clear',
    defaultMessage: 'Clear filter',
  },
});

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
    if (context.getContextStore().project && /\/all-items/.test(window.location.pathname)) {
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

    const prefix = searchPrefixFromUrl();
    const url = urlFromSearchQuery(query, prefix);

    browserHistory.push(url);
  }

  keywordIsActive = () => {
    const query = searchQueryFromUrl();
    return query.keyword && query.keyword.trim() !== '';
  };

  filterIsActive = () => {
    const query = searchQueryFromUrl();
    const filterFields = ['range', 'verification_status', 'projects', 'tags', 'show'];
    let active = false;
    filterFields.forEach((field) => {
      if (Object.keys(query).includes(field)) {
        active = true;
      }
    });
    return active;
  };

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

  showIsSelected(show, state = this.state) {
    const selected = state.query.show;
    return Array.isArray(selected) ? selected.includes(show) : false;
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
        state.query.show = [];
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

      if (state.query.show.length === 0) {
        delete state.query.show;
      }

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

  resetFilters = (apply) => {
    this.searchInput.value = '';
    this.setState({ query: {} }, () => {
      if (apply) {
        this.handleApplyFilters();
      }
    });
  };

  doneButtonDisabled() {
    const query = searchQueryFromUrl();
    return deepEqual(this.state.query, query);
  }

  subscribe() {
    const { pusher, team } = this.props;
    pusher.subscribe(team.pusher_channel).bind('tagtext_updated', 'SearchQueryComponent', (data, run) => {
      if (this.currentContext().clientSessionId !== data.actor_session_id) {
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
      if (this.currentContext().clientSessionId !== data.actor_session_id) {
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
    const { statuses } = teamStatuses(team);
    let projects = [];
    if (team.projects) {
      projects = team.projects.edges.sortp((a, b) =>
        a.node.title.localeCompare(b.node.title));
    }

    const { currentUser } = this.currentContext();
    const suggestedTags = team.teamwide_tags.edges.map(t => t.node.text);

    const title = (this.filterIsActive() || this.keywordIsActive())
      ? this.title(statuses, projects)
      : (this.props.title || (this.props.project ? this.props.project.title : null));

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const hasRules = team.rules_search_fields_json_schema &&
      Object.keys(team.rules_search_fields_json_schema.properties.rules.properties).length > 0;

    const filterButtonClasses = {};
    filterButtonClasses[classes.margin] = true;
    filterButtonClasses[classes.filterActive] = this.filterIsActive();
    filterButtonClasses[classes.filterInactive] = !this.filterIsActive();

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
              active={this.keywordIsActive()}
              defaultValue={this.state.query.keyword || ''}
              isRtl={isRtl}
              onKeyPress={this.handleKeyPress}
              onBlur={this.handleBlur}
              onChange={this.handleInputChange}
              ref={(i) => { this.searchInput = i; }}
              autoFocus
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
          <Button
            className={classNames(filterButtonClasses)}
            variant="outlined"
            id="search__open-dialog-button"
            onClick={this.handleDialogOpen}
          >
            <FilterListIcon />
            <FormattedMessage id="search.Filter" defaultMessage="Filter" />
          </Button>
          { (this.filterIsActive() || this.keywordIsActive()) ?
            <Tooltip title={this.props.intl.formatMessage(messages.clear)}>
              <IconButton
                id="search-query__clear-button"
                onClick={() => { this.resetFilters(true); }}
              >
                <ClearIcon style={{ color: highlightOrange }} />
              </IconButton>
            </Tooltip>
            : null
          }
        </Row>
        <PageTitle prefix={title} skipTeam={false} team={this.props.team}>
          <Dialog
            className="search__query-dialog"
            maxWidth="md"
            fullWidth
            scroll="paper"
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
                        <StyledFilterChip
                          id={`search-query__status-${status.id}`}
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
                        </StyledFilterChip>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('project') ?
                    <StyledFilterRow>
                      <h4>
                        <FormattedMessage id="search.projectHeading" defaultMessage="List" />
                      </h4>
                      {projects.map(project => (
                        <StyledFilterChip
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
                        </StyledFilterChip>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('tags') && suggestedTags.length ?
                    <StyledFilterRow>
                      <h4>
                        <FormattedMessage id="status.categoriesHeading" defaultMessage="Default Tags" />
                      </h4>
                      {suggestedTags.map(tag => (
                        <StyledFilterChip
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
                        </StyledFilterChip>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('show') ?
                    <StyledFilterRow className="search-query__sort-actions">
                      <h4><FormattedMessage id="search.show" defaultMessage="Type" /></h4>
                      <StyledFilterChip
                        active={this.showIsSelected('claims')}
                        onClick={this.handleShowClick.bind(this, 'claims')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.showIsSelected('claims'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showClaims" defaultMessage="Texts" />
                      </StyledFilterChip>
                      <StyledFilterChip
                        active={this.showIsSelected('links')}
                        onClick={this.handleShowClick.bind(this, 'links')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.showIsSelected('links'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showLinks" defaultMessage="Links" />
                      </StyledFilterChip>
                      <StyledFilterChip
                        active={this.showIsSelected('images')}
                        onClick={this.handleShowClick.bind(this, 'images')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.showIsSelected('images'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showImages" defaultMessage="Images" />
                      </StyledFilterChip>
                      <StyledFilterChip
                        active={this.showIsSelected('videos')}
                        onClick={this.handleShowClick.bind(this, 'videos')}
                        className={bemClass(
                          'search-query__filter-button',
                          this.showIsSelected('videos'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showVideos" defaultMessage="Videos" />
                      </StyledFilterChip>
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
                        // #8220 remove "spam" until we get real values for it.
                        annotationType.items.enum.filter(value => value !== 'spam').forEach((value, i) => {
                          const label = annotationType.items.enumNames[i];
                          const option = (
                            <StyledFilterChip
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
                            </StyledFilterChip>
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

                  {hasRules && this.showField('rules') && currentUser.is_admin ?
                    <StyledFilterRow className="search-query__sort-actions">
                      <h4><FormattedMessage id="search.rules" defaultMessage="Rules" /></h4>
                      {Object
                        .keys(team.rules_search_fields_json_schema.properties.rules.properties)
                        .map((id) => {
                          const label = team.rules_search_fields_json_schema.properties
                            .rules.properties[id].title;
                          return (
                            <StyledFilterChip
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
                            </StyledFilterChip>
                          );
                        })
                      }
                    </StyledFilterRow> : null}

                  <p style={{ textAlign: 'right' }}>
                    <Button
                      id="search-query__cancel-button"
                      onClick={this.cancelFilters.bind(this)}
                    >
                      {this.props.intl.formatMessage(messages.cancel)}
                    </Button>

                    <Button
                      id="search-query__reset-button"
                      onClick={() => { this.resetFilters(); }}
                    >
                      {this.props.intl.formatMessage(messages.reset)}
                    </Button>

                    <Button
                      id="search-query__submit-button"
                      onClick={this.handleApplyFilters.bind(this)}
                      disabled={this.doneButtonDisabled()}
                      color="primary"
                    >
                      {this.props.intl.formatMessage(messages.applyFilters)}
                    </Button>
                  </p>
                </StyledSearchFiltersSection>
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
  classes: PropTypes.object.isRequired,
  pusher: pusherShape.isRequired,
};

SearchQueryComponent.contextTypes = {
  store: PropTypes.object,
};

export default withStyles(styles)(withPusher(injectIntl(SearchQueryComponent)));
export { StyledFilterRow };
