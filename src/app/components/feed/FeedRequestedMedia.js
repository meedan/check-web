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
      setSelectedMediaIds(request.medias.edges.map(m => m.node.dbid));
    }
  };

  const handleMediaCheckbox = (e, mediaDbid, index) => {
    const newSelectedMediaIds = [...selectedMediaIds];
    if (e.target.checked) {
      newSelectedMediaIds.push(mediaDbid);
    } else {
      newSelectedMediaIds.splice(index, 1);
    }
    setSelectedMediaIds(newSelectedMediaIds);
  };

  return (
    <React.Fragment>
      <div id="feed-requested-media">
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={selectedMediaIds.length === request.medias.edges.length}
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
        { request.medias?.edges.map((m, index) => (
          <Box key={m.node.dbid} display="flex">
            <Checkbox
              checked={selectedMediaIds.includes(m.node.dbid)}
              onChange={e => handleMediaCheckbox(e, m.node.dbid, index)}
            />
            <MediaCardCondensed
              title={m.node.quote}
              details={[
                m.node.type,
                request.last_submitted_at,
                request.requests_count,
              ]}
              picture={m.node.picture}
              url={m.node.url}
              description={m.node.quote}
              requestDbid={request.dbid}
              mediaDbid={m.node.dbid}
            />
          </Box>
        )) }
      </div>
    </React.Fragment>
  );
};


export default createFragmentContainer(FeedRequestedMedia, graphql`
  fragment FeedRequestedMedia_request on Request {
    dbid
    medias(first: 50) {
      edges {
        node {
          dbid
          quote
          picture
          url
          type
        }
      }
    }
    last_submitted_at
    requests_count
  }
`);
