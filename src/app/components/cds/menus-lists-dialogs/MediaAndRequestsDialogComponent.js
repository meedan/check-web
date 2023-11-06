import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from '@material-ui/core';
import IconClose from '../../../icons/clear.svg';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import MediaRequests from '../../media/MediaRequests';
import { MediaCardLargeQueryRenderer } from '../../media/MediaCardLarge';

const useStyles = makeStyles(theme => ({
  dialog: {
    borderRadius: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(2),
  },
  shut: {
    position: 'relative',

    '&::after': {
      content: '\'\'',
      backgroundColor: 'var(--brandBorder)',
      position: 'absolute',
      left: '50%',
      top: '0',
      bottom: '0',
      width: '1px',
    },
  },
  mediaColumn: {
    height: '100%',
    maxHeight: '700px',
    overflowY: 'auto',
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  requestsColumn: {
    maxHeight: '700px',
    overflowY: 'auto',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
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
        <ButtonMain variant="text" size="small" theme="text" iconCenter={<IconClose />} onClick={onClose} className={classes.closeButton} />
      </DialogTitle>
      <DialogContent dividers py={0} className={classes.dialogContent}>
        <Grid container className={classes.shut}>
          <Grid item xs={6} className={classes.mediaColumn}>
            <MediaCardLargeQueryRenderer projectMediaId={projectMediaId} />
          </Grid>
          <Grid item xs={6} className={classes.requestsColumn}>
            <MediaRequests media={{ dbid: projectMediaId }} />
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
