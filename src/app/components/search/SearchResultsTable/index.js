import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import SearchResultsTableHead from './SearchResultsTableHead';
import SearchResultsTableRow from './SearchResultsTableRow';
import FillRemainingHeight from './FillRemainingHeight';
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
    headerText: <FormattedMessage id="list.Item" defaultMessage="Item" />,
    cellComponent: TitleCell,
  },
  {
    headerText: <FormattedMessage id="list.Demand" defaultMessage="Requests" />,
    onlyIfSmoochBotEnabled: true,
    cellComponent: DemandCell,
    sortKey: 'demand',
    width: '1px', // "width: 1px" means, "consume the minimum width to fit the contents"
  },
  {
    headerText: <FormattedMessage id="list.ShareCount" defaultMessage="Social shares" />,
    cellComponent: ShareCountCell,
    sortKey: 'share_count',
    width: '1px',
  },
  {
    headerText: <FormattedMessage id="list.LinkedItems" defaultMessage="Related" />,
    cellComponent: LinkedItemsCountCell,
    sortKey: 'related',
    width: '1px',
  },
  {
    headerText: <FormattedMessage id="list.Type" defaultMessage="Type" />,
    cellComponent: TypeCell,
    width: '1px',
  },
  {
    headerText: <FormattedMessage id="list.Status" defaultMessage="Status" />,
    cellComponent: StatusCell,
    width: '1px',
  },
  {
    headerText: <FormattedMessage id="list.FirstSeen" defaultMessage="First seen" />,
    cellComponent: FirstSeenCell,
    sortKey: 'recent_added',
    width: '1px',
  },
  {
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

export default function SearchResultsTable({
  team,
  selectedIds,
  projectMedias,
  sortParams,
  onChangeSelectedIds,
  onChangeSortParams,
  onClickRow,
  isRtl,
}) {
  const columnDefs = React.useMemo(() => buildColumnDefs(team), [team]);

  const handleChangeProjectMediaChecked = React.useCallback((ev, projectMedia) => {
    const { dbid } = projectMedia;
    if (!dbid) return; // Can't select unsaved object. Swallow mouse click.

    let newIds;
    if (ev.target.checked) {
      // Add
      if (selectedIds.includes(dbid)) {
        return;
      }
      newIds = [...selectedIds, dbid];
      newIds.sort((a, b) => a - b);
    } else {
      // Remove
      if (!selectedIds.includes(dbid)) {
        return;
      }
      newIds = selectedIds.filter(id => id !== dbid);
    }
    onChangeSelectedIds(newIds);
  }, [selectedIds, onChangeSelectedIds]);

  return (
    <FillRemainingHeight component={TableContainer}>
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
              isRtl={isRtl}
              key={projectMedia.id}
              columnDefs={columnDefs}
              projectMedia={projectMedia}
              checked={selectedIds.includes(projectMedia.dbid)}
              onChangeChecked={handleChangeProjectMediaChecked}
              onClick={onClickRow}
            />
          ))}
        </TableBody>
      </Table>
    </FillRemainingHeight>
  );
}
SearchResultsTable.defaultProps = {
  sortParams: null,
};
SearchResultsTable.propTypes = {
  isRtl: PropTypes.bool.isRequired,
  team: PropTypes.object.isRequired,
  projectMedias: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  sortParams: PropTypes.shape({
    key: PropTypes.string.isRequired,
    ascending: PropTypes.bool.isRequired,
  }), // or null for unsorted
  onChangeSelectedIds: PropTypes.func.isRequired, // func([1, 2, 3]) => undefined
  onChangeSortParams: PropTypes.func.isRequired, // func({ key, ascending }) => undefined
  onClickRow: PropTypes.func.isRequired, // func(ev, projectMedia) => undefined
};
