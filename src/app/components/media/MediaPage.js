import React from 'react';
import PropTypes from 'prop-types';
import MediaPageLayout from './MediaPageLayout';
import { getListUrlQueryAndIndex } from '../../urlHelpers';
import NotFound from '../NotFound';

export default function MediaPage({ routeParams, location }) {
  const {
    listUrl,
    listQuery,
    listIndex,
    buildSiblingUrl,
  } = getListUrlQueryAndIndex(routeParams, location.query);

  const teamSlug = routeParams.team;
  const projectId = parseInt(routeParams.projectId, 10) || null;
  const projectMediaId = parseInt(routeParams.mediaId, 10) || null;

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
      projectMediaId={projectMediaId}
    />
  );
}

MediaPage.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    projectId: PropTypes.string, // or undefined
    mediaId: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    query: PropTypes.object.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
};
