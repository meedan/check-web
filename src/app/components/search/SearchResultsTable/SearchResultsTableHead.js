import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import SearchResultsTh from './SearchResultsTh';

export default function SearchResultsTableHead({
  columnDefs, selectedIds, projectMedias, sortParams, onChangeSelectedIds, onChangeSortParams,
}) {
  const handleSelectAll = React.useCallback((ev) => {
    const newIds = ev.target.checked ? projectMedias.map(pm => pm.id) : [];
    onChangeSelectedIds(newIds);
  }, [projectMedias, onChangeSelectedIds]);

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selectedIds.length > 0 && selectedIds.length < projectMedias.length}
            checked={selectedIds.length > 0 && selectedIds.length === projectMedias.length}
            onChange={handleSelectAll}
          />
        </TableCell>
        {columnDefs.map(({ headerText, sortKey, width }) => (
          <SearchResultsTh
            text={headerText}
            sortKey={sortKey}
            sortParams={sortParams}
            onChangeSortParams={onChangeSortParams}
            width={width}
          />
        ))}
      </TableRow>
    </TableHead>
  );
}
SearchResultsTableHead.defaultProps = {
  sortParams: null,
};
SearchResultsTableHead.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.shape({
    headerText: PropTypes.element.isRequired,
    field: PropTypes.string, // or undefined -- sets data-field="..." HTML attribute
    sortKey: PropTypes.string, // or undefined
    width: PropTypes.string, // '1px' or undefined
  }).isRequired).isRequired,
  projectMedias: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  sortParams: PropTypes.shape({
    key: PropTypes.string.isRequired,
    ascending: PropTypes.bool.isRequired,
  }), // or null for unsorted
  onChangeSelectedIds: PropTypes.func.isRequired, // func([1, 2, 3]) => undefined
  onChangeSortParams: PropTypes.func.isRequired, // func({ key, ascending }) => undefined
};
