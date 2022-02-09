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
import ReportStatusCell from './ReportStatusCell';
import TagsCell from './TagsCell';
import MediaPublishedCell from './MediaPublishedCell';
import ReactionCountCell from './ReactionCountCell';
import CommentCountCell from './CommentCountCell';
import RelatedCountCell from './RelatedCountCell';
import SuggestionsCountCell from './SuggestionsCountCell';
import FolderCell from './FolderCell';
import CreatorNameCell from './CreatorNameCell';
import ClusterSizeCell from './ClusterSizeCell';
import ClusterTeamsCell from './ClusterTeamsCell';
import SourcesCell from './SourcesCell';
import { truncateLength } from '../../../helpers';

const AllPossibleColumns = [
  {
    field: 'item',
    headerText: <FormattedMessage id="list.Item" defaultMessage="Item" />,
    cellComponent: TitleCell,
    sortKey: 'title',
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
    headerText: <FormattedMessage id="list.LinkedItems" defaultMessage="Similar media" />,
    cellComponent: LinkedItemsCountCell,
    align: 'center',
    sortKey: 'related',
  },
  {
    field: 'type_of_media',
    headerText: <FormattedMessage id="list.Type" defaultMessage="Type" />,
    cellComponent: TypeCell,
    sortKey: 'type_of_media',
  },
  {
    field: 'status',
    headerText: <FormattedMessage id="list.Status" defaultMessage="Status" />,
    cellComponent: StatusCell,
    sortKey: 'status_index',
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
  {
    field: 'report_status',
    headerText: <FormattedMessage id="list.reportStatus" defaultMessage="Report status" />,
    sortKey: 'report_status',
    cellComponent: ReportStatusCell,
  },
  {
    field: 'tags_as_sentence',
    headerText: <FormattedMessage id="list.tags" defaultMessage="Tags" />,
    sortKey: 'tags_as_sentence',
    cellComponent: TagsCell,
  },
  {
    field: 'media_published_at',
    headerText: <FormattedMessage id="list.mediaPublishedAt" defaultMessage="Media published" />,
    sortKey: 'media_published_at',
    cellComponent: MediaPublishedCell,
  },
  {
    field: 'reaction_count',
    headerText: <FormattedMessage id="list.reactCount" defaultMessage="FB Reactions" />,
    cellComponent: ReactionCountCell,
    align: 'center',
    sortKey: 'reaction_count',
  },
  {
    field: 'comment_count',
    headerText: <FormattedMessage id="list.commentCount" defaultMessage="FB Comments" />,
    cellComponent: CommentCountCell,
    align: 'center',
    sortKey: 'comment_count',
  },
  {
    field: 'related_count',
    headerText: <FormattedMessage id="list.relatedCount" defaultMessage="Related" />,
    cellComponent: RelatedCountCell,
    align: 'center',
    sortKey: 'related_count',
  },
  {
    field: 'suggestions_count',
    headerText: <FormattedMessage id="list.suggestionsCount" defaultMessage="Suggested matches" />,
    cellComponent: SuggestionsCountCell,
    align: 'center',
    sortKey: 'suggestions_count',
  },
  {
    field: 'folder',
    headerText: <FormattedMessage id="list.folder" defaultMessage="Folder" description="Table header for column that shows the folder title an item is in" />,
    cellComponent: FolderCell,
  },
  {
    field: 'creator_name',
    headerText: <FormattedMessage id="list.createdBy" defaultMessage="Created by" description="Table header for column that shows the creator name" />,
    cellComponent: CreatorNameCell,
    align: 'center',
    sortKey: 'creator_name',
  },
  {
    field: 'cluster_size',
    headerText: <FormattedMessage id="list.clusterSize" defaultMessage="Cluster size" description="Table header for column that shows the number of similar items that belong to the same cluster" />,
    cellComponent: ClusterSizeCell,
    align: 'center',
  },
  {
    field: 'cluster_team_names',
    headerText: <FormattedMessage id="list.clusterTeamNames" defaultMessage="Workspaces" description="Table header for column that shows from which workspaces the items in the same cluster belong to" />,
    cellComponent: ClusterTeamsCell,
    align: 'center',
  },
  {
    field: 'sources_as_sentence',
    headerText: <FormattedMessage id="list.sourceName" defaultMessage="Source" description="Table header for column that shows item source" />,
    cellComponent: SourcesCell,
    align: 'center',
  },
];

const showInTrends = [
  'item',
  'created_at_timestamp',
  'cluster_size',
  'cluster_team_names',
];

function buildColumnDefs(team, resultType) {
  if (resultType === 'trends') {
    const trendColumns = AllPossibleColumns
      .filter(column => showInTrends.includes(column.field));
    return trendColumns;
  }

  const possibleColumns = AllPossibleColumns
    // "demand" and "last_seen" only appear if smooch bot is installed
    .filter(({ onlyIfSmoochBotEnabled }) => onlyIfSmoochBotEnabled ? Boolean(team.smooch_bot) : true);
  const columns = [possibleColumns[0]];
  team.list_columns.forEach((listColumn) => {
    if (listColumn.show) {
      let column = possibleColumns.find(c => c.field === listColumn.key);
      if (!column && /^task_value_/.test(listColumn.key)) {
        column = {
          field: listColumn.key,
          headerText: <div title={listColumn.label}>{truncateLength(listColumn.label, 32)}</div>,
          cellComponent: MetadataCell,
          sortKey: listColumn.key,
          type: listColumn.type,
          align: listColumn.type === 'url' ? 'center' : 'inherit',
        };
      }
      if (column) {
        columns.push(column);
      }
    }
  });
  return columns;
}

const TableContainerWithScrollbars = withStyles({
  root: {
    overflow: 'auto',
    display: 'block',
    maxWidth: 'calc(100vw - 256px)',
    maxHeight: 'calc(100vh - 232px)',
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
  resultType,
  viewMode,
}) {
  const columnDefs = React.useMemo(() => buildColumnDefs(team, resultType), [team]);

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
    <TableContainerWithScrollbars>
      <Table stickyHeader size="small">
        <SearchResultsTableHead
          columnDefs={columnDefs}
          team={team}
          projectMedias={projectMedias}
          selectedIds={selectedIds}
          sortParams={sortParams}
          onChangeSelectedIds={onChangeSelectedIds}
          onChangeSortParams={onChangeSortParams}
          resultType={resultType}
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
              resultType={resultType}
              viewMode={viewMode}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainerWithScrollbars>
  );
}
SearchResultsTable.defaultProps = {
  sortParams: null,
  resultType: 'default',
  viewMode: 'shorter',
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
  viewMode: PropTypes.oneOf(['shorter', 'longer']),
  resultType: PropTypes.string,
};
