import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import MediaTypeDisplayName from '../../media/MediaTypeDisplayName';

export default function TypeCell({ projectMedia }) {
  return (
    <TableCell>
      <MediaTypeDisplayName mediaType={projectMedia.list_columns_values.type_of_media} />
    </TableCell>
  );
}
TypeCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      type_of_media: MediaTypeDisplayName.MediaTypeShape.isRequired,
    }).isRequired,
  }).isRequired,
};
