import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import SystemUpdateAltOutlinedIcon from '@material-ui/icons/SystemUpdateAltOutlined';
import MediaCard from './MediaCard';
import RequestCards from './RequestCards';

const FeedRequestedMediaDialog = ({
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
          <Button
            color="primary"
            variant="contained"
            size="small"
            startIcon={<SystemUpdateAltOutlinedIcon />}
          >
            <FormattedMessage
              id="feedRequestedMedia.import"
              defaultMessage="Import"
              description="Button label for importing media into workspace action"
            />
          </Button>
          <MediaCard
            title="Hello hello I dont know why you say goodbye"
            description={`You say, "Goodbye" and I say, "Hello, hello, hello"
              I don't know why you say, "Goodbye", I say, "Hello, hello, hello"
              I don't know why you say, "Goodbye", I say, "Hello"
              I say, "High", you say, "Low"
            `}
            url="http://www.applemusic.com"
            details={[
              'Song',
              'The Beatles',
              'Released 1967',
            ]}
          />
        </div>
        <RequestCards />
      </Box>
    </DialogContent>
  </Dialog>
);

FeedRequestedMediaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FeedRequestedMediaDialog;
