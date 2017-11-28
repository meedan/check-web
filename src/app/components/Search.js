import React, { Component } from 'react';
import Relay from 'react-relay';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import InfiniteScroll from 'react-infinite-scroller';
import isEqual from 'lodash.isequal';
import sortby from 'lodash.sortby';
import config from 'config';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import { bemClass } from '../helpers';
import { teamStatuses } from '../customHelpers';
import PageTitle from './PageTitle';
import SearchRoute from '../relay/SearchRoute';
import TeamRoute from '../relay/TeamRoute';
import checkSearchResultFragment from '../relay/checkSearchResultFragment';
import bridgeSearchResultFragment from '../relay/bridgeSearchResultFragment';
import MediaDetail from './media/MediaDetail';
import CheckContext from '../CheckContext';
import MediasLoading from './media/MediasLoading';
import SourceCard from './source/SourceCard';
import {
  white,
  black87,
  black38,
  black16,
  black05,
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
} from '../styles/js/shared';

const pageSize = 20;

const StyledSearchInput = styled.input`
  background: ${units(2)} 50% url('/images/search.svg') ${white} no-repeat;
  background-size: ${units(2)};
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
  try {
    return JSON.parse(decodeURIComponent(urlQuery));
  } catch (e) {
    return {};
  }
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
    defaultMessage: 'A report was just marked as "translated"',
  },
});

class SearchQueryComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: {},
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
    return !isEqual(this.state.query, nextState.query) || !isEqual(this.state.query, query);
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
    const context = new CheckContext(this);
    return context;
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
    const selectedStatuses = state.query.status || [];
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
    if (['recent_added', 'recent_activity'].includes(sortParam)) {
      return state.query.sort === sortParam || (!state.query.sort && sortParam === 'recent_added');
    } else if (['ASC', 'DESC'].includes(sortParam)) {
      return (
        state.query.sort_type === sortParam || (!state.query.sort_type && sortParam === 'DESC')
      );
    }
    return null;
  }

  showIsSelected(show, state = this.state) {
    const selected = state.query.show || ['medias'];
    return selected.includes(show);
  }

  handleStatusClick(statusCode) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      const statusIsSelected = this.statusIsSelected(statusCode, state);
      const selectedStatuses = state.query.status || []; // TODO: avoid ambiguous reference

      if (statusIsSelected) {
        selectedStatuses.splice(selectedStatuses.indexOf(statusCode), 1); // remove from array
        if (!selectedStatuses.length) delete state.query.status;
      } else {
        state.query.status = selectedStatuses.concat(statusCode);
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
    const that = this;
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      const tagIsSelected = that.tagIsSelected(tag, state);
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
      if (['recent_added', 'recent_activity'].includes(sortParam)) {
        state.query.sort = sortParam;
        return { query: state.query };
      } else if (['ASC', 'DESC'].includes(sortParam)) {
        state.query.sort_type = sortParam;
        return { query: state.query };
      }
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

  // Create title out of query parameters
  // To understand this code:
  // - http://stackoverflow.com/a/10865042/209184 for `[].concat.apply`
  // - http://stackoverflow.com/a/19888749/209184 for `filter(Boolean)`
  title(statuses, projects) {
    const query = this.state.query;
    return (
      [].concat
        .apply(
          [],
          [
            query.projects
              ? query.projects.map((p) => {
                const project = projects.find(pr => pr.node.dbid === p);
                return project ? project.node.title : '';
              })
              : [],
            query.status
              ? query.status.map((s) => {
                const status = statuses.find(so => so.id === s);
                return status ? status.label : '';
              })
              : [],
            query.keyword,
            query.tags,
          ].filter(Boolean),
        )
        .join(' ')
        .trim() || this.props.intl.formatMessage(messages.title)
    );
  }

  showField(field) {
    if (!this.props.fields) {
      return true;
    }

    return this.props.fields.indexOf(field) > -1;
  }

  render() {
    const statuses = JSON.parse(teamStatuses(this.props.team)).statuses;
    const projects = this.props.team.projects.edges.sortp((a, b) =>
      a.node.title.localeCompare(b.node.title),
    );
    const suggestedTags = this.props.team.get_suggested_tags
      ? this.props.team.get_suggested_tags.split(',')
      : [];
    const title =
      this.props.title ||
      (this.props.project ? this.props.project.title : this.title(statuses, projects));

    return (
      <PageTitle prefix={title} skipTeam={false} team={this.props.team}>

        <ContentColumn>

          {/* Keyword */}
          {this.showField('keyword')
            ? <form
              id="search-form"
              className="search__form"
              onSubmit={this.handleSubmit.bind(this)}
            >
              <StyledSearchInput
                placeholder={this.props.intl.formatMessage(messages.searchInputHint)}
                name="search-input"
                id="search-input"
                defaultValue={this.state.query.keyword || ''}
                ref={input => (this.searchQueryInput = input)}
                isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
                autofocus
              />
            </form>
            : null}

          <StyledSearchFiltersSection>
            {/* Status */}
            {this.showField('status')
              ? <StyledFilterRow isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
                <h4><FormattedMessage id="search.statusHeading" defaultMessage="Status" /></h4>
                {statuses.map(status =>
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
                  </StyledFilterButton>,
                  )}
              </StyledFilterRow>
              : null}

            {/* Project */}
            {this.showField('project')
              ? <StyledFilterRow>
                <h4>
                  <FormattedMessage id="search.projectHeading" defaultMessage="Project" />
                </h4>
                {projects.map(project =>
                  <StyledFilterButton
                    active={this.projectIsSelected(project.node.dbid)}
                    key={project.node.dbid}
                    title={project.node.description}
                    onClick={this.handleProjectClick.bind(this, project.node.dbid)}
                    className={bemClass(
                        'media-tags__suggestion',
                        this.projectIsSelected(project.node.dbid),
                        '--selected',
                      )}
                  >
                    {project.node.title}
                  </StyledFilterButton>,
                  )}
              </StyledFilterRow>
              : null}

            {/* Tags */}
            {this.showField('tags') && suggestedTags.length
              ? <StyledFilterRow>
                <h4>
                  <FormattedMessage id="status.categoriesHeading" defaultMessage="Categories" />
                </h4>
                {suggestedTags.map(tag =>
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
                  </StyledFilterButton>,
                  )}
              </StyledFilterRow>
              : null}

            {/* Sort */}
            {this.showField('sort')
              ? <StyledFilterRow className="search-query__sort-actions media-tags__suggestions-list">
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
                <StyledFilterButton
                  active={this.sortIsSelected('DESC')}
                  onClick={this.handleSortClick.bind(this, 'DESC')}
                  className={bemClass(
                      'media-tags__suggestion',
                      this.sortIsSelected('DESC'),
                      '--selected',
                    )}
                >
                  <FormattedMessage id="search.sortByNewest" defaultMessage="Newest first" />
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
                  <FormattedMessage id="search.sortByOldest" defaultMessage="Oldest first" />
                </StyledFilterButton>
              </StyledFilterRow>
              : null}

            {/* Show */}
            {this.showField('show')
              ? <StyledFilterRow className="search-query__sort-actions media-tags__suggestions-list">
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

          </StyledSearchFiltersSection>

          {this.props.addons}
        </ContentColumn>
      </PageTitle>
    );
  }
}

SearchQueryComponent.propTypes = {
  intl: intlShape.isRequired,
};

SearchQueryComponent.contextTypes = {
  store: React.PropTypes.object,
};

const SearchQueryContainer = Relay.createContainer(injectIntl(SearchQueryComponent), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        media_verification_statuses,
        translation_statuses,
        get_suggested_tags,
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
    `,
  },
});

class SearchResultsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pusherSubscribed: false,
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  subscribe() {
    const pusher = this.currentContext().pusher;
    if (pusher && this.props.search.pusher_channel && !this.state.pusherSubscribed) {
      const that = this;
      const channel = this.props.search.pusher_channel;

      pusher.unsubscribe(channel);

      pusher.subscribe(channel).bind('media_updated', (data) => {
        let content = null;
        let message = {};
        const currentUser = that.currentContext().currentUser;
        const currentUserId = currentUser ? currentUser.dbid : 0;
        const avatar = config.restBaseUrl.replace(/\/api.*/, '/images/bridge.png');

        try {
          message = JSON.parse(data.message) || {};
        } catch (e) {
          message = {};
        }

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
            that.props.intl.formatMessage(messages.newTranslationRequestNotification),
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
              that.props.intl.formatMessage(messages.newTranslationNotification),
              that.props.intl.formatMessage(messages.newTranslationNotificationBody),
              url,
              avatar,
              '_self',
            );
          }
        }

        if (that.currentContext().clientSessionId != data.actor_session_id) {
          that.props.relay.forceFetch();
        }
      });
      this.setState({ pusherSubscribed: true });
    }
  }

  unsubscribe() {
    const pusher = this.currentContext().pusher;
    if (pusher && this.props.search.pusher_channel) {
      pusher.unsubscribe(this.props.search.pusher_channel);
    }
  }

  loadMore() {
    this.props.relay.setVariables({ pageSize: this.props.search.medias.edges.length + pageSize });
  }

  mergeResults(medias, sources) {
    const query = searchQueryFromUrl();
    const comparisonField = query.sort === 'recent_activity'
      ? function (o) {
        return o.node.updated_at;
      }
      : function (o) {
        return o.node.published;
      };

    const results = sortby(Array.concat(medias, sources), comparisonField);
    return query.sort_type !== 'ASC' ? results.reverse() : results;
  }

  render() {
    const medias = this.props.search ? this.props.search.medias.edges : [];
    const sources = this.props.search ? this.props.search.sources.edges : [];
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const mediasCount = this.props.intl.formatMessage(messages.searchResults, {
      resultsCount: count,
    });
    const title = /\/project\//.test(window.location.pathname) ? '' : mediasCount;
    const searchResults = this.mergeResults(medias, sources);

    return (
      <StyledSearchResultsWrapper className="search__results results">
        <h3 className="search__results-heading">{title}</h3>
        <InfiniteScroll hasMore loadMore={this.loadMore.bind(this)} threshold={500}>
          <div className="search__results-list results medias-list">
            {searchResults.map(item =>
              <li key={item.node.id} className="medias__item">
                {item.node.media
                  ? <MediaDetail media={item.node} condensed parentComponent={this} />
                  : <SourceCard source={item.node} />}
              </li>,
            )}
          </div>
        </InfiniteScroll>
      </StyledSearchResultsWrapper>
    );
  }
}

SearchResultsComponent.contextTypes = {
  store: React.PropTypes.object,
};

SearchResultsComponent.propTypes = {
  intl: intlShape.isRequired,
};

let fragment = null;
if (config.appName === 'check') {
  fragment = checkSearchResultFragment;
} else if (config.appName === 'bridge') {
  fragment = bridgeSearchResultFragment;
}

const SearchResultsContainer = Relay.createContainer(injectIntl(SearchResultsComponent), {
  initialVariables: {
    pageSize,
  },
  fragments: {
    search: () => fragment,
  },
});

class Search extends Component {
  noFilters(query) {
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
    if (query.status && query.status.length === 0) {
      delete query.status;
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

    return (
      <div className="search">
        <Relay.RootContainer
          Component={SearchQueryContainer}
          route={queryRoute}
          renderFetched={data => <SearchQueryContainer {...this.props} {...data} />}
          renderLoading={function () {
            return (
              <ContentColumn>

                {!fields || fields.indexOf('keyword') > -1
                  ? <div className="search__form search__form--loading">
                    <StyledSearchInput
                      disabled
                      placeholder={formatMessage(messages.loading)}
                      name="search-input"
                      id="search-input"
                    />
                  </div>
                  : null}

              </ContentColumn>
            );
          }}
        />
        <Relay.RootContainer
          Component={SearchResultsContainer}
          route={resultsRoute}
          renderLoading={function () {
            return <MediasLoading />;
          }}
        />
      </div>
    );
  }
}

Search.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Search);
