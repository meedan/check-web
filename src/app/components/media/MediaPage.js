import React from 'react';
import PropTypes from 'prop-types';
import MediaPageLayout from './MediaPageLayout';
import { getListUrlQueryAndIndex } from '../../urlHelpers';
import NotFound from '../NotFound';

export default function MediaPage({ route, routeParams, location }) {
  const {
    listUrl,
    listQuery,
    listIndex,
    buildSiblingUrl,
  } = getListUrlQueryAndIndex(routeParams, location.query);

  const teamSlug = routeParams.team;
  const projectId = parseInt(routeParams.projectId, 10) || null;
  const listId = parseInt(routeParams.listId, 10) || null;
  const projectMediaId = parseInt(routeParams.mediaId, 10) || null;
  let currentView = 'default';
  if (route && route.view) {
    currentView = route.view;
  }

  if (projectMediaId === null) {
    return <NotFound />;
  }

  return (
    <MediaPageLayout
      listUrl={listUrl}
      listQuery={listQuery}
      listIndex={listIndex}
      buildSiblingUrl={buildSiblingUrl}
      teamSlug={teamSlug}
      projectId={projectId}
      listId={listId}
      projectMediaId={projectMediaId}
      view={currentView}
    />
  );
}

MediaPage.propTypes = {
  route: PropTypes.shape({
    view: PropTypes.string, // or undefined
  }).isRequired,
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    projectId: PropTypes.string, // or undefined
    listId: PropTypes.string, // or undefined
    mediaId: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    query: PropTypes.object.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
};
