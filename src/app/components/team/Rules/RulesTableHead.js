import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const headCells = [
  { id: 'name', label: <FormattedMessage id="rulesTableHead.name" defaultMessage="Name" description="Table header for rule names" /> },
  { id: 'updated_at', label: <FormattedMessage id="rulesTableHead.updated" defaultMessage="Updated" description="Table header for rule update dates" /> },
];

const RulesTableHead = ({ orderBy, order, onSort }) => (
  <TableHead className="rulesTableHead">
    <TableRow>
      <TableCell padding="checkbox" />
      {headCells.map(headCell => (
        <TableCell
          key={headCell.id}
          align="left"
          padding="default"
          sortDirection={orderBy === headCell.id ? order : false}
        >
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={orderBy === headCell.id ? order : 'asc'}
            onClick={() => { onSort(headCell.id); }}
          >
            {headCell.label}
          </TableSortLabel>
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

RulesTableHead.propTypes = {
  orderBy: PropTypes.string.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
};

export default RulesTableHead;
