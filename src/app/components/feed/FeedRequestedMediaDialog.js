import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import { ImportButton } from './ImportDialog';
import MediaCard from './MediaCard';
import RequestCards from './RequestCards';
import MediaTypeDisplayName from '../media/MediaTypeDisplayName';
import { separationGray, textPrimary } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  column: {
    width: '50%',
  },
  separator: {
    width: '16px',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: textPrimary,
  },
  dialog: {
    minHeight: '500px',
  },
  dialogTitle: {
    borderBottom: `1px solid ${separationGray}`,
  },
}));

const FeedRequestedMediaDialog = ({
  intl,
  open,
  media,
  request,
  onClose,
  onImport,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      classes={{ paper: classes.dialog }}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle classes={{ root: classes.dialogTitle }}>
        <FormattedMessage
          id="feedRequestedMediaDialog.title"
          defaultMessage="Import medias and requests"
          description="Dialog title for importing medias and requests"
        />
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CancelOutlinedIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="space-between">
          <div className={classes.column}>
            <ImportButton onClick={onImport} />
            <MediaCard
              details={[
                <MediaTypeDisplayName mediaType={media.type} />,
                intl.formatDate(request.last_submitted_at, { year: 'numeric', month: 'short', day: '2-digit' }),
              ]}
              media={media}
            />
          </div>
          <div className={classes.separator} />
          <div className={classes.column}>
            <RequestCards requestDbid={request.dbid} mediaDbid={media.dbid} />
          </div>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

FeedRequestedMediaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default createFragmentContainer(injectIntl(FeedRequestedMediaDialog), graphql`
  fragment FeedRequestedMediaDialog_media on Media {
    dbid
    type
    ...MediaCard_media
  }
`);
