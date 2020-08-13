import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function UpdatedCell({ projectMedia }) {
  return <TimeCell unixTimestampInS={parseFloat(projectMedia.updated_at)} />;
}
UpdatedCell.propTypes = {
  projectMedia: PropTypes.shape({
    // last_seen: UNIX timestamp in s, encoded as a String.
    // TODO make .last_seen a Number (requires API change)
    updated_at: PropTypes.string.isRequired,
  }).isRequired,
};
