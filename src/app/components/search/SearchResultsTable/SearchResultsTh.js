import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const useStyles = makeStyles({
  root: ({ width }) => ({
    width,
    whiteSpace: 'nowrap',
  }),
});

export default function SearchResultsTh({
  text, field, colSpan, sortKey, width, align, sortParams, onChangeSortParams,
}) {
  let sortDirection = null;
  if (sortParams && sortKey === sortParams.key) {
    sortDirection = sortParams.ascending ? 'asc' : 'desc';
  }
  const classes = useStyles({ width });

  const handleClickSort = React.useCallback(() => {
    let newSortParams;
    if (sortParams === null || sortKey !== sortParams.key) {
      // Not sorted by this column => sort descending
      // (descending is default: "highest to lowest share count" and
      // "newest to oldest" all happen to imply descending. [2020-05-06]
      // we don't sort by any String fields yet.)
      newSortParams = { key: sortKey, ascending: false };
    } else if (!sortParams.ascending) {
      // Sorted by this column, descending => sort ascending
      newSortParams = { key: sortKey, ascending: true };
    } else {
      // Sorted by this column, ascending => un-sort
      newSortParams = null;
    }
    onChangeSortParams(newSortParams);
  }, [sortKey, sortDirection]);

  // hideSortIcon to (A) line things up correctly and (B) save horizontal space
  return (
    <TableCell
      data-field={field}
      colSpan={colSpan}
      sortDirection={sortDirection || false}
      classes={classes}
      align={align}
    >
      {sortKey ? (
        <TableSortLabel
          active={!!sortDirection}
          direction={sortDirection || undefined}
          onClick={handleClickSort}
          IconComponent={KeyboardArrowDownIcon}
          hideSortIcon
        >
          {text}
        </TableSortLabel>
      ) : text}
    </TableCell>
  );
}
SearchResultsTh.defaultProps = {
  field: undefined,
  sortKey: null,
  sortParams: null,
  colSpan: undefined,
  width: 'auto',
  align: 'inherit',
};
SearchResultsTh.propTypes = {
  text: PropTypes.node.isRequired,
  field: PropTypes.string, // or undefined -- sets data-field="..." HTML attribute
  colSpan: PropTypes.number, // or undefined -- sets colSpan="..." HTML attribute
  sortKey: PropTypes.string, // or null
  width: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.oneOf(['auto']).isRequired]),
  align: PropTypes.oneOf(['inherit', 'left', 'center', 'right', 'justify']),
  sortParams: PropTypes.shape({
    key: PropTypes.string.isRequired,
    ascending: PropTypes.bool.isRequired,
  }), // or null for unsorted
  onChangeSortParams: PropTypes.func.isRequired, // func({ key, ascending }) => undefined
};
