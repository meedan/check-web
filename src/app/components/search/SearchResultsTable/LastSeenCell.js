import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function LastSeenCell({ projectMedia }) {
  return <TimeCell unixTimestampInS={parseFloat(projectMedia.last_seen)} />;
}
LastSeenCell.propTypes = {
  projectMedia: PropTypes.shape({
    // last_seen: UNIX timestamp in s, encoded as a String.
    // TODO make .last_seen a Number (requires API change)
    last_seen: PropTypes.string.isRequired,
  }).isRequired,
};
