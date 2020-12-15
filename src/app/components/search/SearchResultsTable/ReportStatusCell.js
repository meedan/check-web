import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TableCell from '@material-ui/core/TableCell';

const labels = {
  unpublished: <FormattedMessage id="reportStatusCell.unpublished" defaultMessage="Unpublished" />,
  paused: <FormattedMessage id="reportStatusCell.paused" defaultMessage="Paused" />,
  published: <FormattedMessage id="reportStatusCell.published" defaultMessage="Published" />,
};

export default function ReportStatusCell({ projectMedia }) {
  return (
    <TableCell>
      {labels[projectMedia.list_columns_values.report_status]}
    </TableCell>
  );
}

ReportStatusCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      report_status: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
