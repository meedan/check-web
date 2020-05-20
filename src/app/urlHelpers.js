import { safelyParseJSON } from './helpers';

const pageSize = 20;

/**
 * Return { listUrl, listQuery, listIndex, buildSiblingUrl } that are valid.
 *
 * `routeParams` must be an Object with `team` (required, team slug) and
 * `projectId` (optional, integer represented by Number or String).
 *
 * `locationQuery` must be an Object with `listPath` (optional String),
 * `listQuery` (optional String JSON-encoded Query) and `listIndex` (optional
 * integer represented by String, fallback `0`).
 *
 * Output `listQuery` is always set: it's an Object describing a query that
 * will generate a list based on the URL. It will include a `{ projects }`
 * inferred from `routeParams` if needed (so callers don't need to provide
 * that).
 *
 * Output `listIndex` and `buildSiblingUrl` are either both-set or both-null.
 * If they're set, `buildSiblingUrl()` will generate URLs that produce the
 * same { listUrl, listQuery, buildSiblingUrl } as the ones returned here.
 *
 * Output `listUrl` will have an esoffset that is a multiple of 20.
 *
 * Prefer shorter URLs. Callers should omit unneeded `listQuery` parameters
 * like `{ timestamp, esoffset }` which can be inferred from `routeParams` and
 * `listIndex`. And if there are no other parameters, callers should omit
 * `listQuery` entirely. (Callers may also omit `listPath` if it can be inferred
 * from the `routeParams`.)
 */
function getListUrlQueryAndIndex(routeParams, locationQuery) {
  let { listPath } = locationQuery;
  if (!listPath) {
    listPath = routeParams.projectId
      ? `/${routeParams.team}/project/${routeParams.projectId}`
      : `/${routeParams.team}/all-items`;
  }

  const projectId = parseInt(routeParams.projectId, 10) || null;

  // build `listQuery` from routeParams and ?listQuery=...
  const listQueryFromUrl = safelyParseJSON(locationQuery.listQuery, {});
  const listQuery = { ...listQueryFromUrl };
  if (projectId) {
    listQuery.projects = [projectId];
  }

  const listIndex = parseInt(locationQuery.listIndex, 10);
  if (Number.isNaN(listIndex) || listIndex < 0) {
    return {
      listUrl: locationQuery.listQuery
        ? `${listPath}/${encodeURIComponent(locationQuery.listQuery)}`
        : listPath,
      listQuery,
      listIndex: null,
      buildSiblingUrl: null,
    };
  }
  // Now `listIndex` is an integer pointing into `listQuery` ... that is,
  // if `listQuery` did _not_ includes `esoffset`.

  // listUrl: the "back-button URL"
  let listUrl;
  if (Object.keys(listQueryFromUrl).length === 0 && listIndex < pageSize) {
    listUrl = listPath;
  } else {
    const listUrlQuery = { ...listQueryFromUrl };
    if (listIndex >= pageSize) {
      listUrlQuery.esoffset = listIndex - (listIndex % pageSize);
    }
    listUrl = `${listPath}/${encodeURIComponent(JSON.stringify(listUrlQuery))}`;
  }

  // siblingUrlPrefix: for generating URLs like
  //
  // * /my-team/media/${projectMediaId} (for all-items or trash)
  // * /my-team/project/3/media/${projectMediaId} (for project)
  const siblingUrlPrefix = routeParams.projectId
    ? `${listPath}/media`
    : `/${routeParams.team}/media`;

  return {
    listUrl,
    buildSiblingUrl: (projectMediaId, siblingListIndex) => {
      const params = new URLSearchParams();
      if (locationQuery.listPath) {
        params.set('listPath', locationQuery.listPath);
      }
      if (locationQuery.listQuery) {
        params.set('listQuery', locationQuery.listQuery);
      }
      params.set('listIndex', String(siblingListIndex));

      return `${siblingUrlPrefix}/${projectMediaId}?${params.toString()}`;
    },
    listQuery,
    listIndex,
  };
}

export { getListUrlQueryAndIndex }; // eslint-disable-line import/prefer-default-export
