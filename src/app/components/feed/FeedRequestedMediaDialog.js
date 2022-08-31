import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import ImportDialog from './ImportDialog';
import MediaCard from './MediaCard';
import RequestCards from './RequestCards';

const FeedRequestedMediaDialog = ({
  request,
  open,
  onClose,
}) => (
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
        <div>
          <ImportDialog mediaIds={[request.media.dbid]} />
          <MediaCard
            title={request.media.quote}
            description={request.media.quote}
            url={request.media.url}
            pictire={request.media.picture}
            details={[
              request.media.type,
              request.last_submitted_at,
            ]}
          />
        </div>
        <RequestCards request={request} />
      </Box>
    </DialogContent>
  </Dialog>
);

FeedRequestedMediaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default createFragmentContainer(FeedRequestedMediaDialog, graphql`
  fragment FeedRequestedMediaDialog_request on Request {
    media {
      dbid
      quote
      picture
      url
      type
    }
    last_submitted_at
    ...RequestCards_request
  }
`);
