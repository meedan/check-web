import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import isEqual from 'lodash.isequal';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import SearchResultsContainer from './SearchResults';
import { safelyParseJSON } from '../../helpers';
import SearchRoute from '../../relay/SearchRoute';
import MediasLoading from '../media/MediasLoading';

const statusKey = config.appName === 'bridge' ? 'translation_status' : 'verification_status';

export function searchQueryFromUrlQuery(urlQuery) {
  return safelyParseJSON(decodeURIComponent(urlQuery), {});
}

export function searchQueryFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(search|project\/[0-9]+(?:\/[a-z]+)?)\/(.*)/);
  return queryString ? searchQueryFromUrlQuery(queryString[2]) : {};
}

export function urlFromSearchQuery(query, prefix) {
  return isEqual(query, {}) ? prefix : `${prefix}/${encodeURIComponent(JSON.stringify(query))}`;
}

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

    const resultsRoute = new SearchRoute({ query: JSON.stringify(query) });

    return (
      <div className="search">
        {/* <SearchQuery teamSlug={teamSlug} {...this.props} /> */}
        <Relay.RootContainer
          Component={SearchResultsContainer}
          route={resultsRoute}
          renderFetched={data => <SearchResultsContainer {...this.props} {...data} />}
          renderLoading={() => <MediasLoading />}
        />
      </div>
    );
  }
}

export default Search;
