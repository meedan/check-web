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
} from '@material-ui/core';
import {
  HighlightOff as CloseIcon,
} from '@material-ui/icons';
import MediaRequests from '../../media/MediaRequests';
import MainButton from '../buttons-checkboxes-chips/MainButton';
import { MediaCardLargeQueryRenderer } from '../../media/MediaCardLarge';
import { brandBorder } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  dialog: {
    borderRadius: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  dialogContent: {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

const MediaAndRequestsDialogComponent = ({
  mediaSlug,
  projectMediaId,
  onClick,
  onClose,
  onUnmatch,
  onPin,
  variant,
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
        {mediaSlug}
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent} dividers py={0}>
        <Box maxHeight="800px">
          <Grid container>
            <Grid item xs={6}>
              <Box
                pr={2}
                style={{
                  height: '100%',
                  overflowY: 'auto',
                  borderRight: `1px solid ${brandBorder}`,
                }}
              >
                <Box my={1}>
                  { variant !== 'pinned' ?
                    <MainButton
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
                    /> : null }
                  { variant === 'confirmed' ?
                    <MainButton
                      variant="outlined"
                      label={
                        <FormattedMessage
                          id="cds.mediaAndRequestsDialog.pinAsMain"
                          defaultMessage="Pin as main"
                          description="Label for a button that lets the user set the media item they are clicking to be the 'main' one, conceptually. It replaces whatever the current main item is, and that main item becomes a child (like this one they are clicking, effectively swapping places)."
                        />
                      }
                      onClick={onPin}
                    /> : null }
                  { variant === 'confirmed' ?
                    <MainButton
                      variant="outlined"
                      label={
                        <FormattedMessage
                          id="cds.mediaAndRequestsDialog.unmatch"
                          defaultMessage="Un-match"
                          description="Label for a button that lets the user set the media item they are clicking to be _not_ matched to its parent media item."
                        />
                      }
                      onClick={onUnmatch}
                    /> : null }
                </Box>
                <MediaCardLargeQueryRenderer projectMediaId={projectMediaId} />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
                <MediaRequests media={{ dbid: projectMediaId }} />
              </div>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

MediaAndRequestsDialogComponent.propTypes = {
  mediaSlug: PropTypes.element.isRequired,
  projectMediaId: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onUnmatch: PropTypes.func.isRequired,
  onPin: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['pinned', 'confirmed', 'suggested']).isRequired,
};

export default MediaAndRequestsDialogComponent;
