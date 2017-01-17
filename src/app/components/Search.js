import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import numerous from 'numerous';
import InfiniteScroll from 'react-infinite-scroller';
import SearchRoute from '../relay/SearchRoute';
import TeamRoute from '../relay/TeamRoute';
import MediaDetail from './media/MediaDetail';
import { bemClass } from '../helpers';
import { pageTitle } from '../helpers';
import CheckContext from '../CheckContext';
import ContentColumn from './layout/ContentColumn';

const pageSize = 20;

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
    if (context.getContextStore().project) {
      context.setContextStore({ project: null });
    }

    const queryString = window.location.pathname.match(/^\/search\/(.*)/);
    const query = queryString === null ? {} : queryFromUrlQuery(queryString[1]);

    if (JSON.stringify(this.state.query) === '{}') {
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
    this.searchQueryInput.focus();
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
    const url = `/search/${this.urlQueryFromQuery(prevState.query)}`;
    if (url != window.location.pathname) {
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
    ].filter(Boolean)).join(' ').trim() || 'Search';
  }

  render() {
    const statuses = JSON.parse(this.props.team.media_verification_statuses).statuses;
    const projects = this.props.team.projects.edges.sortp((a, b) => a.node.title.localeCompare(b.node.title));
    const suggestedTags = this.props.team.get_suggested_tags ? this.props.team.get_suggested_tags.split(',') : [];
    const title = this.title(statuses, projects);

    return (
      <DocumentTitle title={pageTitle(title, false, this.props.team)}>
        <ContentColumn>
          <div className="search__query">
            <form id="search-form" className="search__form" onSubmit={this.handleSubmit.bind(this)}>
              <input placeholder="Search" name="search-input" id="search-input" className="search__input" defaultValue={this.state.query.keyword || ''} ref={input => this.searchQueryInput = input} />
            </form>

            <section className="search__filters / filters">
              <h3 className="search__filters-heading">Filters</h3>
              <div>
                <h4>Status</h4>
                {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
                <ul className="/ media-tags__suggestions-list // electionland_categories">
                  {statuses.map(status =>  // TODO: set and use styles in `status.style`
                    <li title={status.description} onClick={this.handleStatusClick.bind(this, status.id)} className={bemClass('media-tags__suggestion', this.statusIsSelected(status.id), '--selected')}>{status.label}</li>)}
                </ul>
              </div>
              <div>
                <h4>Project</h4>
                {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
                <ul className="/ media-tags__suggestions-list // electionland_categories">
                  {projects.map(project => <li title={project.node.description} onClick={this.handleProjectClick.bind(this, project.node.dbid)} className={bemClass('media-tags__suggestion', this.projectIsSelected(project.node.dbid), '--selected')}>{project.node.title}</li>)}
                </ul>
              </div>
              {suggestedTags.length ? (
                <div>
                  <h4>Categories</h4>
                  <ul className="/ media-tags__suggestions-list // electionland_categories">
                    {suggestedTags.map(tag => <li title={null} onClick={this.handleTagClick.bind(this, tag)} className={bemClass('media-tags__suggestion', this.tagIsSelected(tag), '--selected')}>{tag}</li>)}
                  </ul>
                </div>
              ) : null }
              <div>
                <h4>Sort</h4>
                {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
                <ul className="search-query__sort-actions / media-tags__suggestions-list">
                  <li onClick={this.handleSortClick.bind(this, 'recent_added')} className={bemClass('media-tags__suggestion', this.sortIsSelected('recent_added'), '--selected')}>Created</li>
                  <li onClick={this.handleSortClick.bind(this, 'recent_activity')} className={bemClass('media-tags__suggestion', this.sortIsSelected('recent_activity'), '--selected')}>Recent activity</li>
                  <li onClick={this.handleSortClick.bind(this, 'DESC')} className={bemClass('media-tags__suggestion', this.sortIsSelected('DESC'), '--selected')}>Newest first</li>
                  <li onClick={this.handleSortClick.bind(this, 'ASC')} className={bemClass('media-tags__suggestion', this.sortIsSelected('ASC'), '--selected')}>Oldest first</li>
                </ul>
              </div>
            </section>
          </div>
        </ContentColumn>
      </DocumentTitle>
    );
  }
}

SearchQueryComponent.contextTypes = {
  store: React.PropTypes.object,
};

const SearchQueryContainer = Relay.createContainer(SearchQueryComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        media_verification_statuses,
        get_suggested_tags,
        name,
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

  render() {
    const medias = this.props.search ? this.props.search.medias.edges : [];
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const mediasCount = `${count} ${numerous.pluralize('en', count, {
      one: 'Result',
      other: 'Results',
    })}`;

    return (
      <div className="search__results / results">
        <h3 className="search__results-heading">{mediasCount}</h3>
        {/* <h4>Most recent activity first <i className="media-status__icon media-status__icon--caret fa fa-caret-down"></i></h4> */}

        <InfiniteScroll hasMore loadMore={this.loadMore.bind(this)} threshold={500}>

          <ul className="search__results-list / results medias-list">
            {medias.map(media => (
              <li className="/ medias__item">
                <MediaDetail media={media.node} condensed />
              </li>
            ))}
          </ul>

        </InfiniteScroll>

        {(() => {
          if (medias.length < count) {
            return (<p className="search__results-loader">Loading...</p>);
          }
        })()}
      </div>
    );
  }
}

const SearchResultsContainer = Relay.createContainer(SearchResultsComponent, {
  initialVariables: {
    pageSize,
  },
  fragments: {
    search: () => Relay.QL`
      fragment on CheckSearch {
        id,
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
              domain,
              last_status,
              permissions,
              verification_statuses,
              project_id,
              media {
                url
                quote
              }
              user {
                name,
                source {
                  dbid
                }
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
  render() {
    const query = queryFromUrlQuery(this.props.params.query);

    const queryRoute = new TeamRoute({ teamId: '' });
    const resultsRoute = new SearchRoute({ query: JSON.stringify(query) });

    return (
      <div className="search">
        <Relay.RootContainer
          Component={SearchQueryContainer}
          route={queryRoute}
          renderLoading={function() {
            return (
              <ContentColumn>
                <div className="search__query">
                  <div className="search__form search__form--loading">
                    <input disabled placeholder="Loading..." name="search-input" id="search-input" className="search__input"/>
                  </div>
                </div>
              </ContentColumn>
            );
          }}
        />
        <Relay.RootContainer
          Component={SearchResultsContainer}
          route={resultsRoute}
          renderLoading={function() {
            return (
              <div className="search__results search__results--loading">
                <ContentColumn>
                  <h3 className="search__results-heading">Loading...</h3>
                  <div className="/ content">
                    <div className="/ report">
                      <div></div><div></div><div></div><div></div>
                    </div>
                    <div className="/ report">
                      <div></div><div></div><div></div><div></div>
                    </div>
                    <div className="/ report">
                      <div></div><div></div><div></div><div></div>
                    </div>
                  </div>
                </ContentColumn>
              </div>
            );
          }}
        />
      </div>
    );
  }
}

function queryFromUrlQuery(urlQuery) {
  try {
    return JSON.parse(decodeURIComponent(urlQuery));
  } catch (e) {
    return {};
  }
}

export default Search;
