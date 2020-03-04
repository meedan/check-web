import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import styled from 'styled-components';
import MediaCell from '../media/MediaCell';
import MediaUtil from '../media/MediaUtil';
import ListHeader from './ListHeader';
import { units, highlightOrange, opaqueBlack54 } from '../../styles/js/shared';
import { getStatus } from '../../helpers';
import { teamStatuses } from '../../customHelpers';

const StyledGridContainer = styled.div`
  width: 100%;
  height: calc(100vh - ${units(30)});
  div.ag-cell-wrapper span.ag-cell-value {
    margin: 0 !important;
    padding: 0 ${units(1)};
  }
  .ag-cell-value {
    line-height: ${units(12)} !important;
  }
  .ag-header-cell-text {
    text-transform: uppercase;
  }
  .ag-header-select-all.ag-labeled.ag-checkbox {
    margin-right: 10px;
  }
  /* first div of row has no padding left, all other do */
  div.ag-cell {
    padding: 0 ${units(1)} 0 0;

    &.ag-cell-value{
      padding: 0 ${units(1)};
    }
  }
  /* first div of header row has no padding left */
  div.ag-header-cell {
    padding: 0 ${units(1)};
    &:first-child {
      padding: 0 ${units(1)} 0 0;
      &:hover {
        color: ${opaqueBlack54};
      }
    }
    &:hover {
      color: ${highlightOrange};
      background-color: white!important;
    }
  }
  div.ag-react-container {
    width: 100%;
    height: 100%;
  }
`;

const messages = defineMessages({
  item: {
    id: 'list.Item',
    defaultMessage: 'Item',
  },
  demand: {
    id: 'list.Demand',
    defaultMessage: 'Requests',
  },
  linked_items_count: {
    id: 'list.LinkedItems',
    defaultMessage: 'Related',
  },
  type: {
    id: 'list.Type',
    defaultMessage: 'Type',
  },
  status: {
    id: 'list.Status',
    defaultMessage: 'Status',
  },
  first_seen: {
    id: 'list.FirstSeen',
    defaultMessage: 'First seen',
  },
  last_seen: {
    id: 'list.LastSeen',
    defaultMessage: 'Last seen',
  },
  share_count: {
    id: 'list.ShareCount',
    defaultMessage: 'Social shares',
  },
});

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: List.getColumnDefs(props),
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate() {
    if (this.gridApi) {
      this.gridApi.deselectAll();
      this.gridApi.getModel().forEachNode((node) => {
        if (this.props.selectedMedia.includes(node.data.id)) {
          node.setSelected(true);
        }
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  static getColumnDefs(props) {
    const { team } = props;
    const fmtMsg = props.intl.formatMessage;

    let smoochBotInstalled = false;
    if (team && team.team_bot_installations) {
      team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }

    const colDefs = [
      {
        headerName: fmtMsg(messages.item),
        field: 'title',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        cellRenderer: 'mediaCellRenderer',
        minWidth: 424,
      },
      {
        headerName: fmtMsg(messages.share_count),
        field: 'share_count',
        minWidth: 124,
        maxWidth: 124,
        headerComponentFramework: ListHeader,
        headerComponentParams: {
          sort: 'share_count',
        },
      },
      {
        headerName: fmtMsg(messages.linked_items_count),
        field: 'linked_items_count',
        minWidth: 88,
        maxWidth: 88,
        headerComponentFramework: ListHeader,
        headerComponentParams: {
          sort: 'related',
        },
      },
      {
        headerName: fmtMsg(messages.type),
        field: 'type',
        minWidth: 72,
        maxWidth: 72,
      },
      {
        headerName: fmtMsg(messages.status),
        field: 'status',
        minWidth: 96,
        maxWidth: 112,
      },
      {
        headerName: fmtMsg(messages.first_seen),
        field: 'first_seen',
        minWidth: 96,
        maxWidth: 112,
        headerComponentFramework: ListHeader,
        headerComponentParams: {
          sort: 'recent_added',
        },
      },
    ];

    if (smoochBotInstalled) {
      const requestsCol = {
        headerName: fmtMsg(messages.demand),
        field: 'demand',
        minWidth: 96,
        maxWidth: 96,
        headerComponentFramework: ListHeader,
        headerComponentParams: {
          sort: 'requests',
        },
      };

      const lastSeenCol = {
        headerName: fmtMsg(messages.last_seen),
        field: 'last_seen',
        minWidth: 96,
        maxWidth: 112,
        headerComponentFramework: ListHeader,
        headerComponentParams: {
          sort: 'last_seen',
        },
      };
      colDefs.splice(1, 0, requestsCol);
      colDefs.push(lastSeenCol);
    }

    return colDefs;
  }

  getRowData() {
    return this.props.searchResults.map((i) => {
      const media = i.node;
      const {
        id,
        dbid,
        picture,
        title,
        description,
        demand,
        linked_items_count,
        type,
        status,
        first_seen,
        last_seen,
        share_count,
      } = media;

      const statusObj = getStatus(teamStatuses(media), status);

      const formatted_first_seen = this.props.intl.formatRelative(MediaUtil.createdAt({
        published: first_seen,
      }));

      const formatted_last_seen = this.props.intl.formatRelative(MediaUtil.createdAt({
        published: last_seen,
      }));

      const row = {
        id,
        dbid,
        picture,
        title,
        description,
        type: MediaUtil.mediaTypeLabel(type, this.props.intl),
        demand,
        linked_items_count,
        status: statusObj.label,
        first_seen: formatted_first_seen,
        last_seen: formatted_last_seen,
        media,
        share_count,
        query: i.itemQuery,
      };

      return row;
    });
  }

  handleClickRow = (wrapper) => {
    if (this.props.onClick) {
      this.props.onClick(wrapper.rowIndex);
    }
  };

  handleGridReady = (params) => {
    this.gridApi = params.api;
    this.handleWindowResize();
  };

  handleChange = (params) => {
    const rows = params.api.getSelectedRows();
    if (this.props.onSelect) {
      this.props.onSelect(rows.map(r => r.id));
    }
  };

  handleWindowResize = () => {
    this.gridApi.sizeColumnsToFit(1366);
  }

  render() {
    return (
      <StyledGridContainer className="ag-theme-material">
        <AgGridReact
          columnDefs={this.state.columnDefs}
          frameworkComponents={{ mediaCellRenderer: MediaCell }}
          rowData={this.getRowData()}
          onGridReady={this.handleGridReady}
          onRowClicked={this.handleClickRow}
          onSelectionChanged={this.handleChange}
          rowClass="medias__item"
          rowStyle={{ cursor: 'pointer' }}
          rowHeight="96"
          rowSelection="multiple"
          suppressCellSelection
          suppressRowClickSelection
        />
      </StyledGridContainer>
    );
  }
}

export default injectIntl(List);
