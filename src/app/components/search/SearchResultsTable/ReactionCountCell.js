import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function ReactionCountCell({ projectMedia }) {
  const reactionCount = projectMedia.list_columns_values.reaction_count;
  return <NumberCell value={reactionCount} />;
}
ReactionCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      reaction_count: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
