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

const SuggestedMediaDialogComponent = ({
  projectMediaId,
  onClick,
  onClose,
  isOpen,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      open={isOpen}
      onClick={onClick}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ classes: { root: classes.dialog } }}
    >
      <DialogTitle>
        <FormattedMessage
          id="cds.mediaAndRequestsDialog.matchedMedia"
          defaultMessage="Media"
          description="Plural. Heading for the number of media"
        />
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

SuggestedMediaDialogComponent.propTypes = {
  projectMediaId: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default SuggestedMediaDialogComponent;
