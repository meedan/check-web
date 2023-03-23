import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
} from '@material-ui/core';
import {
  HighlightOff as CloseIcon,
} from '@material-ui/icons';
import MediaRequests from '../../media/MediaRequests';
import { MediaCardLargeQueryRenderer } from '../../media/MediaCardLarge';
import { brandBorder } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  dialog: {
    borderRadius: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(2),
  },
  mediaColumn: {
    height: '100%',
    maxHeight: '700px',
    overflowY: 'auto',
    borderRight: `1px solid ${brandBorder}`,
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  requestsColumn: {
    maxHeight: '700px',
    overflowY: 'auto',
  },
  dialogContent: {
    padding: `0 ${theme.spacing(3)}px`,
  },
  dialogTitle: {
    maxWidth: 'calc(100% - 24px)',
  },
}));

const MediaAndRequestsDialogComponent = ({
  mediaSlug,
  projectMediaId,
  onClick,
  onClose,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      open={projectMediaId}
      onClick={onClick}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ classes: { root: classes.dialog } }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {mediaSlug}
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers py={0} className={classes.dialogContent}>
        <Grid container>
          <Grid item xs={6}>
            <div className={classes.mediaColumn}>
              <MediaCardLargeQueryRenderer projectMediaId={projectMediaId} />
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.requestsColumn}>
              <MediaRequests media={{ dbid: projectMediaId }} />
            </div>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

MediaAndRequestsDialogComponent.propTypes = {
  mediaSlug: PropTypes.element.isRequired,
  projectMediaId: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MediaAndRequestsDialogComponent;
