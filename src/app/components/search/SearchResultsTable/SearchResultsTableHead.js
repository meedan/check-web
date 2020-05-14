import React from 'react';
import PropTypes from 'prop-types';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import SelectAllTh from './SelectAllTh';
import SearchResultsTh from './SearchResultsTh';

export default function SearchResultsTableHead({
  columnDefs, selectedIds, projectMedias, sortParams, onChangeSelectedIds, onChangeSortParams,
}) {
  return (
    <TableHead>
      <TableRow>
        <SelectAllTh
          selectedIds={selectedIds}
          projectMedias={projectMedias}
          onChangeSelectedIds={onChangeSelectedIds}
        />
        {columnDefs.map(({
          headerText,
          colSpan,
          sortKey,
          width,
          align,
          field,
        }) => (
          <SearchResultsTh
            key={field}
            text={headerText}
            field={field}
            colSpan={colSpan}
            sortKey={sortKey}
            align={align || 'inherit'}
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
    colSpan: PropTypes.number, // if not 1
    sortKey: PropTypes.string, // or undefined
    width: PropTypes.string, // '1px' or undefined
    align: PropTypes.oneOf(['inherit', 'left', 'center', 'right', 'justify']), // default inherit
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
