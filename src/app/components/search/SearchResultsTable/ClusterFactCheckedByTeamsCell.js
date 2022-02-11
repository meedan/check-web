import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ClusterTeamsCell from './ClusterTeamsCell';

export default function ClusterFactCheckedByTeamsCell({ projectMedia }) {
  const teamNames = projectMedia.cluster.fact_checked_by_team_names;
  return (
    <ClusterTeamsCell
      teamNames={teamNames}
      noLabel={
        <FormattedMessage id="checkedByTeamsCell.noFactCheck" defaultMessage="No fact-check" description="Table cell displayed on Trends page when claim is not fact-checked yet" />
      }
    />
  );
}

ClusterFactCheckedByTeamsCell.propTypes = {
  projectMedia: PropTypes.shape({
    cluster: PropTypes.shape({
      fact_checked_by_team_names: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    }).isRequired,
  }).isRequired,
};
