import React from 'react';
import PropTypes from 'prop-types';
import SearchResults from './SearchResults';
import { safelyParseJSON } from '../../helpers';

function searchQueryFromUrlQuery(urlQuery) {
  return safelyParseJSON(decodeURIComponent(urlQuery), {});
}

export function searchQueryFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(all-items|trash|project\/[0-9]+)(?:\/[a-z]+)?\/(.*)/);
  return queryString ? searchQueryFromUrlQuery(queryString[2]) : {};
}

function searchPrefixFromUrl() {
  const queryString = window.location.pathname.match(/.*\/(all-items|trash|project\/[0-9]+)/);
  return queryString ? queryString[0] : null;
}

export function urlFromSearchQuery(query, path) {
  const prefix = path || searchPrefixFromUrl();
  return Object.keys(query).length === 0 ? prefix : `${prefix}/${encodeURIComponent(JSON.stringify(query))}`;
}

function noFilters(query_, project, projectGroup) {
  const query = { ...query_ };
  delete query.timestamp;
  if (Object.keys(query).indexOf('archived') > -1) {
    delete query.archived;
    delete query.parent;
  }
  if (
    query.projects &&
    (query.projects.length === 0 ||
      (project &&
        query.projects.length === 1 &&
        query.projects[0] === project.dbid))
  ) {
    delete query.projects;
  }
  if (
    query.project_group_id &&
    (query.project_group_id.length === 0 ||
      (projectGroup &&
        query.project_group_id.length === 1 &&
        query.project_group_id[0] === projectGroup.dbid))
  ) {
    delete query.project_group_id;
  }
  if (/\/(tipline-inbox|imported-reports)+/.test(window.location.pathname)) {
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
  hideFields,
  readOnlyFields,
  listActions,
  listDescription,
  mediaUrlPrefix,
  page,
  teamSlug,
  project,
  projectGroup,
  feedTeam,
  savedSearch,
  query,
  searchUrlPrefix,
  title,
  icon,
  showExpand,
  resultType,
  extra,
}) {
  let timestampedQuery = query;
  if (!noFilters(query, project, projectGroup)) {
    timestampedQuery = { ...query, timestamp: new Date().getTime() };
  }

  return (
    <SearchResults
      searchUrlPrefix={searchUrlPrefix}
      mediaUrlPrefix={mediaUrlPrefix}
      teamSlug={teamSlug}
      project={project}
      projectGroup={projectGroup}
      feedTeam={feedTeam}
      savedSearch={savedSearch}
      listActions={listActions}
      listDescription={listDescription}
      page={page}
      hideFields={hideFields}
      readOnlyFields={readOnlyFields}
      title={title}
      icon={icon}
      query={timestampedQuery}
      showExpand={showExpand}
      resultType={resultType}
      extra={extra}
    />
  );
}
Search.defaultProps = {
  project: null,
  projectGroup: null,
  feedTeam: null,
  savedSearch: null,
  page: undefined, // FIXME find a cleaner way to render Trash differently
  hideFields: [],
  readOnlyFields: [],
  listDescription: undefined,
  listActions: undefined,
  showExpand: true,
  resultType: 'default',
  icon: null,
  extra: null,
};
Search.propTypes = {
  searchUrlPrefix: PropTypes.string.isRequired,
  mediaUrlPrefix: PropTypes.string.isRequired,
  listDescription: PropTypes.string, // or undefined
  listActions: PropTypes.node, // or undefined
  project: PropTypes.object, // or null
  projectGroup: PropTypes.object, // or null
  feedTeam: PropTypes.object, // or null
  savedSearch: PropTypes.object, // or null
  teamSlug: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  icon: PropTypes.node,
  hideFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  readOnlyFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  page: PropTypes.oneOf(['trash', 'collection', 'list', 'folder', 'suggested-matches', 'feed', 'tipline-inbox']), // FIXME find a cleaner way to render Trash differently
  query: PropTypes.object.isRequired, // may be empty
  showExpand: PropTypes.bool,
  resultType: PropTypes.string, // 'default' or 'feed', for now
  extra: PropTypes.node, // or null
};
