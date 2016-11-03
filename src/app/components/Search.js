import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';
import SearchRoute from '../relay/SearchRoute';
import TeamRoute from '../relay/TeamRoute';
import MediaCard from './media/MediaCard';
import { bemClass } from '../helpers';
import teamFragment from '../relay/teamFragment';
import suggestedTagsData from '../../../data/suggestedTags';

class SearchQueryComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: {}
    }
  }

  setQueryFromUrl() {
    var query;
    try {
      query = queryFromUrlQuery(window.location.pathname.match(/^\/search\/(.*)/)[1]);
    } catch (e) {
      query = queryFromUrlQuery();
    }
    this.setState({query: query});
  }

  componentWillMount() {
    this.setQueryFromUrl();
  }

  componentWillUpdate(nextProps, nextState) {
    this.setQueryFromUrl();
  }

  handleSubmit(e) {
    e.preventDefault();
    const keywordInput = document.getElementById('search-input').value;

    this.setState((prevState, props) => {
      prevState.query.keyword = keywordInput;
      return {query: prevState.query};
    })
  }

  urlQueryFromQuery(queryObject) {
    const newQuery = JSON.parse(JSON.stringify(queryObject));

    if (newQuery.tags) {
      newQuery.tags = newQuery.tags.map((tag) => { return encodeURIComponent(tag) });
    }
    if (newQuery.status) {
      newQuery.status = newQuery.status.map((status) => { return encodeURIComponent(status) });
    }

    const jsonQuery = JSON.stringify(newQuery);
    return jsonQuery.substring(1, jsonQuery.length - 1) // strip %7D %7B for readability
  }

  componentDidUpdate(prevProps, prevState) {
    const urlQuery = this.urlQueryFromQuery(prevState.query);
    Checkdesk.history.push('/search/' + urlQuery);
  }

  statusIsSelected(statusCode, state = this.state) {
    const selectedStatuses = state.query.status || [];
    return selectedStatuses.length && selectedStatuses.includes(statusCode);
  }
  }

  tagIsSelected(tag, state = this.state) {
    const selectedTags = state.query.tags || [];
    return selectedTags.length && selectedTags.includes(tag)
  }

  handleStatusClick(statusCode) {
    this.setState((prevState, props) => {
      const statusIsSelected = this.statusIsSelected(statusCode, prevState);
      const selectedStatuses = prevState.query.status || []; // TODO: avoid ambiguous reference

      if (statusIsSelected) {
        selectedStatuses.splice(selectedStatuses.indexOf(statusCode), 1); // remove from array
      }
      else {
        prevState.query.status = selectedStatuses.concat(statusCode);
      }
      return {query: prevState.query};
    })
  }

  handleTagClick(tag) {
    const that = this;
    this.setState((prevState, props) => {
      const tagIsSelected = that.tagIsSelected(tag, prevState);
      const selectedTags = prevState.query.tags || [];

      if (tagIsSelected) {
        selectedTags.splice(selectedTags.indexOf(tag), 1); // remove from array
      }
      else {
        prevState.query.tags = selectedTags.concat(tag);
      }
      return {query: prevState.query};
    })
  }

  render() {
    var mediaStatuses;
    try {
      mediaStatuses = JSON.parse(this.props.team.media_verification_statuses).statuses;
    } catch (e) {
      mediaStatuses = [];
    }
    const suggestedTags = suggestedTagsData[window.location.hostname.split('.')[0]] || [];

    return (
      <div className="search__query">
        <form id="search-form" className="search__form" onSubmit={this.handleSubmit.bind(this)}>
          <input placeholder="Search" name="search-input" id="search-input" className="search__input" defaultValue={this.state.query.keyword || ''}/>
        </form>

        <section className='search__filters / filters'>
          <h3 className="search__filters-heading">Filters</h3>
          <div>
            <h4>Status</h4>
            {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
            <ul className="/ media-tags__suggestions-list // electionland_categories">
              {mediaStatuses.map((status) => { // TODO: set and use styles in `status.style`
                return <li title={status.description} onClick={this.handleStatusClick.bind(this, status.id)} className={bemClass('media-tags__suggestion', this.statusIsSelected(status.id), '--selected')}>{status.label}</li>;
              })}
            </ul>
          </div>
          <div>
            {suggestedTags.length ? <h4>Electionland</h4> : null}
            {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
            {suggestedTags.length ? <ul className="/ media-tags__suggestions-list // electionland_categories">
                {suggestedTags.map((tag) => {
                  return <li title={null} onClick={this.handleTagClick.bind(this, tag)} className={bemClass('media-tags__suggestion', this.tagIsSelected(tag), '--selected')}>{tag}</li>;
                })}
              </ul>
            : null}
          </div>
        </section>
      </div>
    );
  }
}

const SearchQueryContainer = Relay.createContainer(SearchQueryComponent, {
  fragments: {
    team: () => teamFragment
  }
});

class SearchResultsComponent extends Component {
  render() {
    const medias = this.props.search ? this.props.search.medias.edges : [];

    return (
      <div className="search__results / results">
        <h3 className='search__results-heading'>{medias.length} Results</h3>
        {/* <h4>Most recent activity first <i className="media-status__icon media-status__icon--caret fa fa-caret-down"></i></h4> */}
        <ul className="search__results-list / results medias-list">
        {medias.map(function(node) {
          const media = node.node;

          return (
            <li className="/ medias__item">
              <MediaCard media={media} />
            </li>
          );
        })}
        </ul>
      </div>
    );
  }
}

const SearchResultsContainer = Relay.createContainer(SearchResultsComponent, {
  fragments: {
    search: () => Relay.QL`
      fragment on CheckSearch {
        medias(first: 10000) {
          edges {
            node {
              id,
              dbid,
              url,
              published,
              jsondata,
              annotations_count,
              domain,
              last_status,
              permissions,
              verification_statuses
            }
          }
        }
      }
    `
  }
});

class Search extends Component {
  render() {
    const query = queryFromUrlQuery(this.props.params.query);

    const queryRoute = new TeamRoute({ teamId: '' });
    const resultsRoute = new SearchRoute({ query: JSON.stringify(query) });

    return (
      <div className='search'>
        <Relay.RootContainer Component={SearchQueryContainer} route={queryRoute} />
        <Relay.RootContainer Component={SearchResultsContainer} route={resultsRoute} />
      </div>
    )
  }
}

function queryFromUrlQuery(urlQuery) {
  try {
    return JSON.parse('{' + decodeURIComponent(urlQuery || '') + '}');
  } catch (e) {
    return {};
  }
}

export default Search;
