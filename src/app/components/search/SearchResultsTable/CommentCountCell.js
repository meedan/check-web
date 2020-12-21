import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function CommentCountCell({ projectMedia }) {
  const commentCount = projectMedia.list_columns_values.comment_count;
  return <NumberCell value={commentCount} />;
}
CommentCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      comment_count: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
