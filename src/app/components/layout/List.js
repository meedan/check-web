import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import styled from 'styled-components';
import MediaCell from '../media/MediaCell';
import MediaUtil from '../media/MediaUtil';
import { ContentColumn, units } from '../../styles/js/shared';
import { getStatus } from '../../helpers';
import { mediaStatuses } from '../../customHelpers';

const StyledGridContainer = styled.div`
  width: 100%;
  height: calc(100vh - ${units(30)});
`;

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
          cellRenderer: 'mediaCellRenderer',
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
      const {
        id,
        dbid,
        picture,
        title,
        description,
        virality,
        demand,
        linked_items_count,
        type,
        status,
        first_seen,
        last_seen,
      } = media;

      const statusObj = getStatus(mediaStatuses(media), status);

      const formatted_first_seen = this.props.intl.formatRelative(MediaUtil.createdAt({
        published: first_seen,
      }));

      const formatted_last_seen = this.props.intl.formatRelative(MediaUtil.createdAt({
        published: last_seen,
      }));

      return {
        id,
        dbid,
        picture,
        title,
        description,
        type: MediaUtil.mediaTypeLabel(type, this.props.intl),
        virality,
        demand,
        linked_items_count,
        status: statusObj.label,
        first_seen: formatted_first_seen,
        last_seen: formatted_last_seen,
        media,
        query: i.itemQuery,
      };
    });
  }

  handleClickRow = (wrapper) => {
    const { media, query } = wrapper.data;
    const { team } = this.props;
    const mediaUrl = media.project_id && team && media.dbid > 0
      ? `/${team.slug}/project/${media.project_id}/media/${media.dbid}`
      : null;
    this.context.router.push({ pathname: mediaUrl, state: { query } });
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

  render() {
    return (
      <ContentColumn wide>
        <StyledGridContainer className="ag-theme-material">
          <AgGridReact
            columnDefs={this.state.columnDefs}
            frameworkComponents={{ mediaCellRenderer: MediaCell }}
            rowData={this.getRowData()}
            onGridReady={this.handleGridReady}
            onRowClicked={this.handleClickRow}
            onRowSelected={this.handleSelect}
            rowClass="medias__item"
            rowStyle={{ cursor: 'pointer' }}
            rowHeight="96"
            rowSelection="multiple"
            suppressCellSelection
            suppressRowClickSelection
          />
        </StyledGridContainer>
      </ContentColumn>
    );
  }
}

List.contextTypes = {
  router: PropTypes.object,
};

export default injectIntl(List);
