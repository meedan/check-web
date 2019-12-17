import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { browserHistory } from 'react-router';
import MediaUtil from '../media/MediaUtil';
import { ContentColumn } from '../../styles/js/shared';
import { getStatus } from '../../helpers';
import { mediaStatuses } from '../../customHelpers';

const messages = defineMessages({
  title: {
    id: 'list.Title',
    defaultMessage: 'Title',
  },
  virality: {
    id: 'list.Virality',
    defaultMessage: 'Virality',
  },
  demand: {
    id: 'list.Demand',
    defaultMessage: 'Demand',
  },
  linked_items_count: {
    id: 'list.LinkedItems',
    defaultMessage: 'Linked items',
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
          headerName: fmtMsg(messages.title),
          field: 'title',
          checkboxSelection: true,
          headerCheckboxSelection: true,
        },
        { headerName: fmtMsg(messages.virality), field: 'virality', width: 44 },
        { headerName: fmtMsg(messages.demand), field: 'demand', width: 48 },
        { headerName: fmtMsg(messages.linked_items_count), field: 'linked_items_count', width: 48 },
        { headerName: fmtMsg(messages.type), field: 'type', width: 64 },
        { headerName: fmtMsg(messages.status), field: 'status', width: 64 },
        { headerName: fmtMsg(messages.first_seen), field: 'first_seen', width: 64 },
        { headerName: fmtMsg(messages.last_seen), field: 'last_seen', width: 64 }],
    };
  }

  getRowData() {
    return this.props.searchResults.map((i) => {
      const media = i.node;
      media.url = media.media.url;
      media.quote = media.media.quote;
      // const data = typeof media.metadata === 'string' ?
      // JSON.parse(media.metadata) : media.metadata;
      const status = getStatus(mediaStatuses(media), media.status);
      const first_seen = this.props.intl.formatRelative(MediaUtil.createdAt({
        published: media.first_seen,
      }));
      const last_seen = this.props.intl.formatRelative(MediaUtil.createdAt({
        published: media.last_seen,
      }));
      return {
        id: media.id,
        dbid: media.dbid,
        title: media.title,
        type: MediaUtil.mediaTypeLabel(media.media.type, this.props.intl),
        statusz: status.label,
        virality: media.virality,
        demand: media.demand,
        linked_items_count: media.linked_items_count,
        status: status.label,
        first_seen,
        last_seen,
        media,
      };
    });
  }

  handleClickRow = (wrapper) => {
    const { media } = wrapper.data;
    const { team } = this.props;
    const mediaUrl = media.project_id && team && media.dbid > 0
      ? `/${team.slug}/project/${media.project_id}/media/${media.dbid}`
      : null;

    browserHistory.push(mediaUrl);
  };

  handleGridReady = (params) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  };

  handleSelect = (params) => {
    if (this.props.onSelect) {
      this.props.onSelect(params.data.id);
    }
  };

  cellRenderer = () => {
    const eDiv = document.createElement('div');
    eDiv.innerHTML = '<span class="my-css-class"><button class="btn-simple">Push Me</button></span>';
    return eDiv;
  };

  render() {
    return (
      <ContentColumn wide>
        <div className="ag-theme-material" style={{ height: '500px', width: '100%' }}>
          <AgGridReact
            onGridReady={this.handleGridReady}
            columnDefs={this.state.columnDefs}
            rowData={this.getRowData()}
            rowClass="medias__item"
            rowStyle={{ cursor: 'pointer' }}
            rowSelection="multiple"
            onRowClicked={this.handleClickRow}
            onRowSelected={this.handleSelect}
            suppressCellSelection
            suppressRowClickSelection
          />
        </div>
      </ContentColumn>
    );
  }
}

export default injectIntl(List);
