import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import styled from 'styled-components';
import MediaCell from '../media/MediaCell';
import MediaUtil from '../media/MediaUtil';
import ListHeader from './ListHeader';
import { units } from '../../styles/js/shared';
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
  div.ag-cell {
    padding: 0 ${units(1)};
  }
  div.ag-header-cell {
    padding: 0 ${units(1)};
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
});

class List extends React.Component {
  constructor(props) {
    super(props);
    const fmtMsg = props.intl.formatMessage;
    this.state = {
      columnDefs: [
        {
          headerName: fmtMsg(messages.item),
          field: 'title',
          checkboxSelection: true,
          headerCheckboxSelection: true,
          cellRenderer: 'mediaCellRenderer',
          minWidth: 400,
        },
        {
          headerName: fmtMsg(messages.demand),
          field: 'demand',
          minWidth: 96,
          headerComponentFramework: ListHeader,
          headerComponentParams: {
            sort: 'requests',
          },
        },
        {
          headerName: fmtMsg(messages.linked_items_count),
          field: 'linked_items_count',
          minWidth: 96,
          headerComponentFramework: ListHeader,
          headerComponentParams: {
            sort: 'related',
          },
        },
        { headerName: fmtMsg(messages.type), field: 'type', minWidth: 96 },
        { headerName: fmtMsg(messages.status), field: 'status', minWidth: 96 },
        {
          headerName: fmtMsg(messages.first_seen),
          field: 'first_seen',
          minWidth: 96,
          headerComponentFramework: ListHeader,
          headerComponentParams: {
            sort: 'created',
          },
        },
        {
          headerName: fmtMsg(messages.last_seen),
          field: 'last_seen',
          minWidth: 96,
          headerComponentFramework: ListHeader,
          headerComponentParams: {
            sort: 'last_seen',
          },
        }],
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
