import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import MediaUtil from '../../media/MediaUtil';

export default function TypeCell({ projectMedia }) {
  return (
    <TableCell>
      {MediaUtil.mediaTypeLabelFormattedMessage(projectMedia.type)}
    </TableCell>
  );
}
TypeCell.propTypes = {
  projectMedia: PropTypes.shape({
    type: MediaUtil.TypeLabelPropType.isRequired,
  }).isRequired,
};
