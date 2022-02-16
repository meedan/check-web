import React from 'react';
import PropTypes from 'prop-types';
import ClusterTeamsCell from './ClusterTeamsCell';

export default function ClusterReceivedByTeamsCell({ projectMedia }) {
  const teamNames = projectMedia.cluster.team_names;
  return (
    <ClusterTeamsCell
      teamNames={teamNames}
      noLabel={null}
    />
  );
}

ClusterReceivedByTeamsCell.propTypes = {
  projectMedia: PropTypes.shape({
    cluster: PropTypes.shape({
      team_names: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    }).isRequired,
  }).isRequired,
};
