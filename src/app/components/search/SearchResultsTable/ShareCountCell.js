import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function ShareCountCell({ projectMedia }) {
  const shareCount = projectMedia.share_count;
  return <NumberCell value={shareCount} />;
}
ShareCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    share_count: PropTypes.number.isRequired,
  }).isRequired,
};
