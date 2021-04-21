import React from 'react';
import { FormattedMessage } from 'react-intl';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

const headCells = [
  { id: 'name', label: <FormattedMessage id="rulesTableHead.name" defaultMessage="Name" description="Table header for rule names" /> },
  { id: 'updated_at', label: <FormattedMessage id="rulesTableHead.updated" defaultMessage="Updated" description="Table header for rule update dates" /> },
];

const RulesTableHead = () => (
  <TableHead className="rulesTableHead">
    <TableRow>
      <TableCell padding="checkbox" />
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

RulesTableHead.propTypes = {};

export default RulesTableHead;
