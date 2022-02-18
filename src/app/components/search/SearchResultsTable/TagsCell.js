import React from 'react';
import PropTypes from 'prop-types';
import ValueListCell from './ValueListCell';

export default function TagsCell({ projectMedia }) {
  const tags = projectMedia.list_columns_values.tags_as_sentence
    .split(',').map(t => t.trim()).filter(t => t !== '');

  return (<ValueListCell values={tags} noValueLabel="-" />);
}

TagsCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      tags_as_sentence: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
