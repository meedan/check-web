import React from 'react';
import PropTypes from 'prop-types';
import SearchResults from './SearchResults';
import { safelyParseJSON } from '../../helpers';

function searchQueryFromUrlQuery(urlQuery) {
  return safelyParseJSON(decodeURIComponent(urlQuery), {});
}

export function searchQueryFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(all-items|trash)(?:\/[a-z]+)?\/(.*)/);
  return queryString ? searchQueryFromUrlQuery(queryString[2]) : {};
}

function searchPrefixFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(all-items|trash)/);
  return queryString ? queryString[0] : null;
}

export function urlFromSearchQuery(query, path) {
  const prefix = path || searchPrefixFromUrl();
  return Object.keys(query).length === 0 ? prefix : `${prefix}/${encodeURIComponent(JSON.stringify(query))}`;
}

function noFilters(query_) {
  const query = { ...query_ };
  delete query.timestamp;
  if (Object.keys(query).indexOf('archived') > -1) {
    delete query.archived;
    delete query.parent;
  }
  if (/\/(tipline-inbox|imported-fact-checks)+/.test(window.location.pathname)) {
    delete query.channels;
  }
  if (/\/(suggested-matches)+/.test(window.location.pathname)) {
    delete query.suggestions_count;
  }
  if (query.verification_status && query.verification_status.length === 0) {
    delete query.verification_status;
  }
  if (query.sort && query.sort === 'recent_activity') {
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

export default function Search({
  defaultQuery,
  extra,
  feed,
  feedTeam,
  hideFields,
  icon,
  listActions,
  listSubtitle,
  mediaUrlPrefix,
  page,
  query,
  readOnlyFields,
  resultType,
  savedSearch,
  searchUrlPrefix,
  showExpand,
  teamSlug,
  title,
}) {
  let timestampedQuery = query;
  if (!noFilters(query)) {
    timestampedQuery = { ...query, timestamp: new Date().getTime() };
  }

  return (
    <SearchResults
      defaultQuery={defaultQuery}
      extra={extra}
      feed={feed}
      feedTeam={feedTeam}
      hideFields={hideFields}
      icon={icon}
      listActions={listActions}
      listSubtitle={listSubtitle}
      mediaUrlPrefix={mediaUrlPrefix}
      page={page}
      query={timestampedQuery}
      readOnlyFields={readOnlyFields}
      resultType={resultType}
      savedSearch={savedSearch}
      searchUrlPrefix={searchUrlPrefix}
      showExpand={showExpand}
      teamSlug={teamSlug}
      title={title}
    />
  );
}

Search.defaultProps = {
  extra: null,
  feed: null,
  feedTeam: null,
  hideFields: [],
  icon: null,
  listActions: undefined,
  listSubtitle: null,
  readOnlyFields: [],
  resultType: 'default',
  savedSearch: null,
  showExpand: true,
};

Search.propTypes = {
  defaultQuery: PropTypes.object.isRequired, // may be empty
  extra: PropTypes.oneOfType([PropTypes.node, PropTypes.func]), // or null
  feed: PropTypes.object, // or null
  feedTeam: PropTypes.object, // or null
  hideFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  icon: PropTypes.node,
  listActions: PropTypes.node, // or undefined
  listSubtitle: PropTypes.object,
  mediaUrlPrefix: PropTypes.string.isRequired,
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'published', 'list', 'feed', 'spam', 'trash', 'assigned-to-me']).isRequired, // FIXME Define listing types as a global constant
  query: PropTypes.object.isRequired, // may be empty
  readOnlyFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  resultType: PropTypes.string, // 'default' or 'feed', for now
  savedSearch: PropTypes.object, // or null
  searchUrlPrefix: PropTypes.string.isRequired,
  showExpand: PropTypes.bool,
  teamSlug: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
};
