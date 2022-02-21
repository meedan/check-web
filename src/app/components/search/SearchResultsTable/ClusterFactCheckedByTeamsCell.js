import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ValueListCell from './ValueListCell';

export default function ClusterFactCheckedByTeamsCell({ projectMedia }) {
  const values = projectMedia.cluster.fact_checked_by_team_names;
  return (
    <ValueListCell
      values={values}
      noValueLabel={
        <FormattedMessage id="checkedByTeamsCell.noFactCheck" defaultMessage="No fact-check" description="Table cell displayed on Trends page when claim is not fact-checked yet" />
      }
      randomizeOrder
      renderNoValueAsChip
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
