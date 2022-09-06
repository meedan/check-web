import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ImportDialog from './ImportDialog';
import MediaCard from './MediaCard';
import RequestCards from './RequestCards';

const useStyles = makeStyles({
  column: {
    width: '50%',
  },
  separator: {
    width: '16px',
  },
});

const FeedRequestedMediaDialog = ({
  intl,
  open,
  media,
  request,
  onClose,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <FormattedMessage
          id="feedRequestedMediaDialog.title"
          defaultMessage="Import medias and requests"
          description="Dialog title for importing medias and requests"
        />
      </DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="space-between">
          <div className={classes.column}>
            <ImportDialog mediaIds={[media.dbid]} />
            <MediaCard
              details={[
                media.type,
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
