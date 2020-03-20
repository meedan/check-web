import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DestinationProjects from './DestinationProjects';

class MoveDialog extends React.Component {
  handleDestinationProjectsLoaded() {
    this.moveDialogRef.forceUpdate();
  }

  render() {
    return (
      <Dialog
        ref={(d) => { this.moveDialogRef = d; }}
        autoScrollBodyContent
        open={this.props.open}
        onClose={this.props.handleClose}
        minWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {this.props.title}
        </DialogTitle>
        <DialogContent style={this.props.style}>
          <DestinationProjects
            include={this.props.team ? [this.props.team.slug] : null}
            projectId={this.props.projectId}
            onChange={this.props.onChange}
            onLoad={this.handleDestinationProjectsLoaded.bind(this)}
          />
        </DialogContent>
        <DialogActions>
          {this.props.actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export default MoveDialog;
