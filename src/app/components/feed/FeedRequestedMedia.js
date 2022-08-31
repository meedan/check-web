import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Checkbox,
} from '@material-ui/core';
import ImportDialog from './ImportDialog';
import FeedRequestedMediaDialog from './FeedRequestedMediaDialog'; // eslint-disable-line no-unused-vars
import MediaCardCondensed from './MediaCardCondensed';

const FeedRequestedMedia = ({ request }) => {
  const [selectedMediaIds, setSelectedMediaIds] = React.useState([]);

  const handleSelectAllCheckbox = () => {
    if (selectedMediaIds.length) {
      setSelectedMediaIds([]);
    } else {
      setSelectedMediaIds([request.media.dbid]);
    }
  };

  const handleMediaCheckbox = (e) => {
    const newSelectedMediaIds = [...selectedMediaIds];
    if (e.target.checked) {
      newSelectedMediaIds.push(request.media.dbid);
    } else {
      newSelectedMediaIds.splice(0, 1); // FIXME splice at the right index when multiple media listed
    }
    setSelectedMediaIds(newSelectedMediaIds);
  };

  return (
    <React.Fragment>
      <div id="feed-requested-media">
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={selectedMediaIds.includes(request.media.dbid)}
              onChange={handleSelectAllCheckbox}
            />
            <strong>
              <FormattedMessage
                id="feedRequestedMedia.numberOfMedias"
                defaultMessage="{mediasCount, plural, one {# media} other {# medias}}"
                description="Header of medias list. Example: 3 medias"
                values={{ mediasCount: 1 }}
              />
            </strong>
          </Box>
          <ImportDialog mediaIds={selectedMediaIds} />
        </Box>
        <Box key={request.media.dbid} display="flex">
          <Checkbox
            checked={selectedMediaIds.includes(request.media.dbid)}
            onChange={handleMediaCheckbox}
          />
          <MediaCardCondensed
            title={request.media.quote}
            details={[
              request.media.type,
              request.last_submitted_at,
              request.requests_count,
            ]}
            picture={request.media.picture}
            url={request.media.url}
            description={request.media.quote}
            request={request}
          />
        </Box>
      </div>
    </React.Fragment>
  );
};


export default createFragmentContainer(FeedRequestedMedia, graphql`
  fragment FeedRequestedMedia_request on Request {
    media {
      dbid
      quote
      picture
      url
      type
    }
    last_submitted_at
    requests_count
    ...FeedRequestedMediaDialog_request
  }
`);
