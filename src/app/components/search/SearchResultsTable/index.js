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
import FirstSeenCell from './FirstSeenCell';
import LastSeenCell from './LastSeenCell';
import DemandCell from './DemandCell';
import ShareCountCell from './ShareCountCell';
import LinkedItemsCountCell from './LinkedItemsCountCell';

const AllPossibleColumns = [
  {
    field: 'item',
    headerText: <FormattedMessage id="list.Item" defaultMessage="Item" />,
    colSpan: 2,
    cellComponent: TitleCell,
  },
  {
    field: 'demand',
    headerText: <FormattedMessage id="list.Demand" defaultMessage="Requests" />,
    onlyIfSmoochBotEnabled: true,
    cellComponent: DemandCell,
    sortKey: 'demand',
    width: '1px', // "width: 1px" means, "consume the minimum width to fit the contents"
  },
  {
    field: 'share_count',
    headerText: <FormattedMessage id="list.ShareCount" defaultMessage="Social shares" />,
    cellComponent: ShareCountCell,
    align: 'center',
    sortKey: 'share_count',
    width: '1px',
  },
  {
    field: 'linked_items_count',
    headerText: <FormattedMessage id="list.LinkedItems" defaultMessage="Related" />,
    cellComponent: LinkedItemsCountCell,
    align: 'center',
    sortKey: 'related',
    width: '1px',
  },
  {
    field: 'type',
    headerText: <FormattedMessage id="list.Type" defaultMessage="Type" />,
    cellComponent: TypeCell,
    width: '1px',
  },
  {
    field: 'status',
    headerText: <FormattedMessage id="list.Status" defaultMessage="Status" />,
    cellComponent: StatusCell,
    width: '1px',
  },
  {
    field: 'created_at',
    headerText: <FormattedMessage id="list.FirstSeen" defaultMessage="First seen" />,
    cellComponent: FirstSeenCell,
    sortKey: 'recent_added',
    width: '1px',
  },
  {
    field: 'last_seen',
    headerText: <FormattedMessage id="list.LastSeen" defaultMessage="Last seen" />,
    onlyIfSmoochBotEnabled: true,
    sortKey: 'last_seen',
    cellComponent: LastSeenCell,
    width: '1px',
  },
];

function buildColumnDefs(team) {
  const smoochBotInstalled = (
    team
    && team.team_bot_installations
    && team.team_bot_installations.edges.some(edge => edge.node.team_bot.identifier === 'smooch')
  );

  return AllPossibleColumns
    // "demand" and "last_seen" only appear if smooch bot is installed
    .filter(({ onlyIfSmoochBotEnabled }) => onlyIfSmoochBotEnabled ? smoochBotInstalled : true);
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
  sortParams,
  onChangeSelectedIds,
  onChangeSortParams,
  onClickRow,
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
              checked={selectedIds.includes(projectMedia.id)}
              onChangeChecked={handleChangeProjectMediaChecked}
              onClick={onClickRow}
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
  selectedIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  sortParams: PropTypes.shape({
    key: PropTypes.string.isRequired,
    ascending: PropTypes.bool.isRequired,
  }), // or null for unsorted
  onChangeSelectedIds: PropTypes.func.isRequired, // func([1, 2, 3]) => undefined
  onChangeSortParams: PropTypes.func.isRequired, // func({ key, ascending }) => undefined
  onClickRow: PropTypes.func.isRequired, // func(ev, projectMedia) => undefined
};
