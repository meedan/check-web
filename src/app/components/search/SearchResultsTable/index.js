import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Table from '@material-ui/core/Table';
import SearchResultsTableHead from './SearchResultsTableHead';
import SearchResultsTableRow from './SearchResultsTableRow';
import TitleCell from './TitleCell';
import FactCheckCell from './FactCheckCell';
import TypeCell from './TypeCell';
import StatusCell from './StatusCell';
import SubmittedCell from './SubmittedCell';
import UpdatedCell from './UpdatedCell';
import DemandCell from './DemandCell';
import ShareCountCell from './ShareCountCell';
import LinkedItemsCountCell from './LinkedItemsCountCell';
import MetadataCell from './MetadataCell';
import ReportStatusCell from './ReportStatusCell';
import TagsCell from './TagsCell';
import MediaPublishedCell from './MediaPublishedCell';
import FactCheckPublishedAtCell from './FactCheckPublishedAtCell';
import ReportPublishedByCell from './ReportPublishedByCell';
import ReactionCountCell from './ReactionCountCell';
import CommentCountCell from './CommentCountCell';
import SuggestionsCountCell from './SuggestionsCountCell';
import CreatorNameCell from './CreatorNameCell';
import ClusterSizeCell from './ClusterSizeCell';
import ClusterRequestsCell from './ClusterRequestsCell';
import ClusterFirstItemAtCell from './ClusterFirstItemAtCell';
import ClusterLastItemAtCell from './ClusterLastItemAtCell';
import ClusterFactCheckedByTeamsCell from './ClusterFactCheckedByTeamsCell';
import SourcesCell from './SourcesCell';
import TeamNameCell from './TeamNameCell';
import { truncateLength } from '../../../helpers';
import styles from '../SearchResults.module.css';

const AllPossibleColumns = [
  {
    field: 'item',
    headerText: <FormattedMessage id="list.Item" defaultMessage="Claim" description="Table header for Claim column" />,
    cellComponent: TitleCell,
    sortKey: 'title',
  },
  {
    field: 'fact_check_title',
    headerText: <FormattedMessage id="list.factCheck" defaultMessage="Fact-check" description="Table header for Fact-check column" />,
    cellComponent: FactCheckCell,
  },
  {
    field: 'demand',
    headerText: <FormattedMessage id="list.Demand" defaultMessage="Requests" description="Table header for Requests column" />,
    onlyIfSmoochBotEnabled: true,
    cellComponent: DemandCell,
    sortKey: 'demand',
  },
  {
    field: 'share_count',
    headerText: <FormattedMessage id="list.ShareCount" defaultMessage="FB Shares" description="Table header for Facebook share count column" />,
    cellComponent: ShareCountCell,
    sortKey: 'share_count',
  },
  {
    field: 'linked_items_count',
    headerText: <FormattedMessage id="list.LinkedItems" defaultMessage="Media" description="Plural - Table header for number of related media column" />,
    cellComponent: LinkedItemsCountCell,
    sortKey: 'related',
  },
  {
    field: 'type_of_media',
    headerText: <FormattedMessage id="list.Type" defaultMessage="Type" description="Table header for item type column" />,
    cellComponent: TypeCell,
    sortKey: 'type_of_media',
  },
  {
    field: 'status',
    headerText: <FormattedMessage id="list.Status" defaultMessage="Status" description="Table header for item status column" />,
    cellComponent: StatusCell,
    sortKey: 'status_index',
  },
  {
    field: 'created_at_timestamp',
    headerText: <FormattedMessage id="list.FirstSeen" defaultMessage="Submitted" description="Table header for item submitted date column" />,
    cellComponent: SubmittedCell,
    sortKey: 'recent_added',
  },
  {
    field: 'updated_at_timestamp',
    headerText: <FormattedMessage id="list.updated" defaultMessage="Updated" description="Table header for item updated date column" />,
    sortKey: 'recent_activity',
    cellComponent: UpdatedCell,
  },
  {
    field: 'report_status',
    headerText: <FormattedMessage id="list.reportStatus" defaultMessage="Report status" description="Table header for report status column" />,
    sortKey: 'report_status',
    cellComponent: ReportStatusCell,
  },
  {
    field: 'team_name',
    headerText: <FormattedMessage id="list.teamName" defaultMessage="Fact-check by" description="Table header for column that shows the team name" />,
    cellComponent: TeamNameCell,
  },
  {
    field: 'tags_as_sentence',
    headerText: <FormattedMessage id="list.tags" defaultMessage="Tags" description="Table header for item tags column" />,
    sortKey: 'tags_as_sentence',
    cellComponent: TagsCell,
  },
  {
    field: 'media_published_at',
    headerText: <FormattedMessage id="list.mediaPublishedAt" defaultMessage="Media published" description="Table header for media (singular) published date column" />,
    sortKey: 'media_published_at',
    cellComponent: MediaPublishedCell,
  },
  {
    field: 'published_by',
    headerText: <FormattedMessage id="list.reportPublishedBy" defaultMessage="Report published by" description="Table header for user who published report column" />,
    cellComponent: ReportPublishedByCell,
  },
  {
    field: 'fact_check_published_on',
    headerText: <FormattedMessage id="list.factCheckPublishedAt" defaultMessage="Fact check published at" description="Table header for fact-check publication date column" />,
    sortKey: 'fact_check_published_on',
    cellComponent: FactCheckPublishedAtCell,
  },
  {
    field: 'reaction_count',
    headerText: <FormattedMessage id="list.reactCount" defaultMessage="FB Reactions" description="Table header for Facebook reactions count column" />,
    cellComponent: ReactionCountCell,
    sortKey: 'reaction_count',
  },
  {
    field: 'comment_count',
    headerText: <FormattedMessage id="list.commentCount" defaultMessage="FB Comments" description="Table header for Facebook comments count column" />,
    cellComponent: CommentCountCell,
    sortKey: 'comment_count',
  },
  {
    field: 'suggestions_count',
    headerText: <FormattedMessage id="list.suggestionsCount" defaultMessage="Suggestions" description="Table header suggested matches count column" />,
    cellComponent: SuggestionsCountCell,
    sortKey: 'suggestions_count',
  },
  {
    field: 'creator_name',
    headerText: <FormattedMessage id="list.createdBy" defaultMessage="Created by" description="Table header for column that shows the creator name" />,
    cellComponent: CreatorNameCell,
    sortKey: 'creator_name',
  },
  {
    field: 'sources_as_sentence',
    headerText: <FormattedMessage id="list.sourceName" defaultMessage="Source" description="Table header for column that shows item source" />,
    cellComponent: SourcesCell,
  },
  {
    field: 'cluster_fact_checked_by_team_names',
    headerText: <FormattedMessage id="list.clusterFactCheckedByTeamNames" defaultMessage="Report published" description="Table header for column that shows from which workspaces the items in the same cluster have a published report" />,
    cellComponent: ClusterFactCheckedByTeamsCell,
    sortKey: 'cluster_published_reports_count',
  },
  {
    field: 'cluster_requests',
    headerText: <FormattedMessage id="list.clusterRequests" defaultMessage="Requests" description="Table header for column that shows number of requests in a cluster" />,
    cellComponent: ClusterRequestsCell,
    sortKey: 'cluster_requests_count',
  },
  {
    field: 'cluster_size',
    headerText: <FormattedMessage id="list.clusterSize" defaultMessage="Media" description="Table header for column that shows the number of similar items that belong to the same cluster" />,
    cellComponent: ClusterSizeCell,
    sortKey: 'cluster_size',
  },
  {
    field: 'cluster_first_item_at',
    headerText: <FormattedMessage id="list.clusterFirstItemAt" defaultMessage="Submitted" description="Table header for column that shows when the last item of the cluster was created" />,
    cellComponent: ClusterFirstItemAtCell,
    sortKey: 'cluster_first_item_at',
  },
  {
    field: 'cluster_last_item_at',
    headerText: <FormattedMessage id="list.clusterLastItemAt" defaultMessage="Last submitted" description="Table header for column that shows when the last item of the cluster was created" />,
    cellComponent: ClusterLastItemAtCell,
    sortKey: 'cluster_last_item_at',
  },
];

const showInFeed = [
  'item',
  'cluster_fact_checked_by_team_names',
  'cluster_requests',
  'cluster_size',
  'cluster_first_item_at',
  'cluster_last_item_at',
];

const showInFactCheck = [
  'fact_check_title',
  'status',
  'updated_at_timestamp',
  'team_name',
  'tags_as_sentence',
];

function buildColumnDefs(team, resultType) {
  if (resultType === 'feed') {
    const feedColumns = AllPossibleColumns
      .filter(column => showInFeed.includes(column.field));
    return feedColumns;
  }

  if (resultType === 'factCheck') {
    const factCheckColumns = AllPossibleColumns
      .filter(column => showInFactCheck.includes(column.field));
    return factCheckColumns;
  }

  const possibleColumns = AllPossibleColumns
    // "demand" only appears if smooch bot is installed
    .filter(({ onlyIfSmoochBotEnabled }) => onlyIfSmoochBotEnabled ? Boolean(team.smooch_bot) : true);
  const columns = [possibleColumns[0]];
  team.list_columns.forEach((listColumn) => {
    // Force legacy data to show "Submitted" field
    if (listColumn.show || listColumn.key === 'created_at_timestamp') {
      let column = possibleColumns.find(c => c.field === listColumn.key);
      if (!column && /^task_value_/.test(listColumn.key)) {
        column = {
          field: listColumn.key,
          headerText: <div title={listColumn.label}>{truncateLength(listColumn.label, 32)}</div>,
          cellComponent: MetadataCell,
          sortKey: listColumn.key,
          type: listColumn.type,
          align: 'inherit',
        };
      }
      if (column) {
        columns.push(column);
      }
    }
  });
  return columns;
}

export default function SearchResultsTable({
  team,
  selectedIds,
  projectMedias,
  buildProjectMediaUrl,
  sortParams,
  onChangeSelectedIds,
  onChangeSortParams,
  resultType,
  count,
}) {
  const columnDefs = React.useMemo(() => buildColumnDefs(team, resultType), [team]);
  const mediaNavList = projectMedias.map(media => media.dbid);

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
    <div className={styles['search-results-table-wrapper']}>
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
        <tbody>
          {projectMedias.map(projectMedia => (
            <SearchResultsTableRow
              key={projectMedia.id}
              columnDefs={columnDefs}
              projectMedia={projectMedia}
              projectMediaUrl={buildProjectMediaUrl(projectMedia)}
              checked={selectedIds.includes(projectMedia.id)}
              onChangeChecked={handleChangeProjectMediaChecked}
              resultType={resultType}
              mediaNavList={mediaNavList}
              count={count}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
}
SearchResultsTable.defaultProps = {
  sortParams: null,
  resultType: 'default',
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
  resultType: PropTypes.string,
};
