import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import { withStyles } from '@material-ui/core/styles';
import SearchResultsTableHead from './SearchResultsTableHead';
import SearchResultsTableRow from './SearchResultsTableRow';
import TitleCell from './TitleCell';
import TypeCell from './TypeCell';
import StatusCell from './StatusCell';
import SubmittedCell from './SubmittedCell';
import LastSubmittedCell from './LastSubmittedCell';
import UpdatedCell from './UpdatedCell';
import DemandCell from './DemandCell';
import ShareCountCell from './ShareCountCell';
import LinkedItemsCountCell from './LinkedItemsCountCell';
import MetadataCell from './MetadataCell';
import { isBotInstalled } from '../../../helpers';

const AllPossibleColumns = [
  {
    field: 'item',
    headerText: <FormattedMessage id="list.Item" defaultMessage="Item" />,
    cellComponent: TitleCell,
  },
  {
    field: 'demand',
    headerText: <FormattedMessage id="list.Demand" defaultMessage="Requests" />,
    onlyIfSmoochBotEnabled: true,
    cellComponent: DemandCell,
    align: 'center',
    sortKey: 'demand',
  },
  {
    field: 'share_count',
    headerText: <FormattedMessage id="list.ShareCount" defaultMessage="FB Shares" />,
    cellComponent: ShareCountCell,
    align: 'center',
    sortKey: 'share_count',
  },
  {
    field: 'linked_items_count',
    headerText: <FormattedMessage id="list.LinkedItems" defaultMessage="Related" />,
    cellComponent: LinkedItemsCountCell,
    align: 'center',
    sortKey: 'related',
  },
  {
    field: 'type_of_media',
    headerText: <FormattedMessage id="list.Type" defaultMessage="Type" />,
    cellComponent: TypeCell,
  },
  {
    field: 'status',
    headerText: <FormattedMessage id="list.Status" defaultMessage="Status" />,
    cellComponent: StatusCell,
  },
  {
    field: 'created_at_timestamp',
    headerText: <FormattedMessage id="list.FirstSeen" defaultMessage="Submitted" />,
    cellComponent: SubmittedCell,
    sortKey: 'recent_added',
  },
  {
    field: 'last_seen',
    headerText: <FormattedMessage id="list.LastSeen" defaultMessage="Last submitted" />,
    onlyIfSmoochBotEnabled: true,
    sortKey: 'last_seen',
    cellComponent: LastSubmittedCell,
  },
  {
    field: 'updated_at_timestamp',
    headerText: <FormattedMessage id="list.updated" defaultMessage="Updated" />,
    sortKey: 'recent_activity',
    cellComponent: UpdatedCell,
  },
];

function buildColumnDefs(team) {
  const possibleColumns = AllPossibleColumns
    // "demand" and "last_seen" only appear if smooch bot is installed
    .filter(({ onlyIfSmoochBotEnabled }) => onlyIfSmoochBotEnabled ? isBotInstalled(team, 'smooch') : true);
  const columns = [possibleColumns[0]];
  team.list_columns.forEach((listColumn) => {
    if (listColumn.show) {
      let column = possibleColumns.find(c => c.field === listColumn.key);
      if (!column && /^task_value_/.test(listColumn.key)) {
        column = {
          field: listColumn.key,
          headerText: <div>{listColumn.label}</div>,
          cellComponent: MetadataCell,
          sortKey: listColumn.key,
          type: listColumn.type,
        };
      }
      if (column) {
        columns.push(column);
      }
    }
  });
  return columns;
}

/**
 * A <TableContainer> that won't show scrollbars.
 *
 * This implies a parent must manage scrolling. Our design is: <html> shows
 * scrollbars; and the table's sticky header appears here.
 */
const TableContainerWithoutScrollbars = withStyles({
  root: {
    overflow: 'visible',
  },
})(TableContainer);

export default function SearchResultsTable({
  team,
  selectedIds,
  projectMedias,
  buildProjectMediaUrl,
  sortParams,
  onChangeSelectedIds,
  onChangeSortParams,
}) {
  const columnDefs = React.useMemo(() => buildColumnDefs(team), [team]);

  const handleChangeProjectMediaChecked = React.useCallback((ev, projectMedia) => {
    const { id } = projectMedia;
    if (!id) return; // Can't select unsaved object. Swallow mouse click.

    let newIds;
    if (ev.target.checked) {
      // Add
      if (selectedIds.includes(id)) {
        return;
      }
      newIds = [...selectedIds, id];
      newIds.sort((a, b) => a - b);
    } else {
      // Remove
      if (!selectedIds.includes(id)) {
        return;
      }
      newIds = selectedIds.filter(oldId => oldId !== id);
    }
    onChangeSelectedIds(newIds);
  }, [selectedIds, onChangeSelectedIds]);

  return (
    <TableContainerWithoutScrollbars>
      <Table stickyHeader size="small">
        <SearchResultsTableHead
          columnDefs={columnDefs}
          team={team}
          projectMedias={projectMedias}
          selectedIds={selectedIds}
          sortParams={sortParams}
          onChangeSelectedIds={onChangeSelectedIds}
          onChangeSortParams={onChangeSortParams}
        />
        <TableBody>
          {projectMedias.map(projectMedia => (
            <SearchResultsTableRow
              key={projectMedia.id}
              columnDefs={columnDefs}
              projectMedia={projectMedia}
              projectMediaUrl={buildProjectMediaUrl(projectMedia)}
              checked={selectedIds.includes(projectMedia.id)}
              onChangeChecked={handleChangeProjectMediaChecked}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainerWithoutScrollbars>
  );
}
SearchResultsTable.defaultProps = {
  sortParams: null,
};
SearchResultsTable.propTypes = {
  team: PropTypes.object.isRequired,
  projectMedias: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  buildProjectMediaUrl: PropTypes.func.isRequired, // func(projectMedia) => String
  selectedIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  sortParams: PropTypes.shape({
    key: PropTypes.string.isRequired,
    ascending: PropTypes.bool.isRequired,
  }), // or null for unsorted
  onChangeSelectedIds: PropTypes.func.isRequired, // func([1, 2, 3]) => undefined
  onChangeSortParams: PropTypes.func.isRequired, // func({ key, ascending }) => undefined
};
