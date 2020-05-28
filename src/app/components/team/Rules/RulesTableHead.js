import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Checkbox from '@material-ui/core/Checkbox';

const headCells = [
  { id: 'name', label: <FormattedMessage id="rulesTableHead.name" defaultMessage="Name" /> },
  { id: 'updated_at', label: <FormattedMessage id="rulesTableHead.updated" defaultMessage="Updated" /> },
];

const RulesTableHead = (props) => {
  const {
    onSelectAllClick,
    numSelected,
    rowCount,
  } = props;

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': <FormattedMessage id="rulesTableHead.selectAll" defaultMessage="Select all rules" /> }}
          />
        </TableCell>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="default"
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

RulesTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default RulesTableHead;
