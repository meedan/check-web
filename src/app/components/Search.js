import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import InfiniteScroll from 'react-infinite-scroller';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import IconButton from 'material-ui/IconButton';
import MdClear from 'react-icons/lib/md/clear';
import isEqual from 'lodash.isequal';
import sortby from 'lodash.sortby';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { notify, bemClass, safelyParseJSON } from '../helpers';
import { teamStatuses } from '../customHelpers';
import PageTitle from './PageTitle';
import SearchRoute from '../relay/SearchRoute';
import TeamRoute from '../relay/TeamRoute';
import checkSearchResultFragment from '../relay/checkSearchResultFragment';
import bridgeSearchResultFragment from '../relay/bridgeSearchResultFragment';
import ProjectBlankState from './project/ProjectBlankState';
import MediaDetail from './media/MediaDetail';
import CheckContext from '../CheckContext';
import MediasLoading from './media/MediasLoading';
import SourceCard from './source/SourceCard';
import BulkActions from './media/BulkActions';
import { can } from './Can';
import {
  white,
  black87,
  black38,
  black16,
  black05,
  black54,
  boxShadow,
  Row,
  ContentColumn,
  units,
  caption,
  borderWidthSmall,
  transitionSpeedFast,
  transitionSpeedDefault,
  mediaQuery,
  ellipsisStyles,
  columnWidthMedium,
} from '../styles/js/shared';

// TODO Make this a config
const pageSize = 20;

const statusKey = config.appName === 'bridge' ? 'translation_status' : 'verification_status';

const StyledSearchInput = styled.input`
  background-repeat: no-repeat;
  background-color: ${white};
  background-image: url('/images/search.svg');
  background-position: ${props => (props.isRtl ? `calc(100% - ${units(2)})` : units(2))} center;
  border: ${borderWidthSmall} solid ${black16};
  border-radius: ${units(0.5)};
  height: ${units(6)};
  margin-top: ${units(1)};
  outline: none;
  transition: box-shadow ${transitionSpeedFast};
  width: 100%;
  font-size: 16px;

  &:focus {
    box-shadow: ${boxShadow(2)};
    transition: box-shadow ${transitionSpeedDefault};
  }
  padding-${props => (props.isRtl ? 'right' : 'left')}: ${units(6)};
`;

const StyledPopper = styled(Popper)`
  width: 100%;
  max-width: ${columnWidthMedium};
  padding: 0 ${units(1)};

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

const StyledFilterRow = styled(Row)`
  max-height: ${units(20)};
  overflow-y: auto;
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

const StyledSearchResultsWrapper = styled(ContentColumn)`
    padding-bottom: 0 0 ${units(2)};

    .results li {
      margin-top: ${units(1)};
      list-style-type: none;
    }

  .search__results-heading {
    color: ${black87};
    margin-top: ${units(3)};
    text-align: center;
  }
`;

export function searchQueryFromUrlQuery(urlQuery) {
  return safelyParseJSON(decodeURIComponent(urlQuery), {});
}

export function searchQueryFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(search|project\/[0-9]+)\/(.*)/);
  return queryString ? searchQueryFromUrlQuery(queryString[2]) : {};
}

export function urlFromSearchQuery(query, prefix) {
  return isEqual(query, {}) ? prefix : `${prefix}/${encodeURIComponent(JSON.stringify(query))}`;
}

const messages = defineMessages({
  title: {
    id: 'search.title',
    defaultMessage: 'Search',
  },
  loading: {
    id: 'search.loading',
    defaultMessage: 'Loading...',
  },
  searchInputHint: {
    id: 'search.inputHint',
    defaultMessage: 'Search',
  },
  searchResults: {
    id: 'search.results',
    defaultMessage: '{resultsCount, plural, =0 {No results} one {1 result} other {# results}}',
  },
  searchResultsWithSelection: {
    id: 'search.resultsWithSelection',
    defaultMessage: '{resultsCount, plural, =0 {No results} one {1 result} other {# results}} ({selectedCount, plural, =0 {} one {1 selected} other {# selected}})',
  },
  newTranslationRequestNotification: {
    id: 'search.newTranslationRequestNotification',
    defaultMessage: 'New translation request',
  },
  newTranslationNotification: {
    id: 'search.newTranslationNotification',
    defaultMessage: 'New translation',
  },
  newTranslationNotificationBody: {
    id: 'search.newTranslationNotificationBody',
    defaultMessage: 'An item was just marked as "translated"',
  },
});

class SearchQueryComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: {},
      popper: {
        open: false,
        allowed: true,
        anchorEl: null,
      },
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

  componentWillReceiveProps() {
    const query = searchQueryFromUrl();
    if (!isEqual(this.state.query, query)) {
      this.setState({ query });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const query = searchQueryFromUrl();
    return !isEqual(this.state.query, nextState.query) ||
           !isEqual(this.state.query, query) ||
           !isEqual(this.state.popper, nextState.popper);
  }

  componentDidUpdate(prevProps, prevState) {
    const query = searchQueryFromUrl();
    if (isEqual(this.state.query, query)) return;

    const url = urlFromSearchQuery(
      prevState.query,
      this.props.project
        ? `/${this.props.team.slug}/project/${this.props.project.dbid}`
        : `/${this.props.team.slug}/search`,
    );
    this.getContext().getContextStore().history.push(url);
  }

  getContext() {
    return new CheckContext(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const keywordInput = document.getElementById('search-input').value;

    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      state.query.keyword = keywordInput;
      return { query: state.query };
    });
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
    const selected = state.query.show || ['medias'];
    return selected.includes(show);
  }

  dynamicIsSelected(field, value, state = this.state) {
    const dynamic = state.query.dynamic || {};
    const selected = dynamic[field] || [];
    return selected.includes(value);
  }

  handleStatusClick(statusCode) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      const statusIsSelected = this.statusIsSelected(statusCode, state);
      const selectedStatuses = state.query[statusKey] || []; // TODO Avoid ambiguous reference

      if (statusIsSelected) {
        selectedStatuses.splice(selectedStatuses.indexOf(statusCode), 1); // remove from array
        if (!selectedStatuses.length) delete state.query[statusKey];
      } else {
        state.query[statusKey] = selectedStatuses.concat(statusCode);
      }

      return { query: state.query };
    });
  }

  handleProjectClick(projectId) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      const projectIsSelected = this.projectIsSelected(projectId, state);
      const selectedProjects = state.query.projects || [];

      if (projectIsSelected) {
        selectedProjects.splice(selectedProjects.indexOf(projectId), 1);
        if (!selectedProjects.length) delete state.query.projects;
      } else {
        state.query.projects = selectedProjects.concat(projectId);
      }
      return { query: state.query };
    });
  }

  handleTagClick(tag) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      const tagIsSelected = this.tagIsSelected(tag, state);
      const selectedTags = state.query.tags || [];

      if (tagIsSelected) {
        selectedTags.splice(selectedTags.indexOf(tag), 1); // remove from array
        if (!selectedTags.length) delete state.query.tags;
      } else {
        state.query.tags = selectedTags.concat(tag);
      }
      return { query: state.query };
    });
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

  handleShowClick(show) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      if (!state.query.show) {
        state.query.show = ['medias'];
      }
      const i = state.query.show.indexOf(show);
      if (i === -1) {
        state.query.show.push(show);
      } else {
        state.query.show.splice(i, 1);
      }
      return { query: state.query };
    });
  }

  handleDynamicClick(field, value) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      if (!state.query.dynamic) {
        state.query.dynamic = {};
      }
      if (!state.query.dynamic[field]) {
        state.query.dynamic[field] = [];
      }
      const i = state.query.dynamic[field].indexOf(value);
      if (i === -1) {
        state.query.dynamic[field].push(value);
      } else {
        state.query.dynamic[field].splice(i, 1);
      }
      return { query: state.query };
    });
  }

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

  handleInputChange() {
    // Open the search help when
    // - user has typed something
    // - user has not explicitly closed the help
    // - user has reset the keywords
    const input = document.getElementById('search-input');
    this.setState({
      popper: {
        open: input.value.length > 0 && this.state.popper.allowed,
        anchorEl: input,
        allowed: this.state.popper.allowed || !input.value.length,
      },
    });
  }

  handlePopperClick() {
    this.setState({ popper: { open: false, allowed: false } });
  }

  render() {
    const { team } = this.props;
    const { statuses } = teamStatuses(team);
    let projects = [];
    if (team.projects) {
      projects = team.projects.edges.sortp((a, b) =>
        a.node.title.localeCompare(b.node.title));
    }
    const suggestedTags = team.get_suggested_tags
      ? team.get_suggested_tags.split(',').map(tag => tag.trim())
      : [];
    const title =
      this.props.title ||
      (this.props.project ? this.props.project.title : this.title(statuses, projects));

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    return (
      <PageTitle prefix={title} skipTeam={false} team={this.props.team}>

        <ContentColumn>
          {this.showField('keyword') ?
            <form
              id="search-form"
              className="search__form"
              onSubmit={this.handleSubmit.bind(this)}
              autoComplete="off"
            >
              <StyledSearchInput
                placeholder={this.props.intl.formatMessage(messages.searchInputHint)}
                name="search-input"
                id="search-input"
                defaultValue={this.state.query.keyword || ''}
                isRtl={isRtl}
                onChange={this.handleInputChange.bind(this)}
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
                    <MdClear />
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
            : null}

          <StyledSearchFiltersSection>
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
                      'media-tags__suggestion',
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
                  <FormattedMessage id="search.projectHeading" defaultMessage="Project" />
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
                  <FormattedMessage id="status.categoriesHeading" defaultMessage="Categories" />
                </h4>
                {suggestedTags.map(tag => (
                  <StyledFilterButton
                    active={this.tagIsSelected(tag)}
                    key={tag}
                    title={null}
                    onClick={this.handleTagClick.bind(this, tag)}
                    className={bemClass(
                      'media-tags__suggestion',
                      this.tagIsSelected(tag),
                      '--selected',
                    )}
                  >
                    {tag}
                  </StyledFilterButton>))}
              </StyledFilterRow>
              : null}

            {this.showField('sort') ?
              <StyledFilterRow className="search-query__sort-actions media-tags__suggestions-list">
                <h4><FormattedMessage id="search.sort" defaultMessage="Sort" /></h4>

                <StyledFilterButton
                  active={this.sortIsSelected('recent_added')}
                  onClick={this.handleSortClick.bind(this, 'recent_added')}
                  className={bemClass(
                    'media-tags__suggestion',
                    this.sortIsSelected('recent_added'),
                    '--selected',
                  )}
                >
                  <FormattedMessage id="search.sortByCreated" defaultMessage="Created" />
                </StyledFilterButton>
                <StyledFilterButton
                  active={this.sortIsSelected('recent_activity')}
                  onClick={this.handleSortClick.bind(this, 'recent_activity')}
                  className={bemClass(
                    'media-tags__suggestion',
                    this.sortIsSelected('recent_activity'),
                    '--selected',
                  )}
                >
                  <FormattedMessage
                    id="search.sortByRecentActivity"
                    defaultMessage="Recent activity"
                  />
                </StyledFilterButton>

                {Object.keys(team.dynamic_search_fields_json_schema.properties.sort.properties)
                  .map((id) => {
                    const { sort } = team.dynamic_search_fields_json_schema.properties;
                    const label = sort.properties[id].title;
                    return (
                      <StyledFilterButton
                        key={`dynamic-sort-${id}`}
                        active={this.sortIsSelected(id)}
                        onClick={this.handleSortClick.bind(this, id)}
                        className={bemClass(
                          'media-tags__suggestion',
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
                    'media-tags__suggestion',
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
                    'media-tags__suggestion',
                    this.sortIsSelected('ASC'),
                    '--selected',
                  )}
                >
                  {this.sortLabel('ASC')}
                </StyledFilterButton>
              </StyledFilterRow>
              : null}

            {this.showField('show') ?
              <StyledFilterRow className="search-query__sort-actions media-tags__suggestions-list">
                <h4><FormattedMessage id="search.show" defaultMessage="Show" /></h4>
                <StyledFilterButton
                  active={this.showIsSelected('medias')}
                  onClick={this.handleShowClick.bind(this, 'medias')}
                  className={bemClass(
                    'media-tags__suggestion',
                    this.showIsSelected('medias'),
                    '--selected',
                  )}
                >
                  <FormattedMessage id="search.showMedia" defaultMessage="Media" />
                </StyledFilterButton>
                <StyledFilterButton
                  active={this.showIsSelected('sources')}
                  onClick={this.handleShowClick.bind(this, 'sources')}
                  className={bemClass(
                    'media-tags__suggestion',
                    this.showIsSelected('sources'),
                    '--selected',
                  )}
                >
                  <FormattedMessage id="search.showSources" defaultMessage="Sources" />
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
                          'media-tags__suggestion',
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
                  <StyledFilterRow key={`dynamic-field-${key}`} className="search-query__dynamic media-tags__suggestions-list">
                    <h4>{annotationType.title}</h4>
                    {fields}
                  </StyledFilterRow>
                );
              }))
              : null}

          </StyledSearchFiltersSection>

          {this.props.addons}
        </ContentColumn>
      </PageTitle>
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

// eslint-disable-next-line react/no-multi-comp
class SearchResultsComponent extends Component {
  static mergeResults(medias, sources) {
    if (medias.length === 0 && sources.length === 0) {
      return [];
    }
    if (sources.length === 0) {
      return medias;
    }
    if (medias.length === 0) {
      return sources;
    }
    const query = searchQueryFromUrl();
    const comparisonField = query.sort === 'recent_activity'
      ? o => o.node.updated_at
      : o => o.node.published;

    const results = sortby(Array.concat(medias, sources), comparisonField);
    return query.sort_type !== 'ASC' ? results.reverse() : results;
  }

  constructor(props) {
    super(props);

    this.state = {
      pusherSubscribed: false,
      selectedMedia: [],
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onSelect(id) {
    const selectedMedia = this.state.selectedMedia.slice(0);
    const index = selectedMedia.indexOf(id);
    if (index === -1) {
      selectedMedia.push(id);
    } else {
      selectedMedia.splice(index, 1);
    }
    this.setState({ selectedMedia });
  }

  onSelectAll() {
    const { search } = this.props;
    const selectedMedia = search ? search.medias.edges.map(item => item.node.id) : [];
    this.setState({ selectedMedia });
  }

  onUnselectAll() {
    this.setState({ selectedMedia: [] });
  }

  getContext() {
    return new CheckContext(this);
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  subscribe() {
    const { pusher } = this.currentContext();
    if (pusher && this.props.search.pusher_channel && !this.state.pusherSubscribed) {
      const { search: { pusher_channel: channel } } = this.props;

      pusher.unsubscribe(channel);

      pusher.subscribe(channel).bind('media_updated', (data) => {
        const message = safelyParseJSON(data.message, {});
        const { currentUser } = this.currentContext();
        const currentUserId = currentUser ? currentUser.dbid : 0;
        const avatar = config.restBaseUrl.replace(/\/api.*/, '/images/bridge.png');

        let content = null;
        try {
          content = message.quote || message.url || message.file.url;
        } catch (e) {
          content = null;
        }

        // Notify other users that there is a new translation request
        if (
          content &&
          message.class_name === 'translation_request' &&
          currentUserId !== message.user_id
        ) {
          const url = window.location.pathname.replace(
            /(^\/[^/]+\/project\/[0-9]+).*/,
            `$1/media/${message.id}`,
          );
          notify(
            this.props.intl.formatMessage(messages.newTranslationRequestNotification),
            content,
            url,
            avatar,
            '_self',
          );
        } else if (
          message.annotation_type === 'translation_status' &&
          currentUserId !== message.annotator_id
        ) {
          // Notify other users that there is a new translation
          let translated = false;
          message.data.fields.forEach((field) => {
            if (field.field_name === 'translation_status_status' && field.value === 'translated') {
              translated = true;
            }
          });
          if (translated) {
            const url = window.location.pathname.replace(
              /(^\/[^/]+\/project\/[0-9]+).*/,
              `$1/media/${message.annotated_id}`,
            );
            notify(
              this.props.intl.formatMessage(messages.newTranslationNotification),
              this.props.intl.formatMessage(messages.newTranslationNotificationBody),
              url,
              avatar,
              '_self',
            );
          }
        }

        if (this.currentContext().clientSessionId !== data.actor_session_id) {
          this.props.relay.forceFetch();
        }
      });
      this.setState({ pusherSubscribed: true });
    }
  }

  unsubscribe() {
    const { pusher } = this.currentContext();
    if (pusher && this.props.search.pusher_channel) {
      pusher.unsubscribe(this.props.search.pusher_channel);
    }
  }

  loadMore() {
    this.props.relay.setVariables({
      pageSize: this.props.search.medias.edges.length +
        this.props.search.sources.edges.length + pageSize,
    });
  }

  render() {
    const medias = this.props.search ? this.props.search.medias.edges : [];
    const sources = this.props.search ? this.props.search.sources.edges : [];

    const searchResults = SearchResultsComponent.mergeResults(medias, sources);
    const count = this.props.search ? this.props.search.number_of_results : 0;

    const hasMore = (searchResults.length < count);

    const mediasCount =
      this.state.selectedMedia.length ?
        this.props.intl.formatMessage(messages.searchResultsWithSelection, {
          resultsCount: count,
          selectedCount: this.state.selectedMedia.length,
        }) :
        this.props.intl.formatMessage(messages.searchResults, {
          resultsCount: count,
        });

    const team = medias.length > 0 ? medias[0].node.team : this.currentContext().team;

    const isProject = /\/project\//.test(window.location.pathname);
    let title = null;
    if (isProject && count === 0) {
      title = (<ProjectBlankState project={this.currentContext().project} />);
    } else {
      title = (
        <h3 className="search__results-heading">
          <span style={{ verticalAlign: 'top', lineHeight: '24px' }}>{mediasCount}</span>
          {medias.length && can(medias[0].node.permissions, 'administer Content') ?
            <BulkActions
              team={team}
              project={this.currentContext().project}
              selectedMedia={this.state.selectedMedia}
              onSelectAll={this.onSelectAll.bind(this)}
              onUnselectAll={this.onUnselectAll.bind(this)}
            /> : null}
        </h3>
      );
    }

    return (
      <StyledSearchResultsWrapper className="search__results results">
        {title}
        <InfiniteScroll hasMore={hasMore} loadMore={this.loadMore.bind(this)} threshold={500}>
          <div className="search__results-list results medias-list">
            {searchResults.map(item => (
              <li key={item.node.id} className="medias__item">
                {item.node.media ?
                  <MediaDetail
                    media={item.node}
                    condensed
                    selected={this.state.selectedMedia.indexOf(item.node.id) > -1}
                    onSelect={this.onSelect.bind(this)}
                    parentComponent={this}
                  />
                  : <SourceCard source={item.node} />}
              </li>))}
          </div>
        </InfiniteScroll>
      </StyledSearchResultsWrapper>
    );
  }
}

SearchResultsComponent.contextTypes = {
  store: PropTypes.object,
};

SearchResultsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

const SearchResultsContainer = Relay.createContainer(injectIntl(SearchResultsComponent), {
  initialVariables: {
    pageSize,
  },
  fragments: {
    search: () => config.appName === 'bridge' ? bridgeSearchResultFragment : checkSearchResultFragment,
  },
});

// eslint-disable-next-line react/no-multi-comp
class Search extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (isEqual(this.props, nextProps) && isEqual(this.state, nextState)) {
      return false;
    }
    return true;
  }

  noFilters(query_) {
    const query = query_;
    delete query.timestamp;
    delete query.parent;
    if (
      query.projects &&
      (query.projects.length === 0 ||
        (this.props.project &&
          query.projects.length === 1 &&
          query.projects[0] === this.props.project.dbid))
    ) {
      delete query.projects;
    }
    if (query[statusKey] && query[statusKey].length === 0) {
      delete query[statusKey];
    }
    if (query.sort && query.sort === 'recent_added') {
      delete query.sort;
    }
    if (query.sort_type && query.sort_type === 'DESC') {
      delete query.sort_type;
    }
    if (Object.keys(query).length === 0 && query.constructor === Object) {
      return true;
    }
    return false;
  }

  render() {
    const searchQuery = this.props.query || this.props.params.query;
    const teamSlug = this.props.team || this.props.params.team;

    const query = searchQueryFromUrlQuery(searchQuery);
    if (!this.noFilters(query)) {
      query.timestamp = new Date().getTime();
    }
    if (this.props.project) {
      query.parent = { type: 'project', id: this.props.project.dbid };
      query.projects = [this.props.project.dbid];
    } else {
      query.parent = { type: 'team', slug: teamSlug };
    }

    const queryRoute = new TeamRoute({ teamSlug });
    const resultsRoute = new SearchRoute({ query: JSON.stringify(query) });
    const { formatMessage } = this.props.intl;
    const { fields } = this.props;

    const queryWithoutProjects = Relay.QL`
      fragment on Team {
        id,
        dbid,
        media_verification_statuses,
        translation_statuses,
        get_suggested_tags,
        dynamic_search_fields_json_schema,
        name,
        slug,
      }
    `;

    const queryWithProjects = Relay.QL`
      fragment on Team {
        id,
        dbid,
        media_verification_statuses,
        translation_statuses,
        get_suggested_tags,
        dynamic_search_fields_json_schema,
        name,
        slug,
        projects(first: 10000) {
          edges {
            node {
              title,
              dbid,
              id,
              description
            }
          }
        }
      }
    `;

    const gqlquery = this.props.project ? queryWithoutProjects : queryWithProjects;

    const SearchQueryContainer = Relay.createContainer(injectIntl(SearchQueryComponent), {
      fragments: {
        team: () => gqlquery,
      },
    });

    return (
      <div className="search">
        <Relay.RootContainer
          Component={SearchQueryContainer}
          route={queryRoute}
          renderFetched={data => <SearchQueryContainer {...this.props} {...data} />}
          renderLoading={() => (
            <ContentColumn>
              {!fields || fields.indexOf('keyword') > -1 ?
                <div className="search__form search__form--loading">
                  <StyledSearchInput
                    disabled
                    placeholder={formatMessage(messages.loading)}
                    name="search-input"
                    id="search-input"
                  />
                </div>
                : null}
            </ContentColumn>)
          }
        />
        <Relay.RootContainer
          Component={SearchResultsContainer}
          route={resultsRoute}
          renderLoading={() => <MediasLoading />}
        />
      </div>
    );
  }
}

Search.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(Search);
