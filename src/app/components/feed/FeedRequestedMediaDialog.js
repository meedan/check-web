import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
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
import RequestCards from './RequestCards';
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';

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
    color: 'var(--textPrimary)',
  },
  dialog: {
    minHeight: '500px',
  },
  dialogTitle: {
    borderBottom: '1px solid var(--grayBorderMain)',
  },
}));

const FeedRequestedMediaDialog = ({
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
            <SmallMediaCard
              customTitle={media.quote || `${request.request_type}-${request.feed.name.replace(' ', '-')}-${media.dbid}`}
              media={media}
              details={[
                (<FormattedMessage
                  id="feedRequestedMedia.lastSubmitted"
                  defaultMessage="Last submitted {date}"
                  description="Header of medias list. Example: 3 medias"
                  values={{
                    date: (
                      <FormattedDate
                        value={request.last_submitted_at * 1000}
                        year="numeric"
                        month="short"
                        day="2-digit"
                      />
                    ),
                  }}
                />),
              ]}
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

export default createFragmentContainer(FeedRequestedMediaDialog, graphql`
  fragment FeedRequestedMediaDialog_media on Media {
    dbid
    ...SmallMediaCard_media
  }
`);
