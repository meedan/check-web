import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function RelatedCountCell({ projectMedia }) {
  const relatedCount = projectMedia.list_columns_values.related_count;
  return <NumberCell value={relatedCount} />;
}

RelatedCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      related_count: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
