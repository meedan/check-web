import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';
import SearchRoute from '../relay/SearchRoute';
import MediaCard from './media/MediaCard';
import { bemClass } from '../helpers';

class SearchComponent extends Component {
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

  componentDidUpdate(prevProps, prevState) {
    const jsonQuery = JSON.stringify(prevState.query);
    const urlQuery = jsonQuery.substring(1, jsonQuery.length - 1) // strip %7D %7B for readability
    Checkdesk.history.push('/search/' + urlQuery);
  }

  statusIsSelected(statusCode, state = this.state) {
    const selectedStatuses = state.query.status || []; // TODO: avoid ambiguous reference
    return selectedStatuses.length ? selectedStatuses.includes(statusCode) : false;
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

  render() {
    const medias = this.props.search ? this.props.search.medias.edges : [];
    const mediaStatuses = [ // TODO: get team-specific statuses
      {code: 'unstarted', label: 'Unstarted'},
      {code: 'verified', label: 'Verified'},
      {code: 'in_progress', label: 'In Progress'},
      {code: 'false', label: 'False'}
    ];

    return (
      <div className="search">
        <form id="search-form" className="search__form" onSubmit={this.handleSubmit.bind(this)}>
          <input placeholder="Search" name="search-input" id="search-input" className="search__input" defaultValue={this.state.query.keyword || ''}/>
        </form>

        <section className='search__filters / filters'>
          <h3 className="search__filters-heading">Filters</h3>
          <div>
            <h4>Status</h4>
            {/* chicklet markup/logic from MediaTags. TODO: fix classnames */}
            <ul className="/ media-tags__suggestions-list // electionland_categories">
              {mediaStatuses.map((status) => {
                return <li onClick={this.handleStatusClick.bind(this, status.code)} className={bemClass('media-tags__suggestion', this.statusIsSelected(status.code), '--selected')}>{status.label}</li>;
              })}
            </ul>
          </div>
        </section>

        <div className="search__results / results">
          <h3 className='search__results-heading'>{medias.length} Results</h3>
          <h4>Most recent activity first <i className="media-status__icon media-status__icon--caret fa fa-caret-down"></i></h4>
          <ul className="search__results-list / results medias-list">
          {medias.map(function(node) {
            const media = node.node;

            const annotated = null;
            const annotatedType = null;

            return (
              <li className="medias__item">
                <MediaCard media={media} annotated={annotated} annotatedType={annotatedType} />
              </li>
            );
          })}
          </ul>
        </div>
      </div>
    );
  }
}

const SearchContainer = Relay.createContainer(SearchComponent, {
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
    const urlQuery = this.props.params.query;
    const query = queryFromUrlQuery(urlQuery);
    if (query) {
      const route = new SearchRoute({ query: JSON.stringify(query) });
      return (<Relay.RootContainer Component={SearchContainer} route={route} />);
    }
    else {
      return (<SearchComponent />);
    }
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
