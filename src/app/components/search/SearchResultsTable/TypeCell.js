import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import MediaTypeDisplayName from '../../media/MediaTypeDisplayName';

export default function TypeCell({ projectMedia }) {
  return (
    <TableCell>
      <MediaTypeDisplayName mediaType={projectMedia.type} />
    </TableCell>
  );
}
TypeCell.propTypes = {
  projectMedia: PropTypes.shape({
    type: MediaTypeDisplayName.MediaTypeShape.isRequired,
  }).isRequired,
};
