import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const useStyles = makeStyles({
  root: ({ width }) => ({
    width: width || 'auto',
    whiteSpace: 'nowrap',
  }),
});

export default function SearchResultsTh({
  text, sortKey, width, sortParams, onChangeSortParams,
}) {
  let sortDirection = null;
  if (sortParams && sortKey === sortParams.key) {
    sortDirection = sortParams.ascending ? 'asc' : 'desc';
  }
  const classes = useStyles({ width });

  const handleClickSort = React.useCallback(() => {
    onChangeSortParams({
      key: sortKey,
      ascending: sortDirection !== 'asc',
    });
  }, [sortKey, sortDirection]);

  return (
    <TableCell sortDirection={sortDirection || false} className={classes.root}>
      {sortKey ? (
        <TableSortLabel
          active={!!sortDirection}
          direction={sortDirection || undefined}
          onClick={handleClickSort}
        >
          {text}
        </TableSortLabel>
      ) : text}
    </TableCell>
  );
}
SearchResultsTh.defaultProps = {
  sortKey: null,
  sortParams: null,
  width: null,
};
SearchResultsTh.propTypes = {
  text: React.Component.isRequired,
  sortKey: PropTypes.string, // or null
  width: PropTypes.number, // '1px' means "minimum"; null means "auto"
  sortParams: PropTypes.shape({
    key: PropTypes.string.isRequired,
    ascending: PropTypes.bool.isRequired,
  }), // or null for unsorted
  onChangeSortParams: PropTypes.func.isRequired, // func({ key, ascending }) => undefined
};
