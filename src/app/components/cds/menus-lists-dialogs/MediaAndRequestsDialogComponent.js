import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@material-ui/core';
import {
  HighlightOff as CloseIcon,
} from '@material-ui/icons';
import MediaExpanded from '../../media/MediaExpanded';
import MediaRequests from '../../media/MediaRequests';
import MainButton from '../buttons-checkboxes-chips/MainButton';

const useStyles = makeStyles(theme => ({
  dialog: {
    borderRadius: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  innerBox: {
    borderRadius: theme.spacing(1),
  },
  dialogTitle: {
    paddingTop: 0,
  },
}));

const MediaAndRequestsDialogComponent = ({
  projectMediaId,
  onClick,
  onClose,
  onUnmatch,
  onPin,
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
      <DialogTitle>
        <Typography variant="h6">
          <FormattedMessage
            id="cds.mediaAndRequestsDialog.matchedMedia"
            defaultMessage="Media"
            description="Plural. Heading for the number of media"
          />
        </Typography>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogTitle} dividers py={0}>
        <Grid container>
          <Grid item xs={6}>
            <Box my={1}>
              <MainButton
                className={classes.button}
                variant="outlined"
                label={
                  <FormattedMessage
                    id="cds.mediaAndRequestsDialog.openMedia"
                    defaultMessage="Open media"
                    description="Singular. Label for a button that opens the media item the user is currently viewing."
                  />
                }
                onClick={() => {
                  const url = window.location.pathname.replace(/\/media\/\d+/, `/media/${projectMediaId}`);
                  browserHistory.push(url);
                }}
              />
              <MainButton
                variant="outlined"
                className={classes.button}
                label={
                  <FormattedMessage
                    id="cds.mediaAndRequestsDialog.pinAsMain"
                    defaultMessage="Pin as main"
                    description="Label for a button that lets the user set the media item they are clicking to be the 'main' one, conceptually. It replaces whatever the current main item is, and that main item becomes a child (like this one they are clicking, effectively swapping places)."
                  />
                }
                onClick={onPin}
              />
              <MainButton
                variant="outlined"
                className={classes.button}
                label={
                  <FormattedMessage
                    id="cds.mediaAndRequestsDialog.unmatch"
                    defaultMessage="Un-match"
                    description="Label for a button that lets the user set the media item they are clicking to be _not_ matched to its parent media item."
                  />
                }
                onClick={onUnmatch}
              />
            </Box>
            <Paper
              elevation={0}
              variant="outlined"
              className={classes.innerBox}
            >
              <MediaExpanded
                media={{ dbid: projectMediaId }}
                hideActions
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <MediaRequests media={{ dbid: projectMediaId }} />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

MediaAndRequestsDialogComponent.propTypes = {
  projectMediaId: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onUnmatch: PropTypes.func.isRequired,
  onPin: PropTypes.func.isRequired,
};

export default MediaAndRequestsDialogComponent;
