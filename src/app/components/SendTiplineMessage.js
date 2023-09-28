import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import SendIcon from '../icons/send.svg';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';

const SendTiplineMessage = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <>
      <ButtonMain
        iconCenter={<SendIcon />}
        variant="outlined"
        size="default"
        theme="text"
        onClick={() => setDialogOpen(true)}
      />
      <Dialog open={dialogOpen}>
        <DialogTitle>
          Hello Title
        </DialogTitle>
        <DialogContent>
          Hello Content
        </DialogContent>
        <DialogActions>
          Hello Actions
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SendTiplineMessage;
