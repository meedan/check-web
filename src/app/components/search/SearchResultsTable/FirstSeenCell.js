import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function FirstSeenCell({ projectMedia }) {
  return <TimeCell unixTimestampInS={parseFloat(projectMedia.first_seen)} />;
}
FirstSeenCell.propTypes = {
  projectMedia: PropTypes.shape({
    // first_seen: UNIX timestamp in s, encoded as a String.
    // TODO make .first_seen a Number (requires API change)
    first_seen: PropTypes.string.isRequired,
  }).isRequired,
};
