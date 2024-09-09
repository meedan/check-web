/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import MediaPageLayout from './MediaPageLayout';
import ErrorBoundary from '../error/ErrorBoundary';
import { getListUrlQueryAndIndex } from '../../urlHelpers';
import NotFound from '../NotFound';

export default function MediaPage({ location, route, routeParams }) {
  const {
    buildSiblingUrl,
    listIndex,
    listQuery,
    listUrl,
  } = getListUrlQueryAndIndex(routeParams, location.query);

  const teamSlug = routeParams.team;
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
    <ErrorBoundary component="MediaPage">
      <MediaPageLayout
        buildSiblingUrl={buildSiblingUrl}
        count={location?.state?.count}
        listId={listId}
        listIndex={listIndex}
        listQuery={listQuery}
        listUrl={listUrl}
        mediaNavList={location?.state?.mediaNavList}
        projectMediaId={projectMediaId}
        teamSlug={teamSlug}
        view={currentView}
      />
    </ErrorBoundary>
  );
}

MediaPage.propTypes = {
  route: PropTypes.shape({
    view: PropTypes.string, // or undefined
  }).isRequired,
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    listId: PropTypes.string, // or undefined
    mediaId: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    query: PropTypes.object.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
};
