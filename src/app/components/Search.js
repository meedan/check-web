import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import InfiniteScroll from 'react-infinite-scroller';
import SearchRoute from '../relay/SearchRoute';
import TeamRoute from '../relay/TeamRoute';
import MediaDetail from './media/MediaDetail';
import { bemClass } from '../helpers';
import { pageTitle, getStatusStyle } from '../helpers';
import CheckContext from '../CheckContext';
import ContentColumn from './layout/ContentColumn';
import MediasLoading from './media/MediasLoading';
import Pusher from 'pusher-js';
import isEqual from 'lodash.isequal';

const pageSize = 20;

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
  searchResult: {
    id: 'search.result',
    defaultMessage: 'Result',
  },
  searchResults: {
    id: 'search.results',
    defaultMessage: 'Results',
  },
});

class SearchQueryComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: {},
    };
  }

  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  setQueryFromUrl() {
    const context = this.getContext();
    if (context.getContextStore().project && /\/search/.test(window.location.pathname)) {
      context.setContextStore({ project: null });
    }

    const query = searchQueryFromUrl();
    if (isEqual(this.state.query, {}) && !isEqual(this.state.query, query)) {
      this.setState({ query });
    }
  }

  componentWillMount() {
    this.setQueryFromUrl();
  }

  componentWillUpdate(nextProps, nextState) {
    this.setQueryFromUrl();
  }

  componentDidMount() {
    if (this.searchQueryInput) {
      this.searchQueryInput.focus();
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const keywordInput = document.getElementById('search-input').value;

    this.setState((prevState, props) => {
      const state = Object.assign({}, prevState);
      state.query.keyword = keywordInput;
      return { query: state.query };
    });
  }

  urlQueryFromQuery(query) {
    return encodeURIComponent(JSON.stringify(query));
  }

  componentDidUpdate(prevProps, prevState) {
    const urlQuery = this.urlQueryFromQuery(prevState.query);
    const teamSlug = this.props.team.slug;
    const url = this.props.project ? `/${teamSlug}/project/${this.props.project.dbid}/${urlQuery}` : `/${teamSlug}/search/${urlQuery}`;
    if (url !== window.location.pathname) {
      this.getContext().getContextStore().history.push(url);
    }
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
      return state.query.sort_type === sortParam || (!state.query.sort_type && sortParam === 'DESC');
    }
  }

  handleStatusClick(statusCode) {
    this.setState((prevState, props) => {
      const state = Object.assign({}, prevState);
      const statusIsSelected = this.statusIsSelected(statusCode, state);
      const selectedStatuses = state.query.status || []; // TODO: avoid ambiguous reference

      if (statusIsSelected) {
        selectedStatuses.splice(selectedStatuses.indexOf(statusCode), 1); // remove from array
      } else {
        state.query.status = selectedStatuses.concat(statusCode);
      }

      return { query: state.query };
    });
  }

  handleProjectClick(projectId) {
    this.setState((prevState, props) => {
      const state = Object.assign({}, prevState);
      const projectIsSelected = this.projectIsSelected(projectId, state);
      const selectedProjects = state.query.projects || [];

      if (projectIsSelected) {
        selectedProjects.splice(selectedProjects.indexOf(projectId), 1);
      } else {
        state.query.projects = selectedProjects.concat(projectId);
      }
      return { query: state.query };
    });
  }

  handleTagClick(tag) {
    const that = this;
    this.setState((prevState, props) => {
      const state = Object.assign({}, prevState);
      const tagIsSelected = that.tagIsSelected(tag, state);
      const selectedTags = state.query.tags || [];

      if (tagIsSelected) {
        selectedTags.splice(selectedTags.indexOf(tag), 1); // remove from array
      } else {
        state.query.tags = selectedTags.concat(tag);
      }
      return { query: state.query };
    });
  }

  handleSortClick(sortParam) {
    this.setState((prevState, props) => {
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

  // Create title out of query parameters
  // To understand this code:
  // - http://stackoverflow.com/a/10865042/209184 for `[].concat.apply`
  // - http://stackoverflow.com/a/19888749/209184 for `filter(Boolean)`
  title(statuses, projects) {
    const query = this.state.query;
    return [].concat.apply([], [
      query.projects ? query.projects.map((p) => {
        const project = projects.find(pr => pr.node.dbid == p);
        return project ? project.node.title : '';
      }) : [],
      query.status ? query.status.map((s) => {
        const status = statuses.find(so => so.id == s);
        return status ? status.label : '';
      }) : [],
      query.keyword,
      query.tags,
    ].filter(Boolean)).join(' ').trim() || this.props.intl.formatMessage(messages.title);
  }

  showField(field) {
    if (!this.props.fields) {
      return true;
    }
    else {
      return this.props.fields.indexOf(field) > -1;
    }
  }

  render() {
    const statuses = JSON.parse(this.props.team.media_verification_statuses).statuses;
    const projects = this.props.team.projects.edges.sortp((a, b) => a.node.title.localeCompare(b.node.title));
    const suggestedTags = this.props.team.get_suggested_tags ? this.props.team.get_suggested_tags.split(',') : [];
    const title = this.title(statuses, projects);

    return (
      <DocumentTitle title={this.props.title || pageTitle(title, false, this.props.team)}>
        <ContentColumn>
          <div className="search__query">

            {/* Keyword */}
            { this.showField('keyword') ?
            <form id="search-form" className="search__form" onSubmit={this.handleSubmit.bind(this)}>
              <input placeholder={this.props.intl.formatMessage(messages.searchInputHint)} name="search-input" id="search-input" className="search__input" defaultValue={this.state.query.keyword || ''} ref={input => this.searchQueryInput = input} />
            </form> : null }

            <section className="search__filters / filters">
              <h3 className="search__filters-heading">{ this.props.project ? null : <FormattedMessage id="search.filtersHeading" defaultMessage="Filters" /> }</h3>

              {/* Status */}
              { this.showField('status') ?
              <div>
                <h4><FormattedMessage id="search.statusHeading" defaultMessage="Status" /></h4>
                {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
                <ul className="/ media-tags__suggestions-list // electionland_categories">
                  {statuses.map(status =>
                    <li title={status.description} onClick={this.handleStatusClick.bind(this, status.id)} className={bemClass('media-tags__suggestion', this.statusIsSelected(status.id), '--selected')} style={{ backgroundColor: getStatusStyle(status, 'backgroundColor') }} >{status.label}</li>)}
                </ul>
              </div> : null }

              {/* Project */}
              { this.showField('project') ?
              <div>
                <h4><FormattedMessage id="search.projectHeading" defaultMessage="Project" /></h4>
                {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
                <ul className="/ media-tags__suggestions-list // electionland_categories">
                  {projects.map(project => <li title={project.node.description} onClick={this.handleProjectClick.bind(this, project.node.dbid)} className={bemClass('media-tags__suggestion', this.projectIsSelected(project.node.dbid), '--selected')}>{project.node.title}</li>)}
                </ul>
              </div> : null }

              {/* Tags */}
              { this.showField('tags') && suggestedTags.length ? (
                <div>
                  <h4><FormattedMessage id="status.categoriesHeading" defaultMessage="Categories" /></h4>
                  <ul className="/ media-tags__suggestions-list // electionland_categories">
                    {suggestedTags.map(tag => <li title={null} onClick={this.handleTagClick.bind(this, tag)} className={bemClass('media-tags__suggestion', this.tagIsSelected(tag), '--selected')}>{tag}</li>)}
                  </ul>
                </div>
              ) : null }

              {/* Sort */}
              { this.showField('sort') ?
              <div>
                <h4><FormattedMessage id="search.sort" defaultMessage="Sort" /></h4>
                {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
                <ul className="search-query__sort-actions / media-tags__suggestions-list">
                  <li onClick={this.handleSortClick.bind(this, 'recent_added')} className={bemClass('media-tags__suggestion', this.sortIsSelected('recent_added'), '--selected')}>
                    <FormattedMessage id="search.sortByCreated" defaultMessage="Created" />
                  </li>
                  <li onClick={this.handleSortClick.bind(this, 'recent_activity')} className={bemClass('media-tags__suggestion', this.sortIsSelected('recent_activity'), '--selected')}>
                    <FormattedMessage id="search.sortByRecentActivity" defaultMessage="Recent activity" />
                  </li>
                  <li onClick={this.handleSortClick.bind(this, 'DESC')} className={bemClass('media-tags__suggestion', this.sortIsSelected('DESC'), '--selected')}>
                    <FormattedMessage id="search.sortByNewest" defaultMessage="Newest first" />
                  </li>
                  <li onClick={this.handleSortClick.bind(this, 'ASC')} className={bemClass('media-tags__suggestion', this.sortIsSelected('ASC'), '--selected')}>
                    <FormattedMessage id="search.sortByOldest" defaultMessage="Oldest first" />
                  </li>
                </ul>
              </div> : null }

            </section>
          </div>
        </ContentColumn>
      </DocumentTitle>
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
  loadMore() {
    this.props.relay.setVariables({ pageSize: this.props.search.medias.edges.length + pageSize });
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
    if (pusher && this.props.search.pusher_channel) {
      const that = this;
      pusher.subscribe(this.props.search.pusher_channel).bind('media_updated', (data) => {
        that.props.relay.forceFetch();
      });
    }
  }

  unsubscribe() {
    const pusher = this.getContext().pusher;
    if (pusher && this.props.search.pusher_channel) {
      pusher.unsubscribe(this.props.search.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    this.subscribe();
  }

  render() {
    const medias = this.props.search ? this.props.search.medias.edges : [];
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const mediasCount = `${count} ${count === 1 ? this.props.intl.formatMessage(messages.searchResult) : this.props.intl.formatMessage(messages.searchResults)}`;
    const title = /\/project\//.test(window.location.pathname) ? '' : mediasCount;
    const that = this;

    return (
      <div className="search__results / results">
        <h3 className="search__results-heading">{title}</h3>
        {/* <h4>Most recent activity first</h4> */}

        <InfiniteScroll hasMore loadMore={this.loadMore.bind(this)} threshold={500}>

          <ul className="search__results-list / results medias-list">
            {medias.map(media => (
              <li className="/ medias__item">
                <MediaDetail media={media.node} condensed parentComponent={that} />
              </li>
            ))}
          </ul>

        </InfiniteScroll>

        {(() => {
          if (medias.length < count) {
            return (<p className="search__results-loader"><FormattedMessage id="search.loading" defaultMessage="Loading..." /></p>);
          }
        })()}
      </div>
    );
  }
}

SearchResultsComponent.contextTypes = {
  store: React.PropTypes.object,
};

SearchResultsComponent.propTypes = {
  intl: intlShape.isRequired,
};

const SearchResultsContainer = Relay.createContainer(injectIntl(SearchResultsComponent), {
  initialVariables: {
    pageSize,
  },
  fragments: {
    search: () => Relay.QL`
      fragment on CheckSearch {
        id,
        pusher_channel,
        medias(first: $pageSize) {
          edges {
            node {
              id,
              dbid,
              url,
              quote,
              published,
              embed,
              annotations_count,
              verification_statuses,
              overridden,
              project_id,
              pusher_channel,
              language,
              domain,
              permissions,
              last_status,
              last_status_obj {
                id,
                dbid
              }
              project {
                id,
                dbid,
                title
              },
              media {
                url,
                quote,
                embed_path,
                thumbnail_path
              }
              user {
                name,
                source {
                  dbid
                }
              }
              team {
                slug
              }
              tags(first: 10000) {
                edges {
                  node {
                    tag,
                    id
                  }
                }
              }
            }
          }
        },
        number_of_results
      }
    `,
  },
});

class Search extends Component {
  noFilters(query) {
    delete query.timestamp;
    delete query.parent;
    if (query.projects && (query.projects.length === 0 || (query.projects.length === 1 && query.projects[0] === this.props.project.dbid))) {
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

    let query = searchQueryFromUrlQuery(searchQuery);
    if (!this.noFilters(query)) {
      query.timestamp = new Date().getTime();
    }
    if (this.props.project) {
      query.parent = { type: 'project', id: this.props.project.dbid };
      query.projects = [this.props.project.dbid];
    }
    else {
      query.parent = { type: 'team', slug: teamSlug };
    }

    const queryRoute = new TeamRoute({ teamSlug });
    const resultsRoute = new SearchRoute({ query: JSON.stringify(query) });
    const { formatMessage } = this.props.intl;

    return (
      <div className="search">
        <Relay.RootContainer
          Component={SearchQueryContainer}
          route={queryRoute}
          renderFetched={data => <SearchQueryContainer {...this.props} {...data} />}
          renderLoading={function () {
            return (
              <ContentColumn>
                <div className="search__query">
                  <div className="search__form search__form--loading">
                    <input disabled placeholder={formatMessage(messages.loading)} name="search-input" id="search-input" className="search__input" />
                  </div>
                </div>
              </ContentColumn>
            );
          }}
        />
        <Relay.RootContainer
          Component={SearchResultsContainer}
          route={resultsRoute}
          renderLoading={function () {
            return (
              <div>
                <h3 className="search__results-heading search__results-heading--loading"><FormattedMessage id="search.loading" defaultMessage="Loading..." /></h3>
                <MediasLoading />
              </div>
            );
          }}
        />
      </div>
    );
  }
}

Search.propTypes = {
  intl: intlShape.isRequired,
};

export function searchQueryFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(search|project\/[0-9]+)\/(.*)/);
  return queryString ? searchQueryFromUrlQuery(queryString[2]) : {};
}

export function searchQueryFromUrlQuery(urlQuery) {
  try {
    return JSON.parse(decodeURIComponent(urlQuery));
  } catch (e) {
    return {};
  }
}

export default injectIntl(Search);
