import React from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import DestinationProjects from './DestinationProjects';

class MoveDialog extends React.Component {
  handleDestinationProjectsLoaded() {
    this.moveDialogRef.forceUpdate();
  }

  render() {
    return (
      <Dialog
        ref={(d) => { this.moveDialogRef = d; }}
        actions={this.props.actions}
        autoScrollBodyContent
        open={this.props.open}
        onRequestClose={this.props.handleClose}
      >
        <h4 className="move-dialog-header">
          <FormattedMessage
            id="moveDialog.header"
            defaultMessage="Move to a different project"
          />
        </h4>
        <DestinationProjects
          team={this.props.team}
          projectId={this.props.projectId}
          onChange={this.props.onChange}
          onLoad={this.handleDestinationProjectsLoaded.bind(this)}
        />
      </Dialog>
    );
  }
}

export default MoveDialog;
