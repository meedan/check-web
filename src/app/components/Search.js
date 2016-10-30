import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';
import SearchRoute from '../relay/SearchRoute';
import Medias from './media/Medias';

class SearchComponent extends Component {
  handleSubmit(e) {
    e.preventDefault();
    const value = document.getElementById('search-input').value;
    const query = JSON.stringify({ keyword: value });
    // http://stackoverflow.com/questions/33415517/passing-arguments-to-top-level-fields-from-within-a-relay-container
    Checkdesk.history.push('/search/' + query);
  }

  render() {
    const medias = this.props.search ? this.props.search.medias.edges : [];

    return (
      <div className="search">
        <form id="search-form" className="search__form" onSubmit={this.handleSubmit.bind(this)}>
          <TextField hintText="Enter a keyword to search" fullWidth={true} name="keyword" id="search-input" className="search__input" />
        </form>
        <Medias medias={medias} />
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
    const query = this.props.params.query;
    if (query) {
      const route = new SearchRoute({ query: query });
      return (<Relay.RootContainer Component={SearchContainer} route={route} />);
    }
    else {
      return (<SearchComponent />);
    }
  }
}

export default Search;
