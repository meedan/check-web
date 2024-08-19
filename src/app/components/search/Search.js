/* eslint-disable react/sort-prop-types */
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
  if (/\/(unmatched-media)+/.test(window.location.pathname)) {
    delete query.unmatched;
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
  feedTeam: null,
  feed: null,
  savedSearch: null,
  hideFields: [],
  readOnlyFields: [],
  listActions: undefined,
  showExpand: true,
  resultType: 'default',
  icon: null,
  extra: null,
  listSubtitle: null,
};

Search.propTypes = {
  searchUrlPrefix: PropTypes.string.isRequired,
  mediaUrlPrefix: PropTypes.string.isRequired,
  listActions: PropTypes.node, // or undefined
  feedTeam: PropTypes.object, // or null
  feed: PropTypes.object, // or null
  savedSearch: PropTypes.object, // or null
  listSubtitle: PropTypes.object,
  teamSlug: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  icon: PropTypes.node,
  hideFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  readOnlyFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash', 'assigned-to-me']).isRequired, // FIXME Define listing types as a global constant
  query: PropTypes.object.isRequired, // may be empty
  defaultQuery: PropTypes.object.isRequired, // may be empty
  showExpand: PropTypes.bool,
  resultType: PropTypes.string, // 'default' or 'feed', for now
  extra: PropTypes.oneOfType([PropTypes.node, PropTypes.func]), // or null
};
