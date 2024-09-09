/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const headCells = [
  { id: 'name', label: <FormattedMessage defaultMessage="Name" description="Table header for rule names" id="rulesTableHead.name" /> },
  { id: 'updated_at', label: <FormattedMessage defaultMessage="Updated" description="Table header for rule update dates" id="rulesTableHead.updated" /> },
];

const RulesTableHead = ({ onSort, order, orderBy }) => (
  <TableHead className="rulesTableHead">
    <TableRow>
      <TableCell padding="checkbox" />
      {headCells.map(headCell => (
        <TableCell
          align="left"
          key={headCell.id}
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
      <TableCell padding="checkbox" />
    </TableRow>
  </TableHead>
);

RulesTableHead.propTypes = {
  orderBy: PropTypes.string.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
};

export default RulesTableHead;
