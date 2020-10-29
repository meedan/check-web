import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import MediaLog from './MediaLog';

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

const ItemHistoryDialog = ({
  open,
  projectMedia,
  team,
  onClose,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <FormattedMessage id="ItemHistoryDialog.title" defaultMessage="Item history" />
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <MediaLog
          media={projectMedia}
          team={team}
        />
      </DialogContent>
    </Dialog>
  );
};

ItemHistoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  projectMedia: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ItemHistoryDialog;
