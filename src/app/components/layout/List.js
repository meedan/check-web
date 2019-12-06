import React from 'react';
import { injectIntl } from 'react-intl';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import MediaUtil from '../media/MediaUtil';
import { ContentColumn } from '../../styles/js/shared';
import { getStatus } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [
        { headerName: 'Make', field: 'make' },
        // { headerName: 'Virality', field: 'model' },
        // { headerName: 'Demand', field: 'model' },
        // { headerName: 'Linked Items', field: 'model' },
        { headerName: 'Type', field: 'type' },
        { headerName: 'Status', field: 'status' },
        { headerName: 'First Seen', field: 'model' },
        { headerName: 'Last Seen', field: 'price' }],
    };
  }

  getRowData() {
    return this.props.searchResults.map((i) => {
      // console.log('i', i);
      const media = i.node;
      media.url = media.media.url;
      media.quote = media.media.quote;
      const data = typeof media.metadata === 'string' ? JSON.parse(media.metadata) : media.metadata;
      const status = getStatus(mediaStatuses(media), mediaLastStatus(media));
      return {
        make: MediaUtil.title(media, data, this.props.intl),
        type: media.media.type,
        status: status.label,
      };
    });
  }

  render() {
    // console.log('getRowData', this.getRowData());
    return (
      <ContentColumn wide>
        <div className="ag-theme-material" style={{ height: '500px', width: '100%' }}>
          <AgGridReact
            columnDefs={this.state.columnDefs}
            rowData={this.getRowData()}
          />
        </div>
      </ContentColumn>
    );
  }
}

export default injectIntl(List);
