import React from 'react';
import { FormattedMessage } from 'react-intl';
import isEqual from 'lodash.isequal';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import SearchResults from './SearchResults';
import { safelyParseJSON } from '../../helpers';
import { ContentColumn, display1 } from '../../styles/js/shared';

const statusKey = config.appName === 'bridge' ? 'translation_status' : 'verification_status';

export function searchQueryFromUrlQuery(urlQuery) {
  return safelyParseJSON(decodeURIComponent(urlQuery), {});
}

export function searchQueryFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(search|trash|project\/[0-9]+)(?:\/[a-z]+)?\/(.*)/);
  return queryString ? searchQueryFromUrlQuery(queryString[2]) : {};
}

export function searchPrefixFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(search|trash|project\/[0-9]+)/);
  return queryString ? queryString[0] : null;
}

export function urlFromSearchQuery(query, path, shouldBeQueryString) {
  const connector = shouldBeQueryString ? '?query=' : '/';
  const prefix = path || searchPrefixFromUrl();
  return isEqual(query, {}) ? prefix : `${prefix}${connector}${encodeURIComponent(JSON.stringify(query))}`;
}

export function noFilters(query_, project) {
  const query = query_;
  delete query.timestamp;
  delete query.parent;
  if (
    query.projects &&
    (query.projects.length === 0 ||
      (project &&
        query.projects.length === 1 &&
        query.projects[0] === project.dbid))
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

class Search extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  noFilters(query_) {
    return noFilters(query_, this.props.project);
  }

  render() {
    const searchQuery = this.props.query || this.props.params.query;
    const teamSlug = this.props.team || this.props.params.team;
    const view = this.props.view || this.props.route.view || window.storage.getValue('view-mode') || 'list';
    window.storage.set('view-mode', view);

    const query = searchQueryFromUrlQuery(searchQuery);
    if (!this.noFilters(query) && Object.keys(query).join('') !== 'archived') {
      query.timestamp = new Date().getTime();
    }
    if (this.props.project) {
      query.parent = { type: 'project', id: this.props.project.dbid };
      query.projects = [this.props.project.dbid];
    } else {
      query.parent = { type: 'team', slug: teamSlug };
    }

    let title = null;
    if (/^\/.*\/search(\/)?.*/.test(window.location.pathname)) {
      title = <FormattedMessage id="search.allClamimsTitle" defaultMessage="All claims" />;
    }
    if (this.props.page === 'trash') {
      title = this.props.title; // eslint-disable-line prefer-destructuring
    }

    return (
      <div className="search">
        { title ?
          <ContentColumn wide={view === 'dense'}>
            <div style={{ font: display1 }} className="search__title">
              {title}
            </div>
          </ContentColumn> : null
        }
        <SearchResults {...this.props} view={view} query={query} />
      </div>
    );
  }
}

export default Search;
