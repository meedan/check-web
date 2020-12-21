import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function SuggestionsCountCell({ projectMedia }) {
  const suggestionsCount = projectMedia.list_columns_values.suggestions_count;
  return <NumberCell value={suggestionsCount} />;
}

SuggestionsCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      suggestions_count: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
