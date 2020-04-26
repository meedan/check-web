import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DestinationProjects from './DestinationProjects';

const MoveDialog = props => (
  <Dialog
    open={props.open}
    onClose={props.handleClose}
    minWidth="sm"
    fullWidth
  >
    <DialogTitle>
      {props.title}
    </DialogTitle>
    <DialogContent style={props.style}>
      <DestinationProjects
        include={props.team ? [props.team.slug] : null}
        projectId={props.projectId}
        onChange={props.onChange}
      />
    </DialogContent>
    <DialogActions>
      {props.actions}
    </DialogActions>
  </Dialog>
);

export default MoveDialog;
