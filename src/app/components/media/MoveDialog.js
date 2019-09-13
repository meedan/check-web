import React from 'react';
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
        bodyStyle={this.props.style}
      >
        <h4 className="move-dialog-header">
          {this.props.title}
        </h4>
        <DestinationProjects
          include={this.props.team ? [this.props.team.slug] : null}
          projectId={this.props.projectId}
          onChange={this.props.onChange}
          onLoad={this.handleDestinationProjectsLoaded.bind(this)}
        />
      </Dialog>
    );
  }
}

export default MoveDialog;
