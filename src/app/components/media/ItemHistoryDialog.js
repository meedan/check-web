import React from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import MediaLog from './MediaLog';

const ItemHistoryDialog = ({
  open,
  projectMedia,
  team,
  onClose,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>
      <FormattedMessage id="ItemHistoryDialog.title" defaultMessage="Item history" />
    </DialogTitle>
    <DialogContent>
      <MediaLog
        media={projectMedia}
        team={team}
      />
    </DialogContent>
  </Dialog>
);

export default ItemHistoryDialog;
