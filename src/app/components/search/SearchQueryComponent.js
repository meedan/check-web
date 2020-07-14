import React from 'react';
import classNames from 'classnames';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FilterListIcon from '@material-ui/icons/FilterList';
import ClearIcon from '@material-ui/icons/Clear';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import { withPusher, pusherShape } from '../../pusher';
import DateRangeFilter from './DateRangeFilter';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import { bemClass } from '../../helpers';
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
  units,
  caption,
  borderWidthLarge,
  transitionSpeedDefault,
  mediaQuery,
  ellipsisStyles,
} from '../../styles/js/shared';

export const StyledSearchInput = styled.input`
  background-repeat: no-repeat;
  background-color: ${white};
  background-image: url('/images/search.svg');
  background-position: ${props => (props.theme.dir === 'rtl' ? `calc(100% - ${units(2)})` : units(2))} center;
  border: ${borderWidthLarge} solid ${props => (props.active ? highlightOrange : black16)};
  border-radius: ${units(0.5)};
  height: ${units(5)};
  outline: none;
  width: 100%;
  font-size: 16px;
  padding-${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${units(6)};
`;

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
});

function addToArraySet(array, value) {
  if (!array || !array.length) {
    // Empty array means undefined
    return [value];
  }
  const ret = array.slice();
  ret.push(value);
  ret.sort(); // should make output more predictable
  return ret;
}

function removeFromArraySet(array, value) {
  const ret = (array || []).filter(v => v !== value);
  if (ret.length === 0) {
    return undefined;
  }
  return ret;
}

/**
 * Given an array or undefined, return an array or undefined.
 *
 * If `array` contains `value`, then the return value won't have it.
 * Otherwise, the return value _will_.
 *
 * `undefined` is understood to be the empty array. This function will never
 * return `[]`: it will always return `undefined`.
 */
function toggleArraySetContains(array, value) {
  if (array && array.includes(value)) {
    return removeFromArraySet(array, value);
  }
  return addToArraySet(array, value);
}

/**
 * Return `query`, with property `key` changed to omit/add `value`.
 *
 * `undefined` is understood to be the empty array. This function will remove
 * the `key` filter rather than return an empty array.
 */
function toggleStateQueryArrayValue(query, key, value) {
  const newArray = toggleArraySetContains(query[key], value);
  if (newArray === undefined) {
    const newQuery = { ...query };
    delete newQuery[key];
    return newQuery;
  }
  return { ...query, [key]: newArray };
}

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

  handleApplyFilters() {
    if (!deepEqual(this.state.query, this.props.query)) {
      this.props.onChange(this.state.query);
    }
  }

  keywordIsActive = () => {
    const { query } = this.props;
    return query.keyword && query.keyword.trim() !== '';
  };

  filterIsActive = () => {
    const { query } = this.props;
    const filterFields = ['range', 'verification_status', 'projects', 'tags', 'show', 'dynamic'];
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

  tagIsSelected(tag) {
    const array = this.state.query.tags;
    return array ? array.includes(tag) : false;
  }

  showIsSelected(show) {
    const array = this.state.query.show;
    return array ? array.includes(show) : false;
  }

  ruleIsSelected(rule) {
    const array = this.state.query.rules;
    return array ? array.includes(rule) : false;
  }

  dynamicIsSelected(field, value) {
    const dynamic = this.state.query.dynamic || {};
    const array = dynamic[field];
    return array ? array.includes(value) : false;
  }

  handleDateChange = (value) => {
    this.setState({ query: { ...this.state.query, range: value } });
  }

  handleStatusClick = (statusCode) => {
    this.setState({
      query: toggleStateQueryArrayValue(this.state.query, 'verification_status', statusCode),
    });
  }

  handleProjectClick(projectId) {
    this.setState({
      query: toggleStateQueryArrayValue(this.state.query, 'projects', projectId),
    });
  }

  handleTagClick(tag) {
    this.setState({
      query: toggleStateQueryArrayValue(this.state.query, 'tags', tag),
    });
  }

  handleRuleClick(rule) {
    this.setState({
      query: toggleStateQueryArrayValue(this.state.query, 'rules', rule),
    });
  }

  handleShowClick(show) {
    this.setState({
      query: toggleStateQueryArrayValue(this.state.query, 'show', show),
    });
  }

  handleDynamicClick(field, value) {
    const { query } = this.state;
    const oldDynamic = query.dynamic ? query.dynamic : {};
    const newDynamic = toggleStateQueryArrayValue(oldDynamic, field, value);
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

  showField(field) {
    return this.props.fields ? this.props.fields.indexOf(field) > -1 : true;
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

  doneButtonDisabled() {
    return deepEqual(this.state.query, this.props.query);
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

    const { currentUser } = this.currentContext();
    const plainTagsTexts = team.tag_texts ?
      team.tag_texts.edges.map(t => t.node.text) : [];

    const title = (this.filterIsActive() || this.keywordIsActive())
      ? this.title(statuses, projects)
      : (this.props.title || (this.props.project ? this.props.project.title : null));

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
            onSubmit={this.handleSubmit}
            autoComplete="off"
          >
            <FormattedMessage id="search.inputHint" defaultMessage="Search">
              {placeholder => (
                <StyledSearchInput
                  placeholder={placeholder}
                  name="search-input"
                  id="search-input"
                  active={this.keywordIsActive()}
                  defaultValue={this.state.query.keyword || ''}
                  onBlur={this.handleBlur}
                  onChange={this.handleInputChange}
                  ref={this.searchInput}
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
            <DialogContent>
              <StyledSearchFiltersSection>
                <DateRangeFilter
                  hidden={!this.showField('date')}
                  onChange={this.handleDateChange}
                  value={this.state.query.range}
                />
                {this.showField('status') ?
                  <StyledFilterRow>
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

                {this.showField('project') && projects.length ?
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

                {this.showField('tags') && plainTagsTexts.length ?
                  <StyledFilterRow>
                    <h4>
                      <FormattedMessage id="status.categoriesHeading" defaultMessage="Tags" />
                    </h4>
                    {plainTagsTexts.map(tag => (
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

                {hasRules && this.showField('rules') && currentUser.is_admin ? (
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
                  </StyledFilterRow>
                ) : null}
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
                disabled={this.doneButtonDisabled()}
                color="primary"
              >
                <FormattedMessage id="search.applyFilters" defaultMessage="Done" />
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
};

SearchQueryComponent.contextTypes = {
  store: PropTypes.object,
};

export default withStyles(styles)(withPusher(SearchQueryComponent));
export { StyledFilterRow };
