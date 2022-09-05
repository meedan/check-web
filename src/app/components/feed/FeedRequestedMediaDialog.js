/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
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
import ErrorBoundary from '../error/ErrorBoundary';

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
        <div className="feed-requested-media-dialog__media-column">
          <ImportDialog mediaIds={[request.media.dbid]} />
          <MediaCard
            title={request.media.quote}
            description={request.media.quote}
            url={request.media.url}
            picture={request.media.picture}
            details={[
              request.media.type,
              request.last_submitted_at,
            ]}
            media={request.media}
          />
        </div>
        <RequestCards requestDbid={request.dbid} mediaDbid={request.media.dbid} />
      </Box>
    </DialogContent>
  </Dialog>
);

FeedRequestedMediaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const FeedRequestedMediaDialogQuery = ({ requestDbid, mediaDbid, ...parentProps }) => (
  <ErrorBoundary component="FeedRequestedMediaDialog">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedRequestedMediaDialogQuery($requestId: ID!, $mediaId: Int!) {
          request(id: $requestId) {
            dbid
            media {
              dbid
              quote
              picture
              url
              type
              ...MediaCard_media
            }
            last_submitted_at
            similar_requests(first: 50, media_id: $mediaId) {
              edges {
                node {
                  dbid
                  content
                  last_submitted_at
                }
              }
            }
          }
        }
      `}
      variables={{
        requestId: requestDbid,
        mediaId: mediaDbid,
      }}
      render={({ props, error }) => {
        if (props && !error) {
          return (<FeedRequestedMediaDialog request={props.request} {...parentProps} />);
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

export default FeedRequestedMediaDialogQuery;
