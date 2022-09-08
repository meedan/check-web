import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import {
  Box,
  Checkbox,
} from '@material-ui/core';
import ImportDialog from './ImportDialog';
import FeedRequestedMediaDialog from './FeedRequestedMediaDialog'; // eslint-disable-line no-unused-vars
import MediaCardCondensed from './MediaCardCondensed';

const FeedRequestedMedia = ({ request }) => {
  const [selectedMediaIds, setSelectedMediaIds] = React.useState([]);
  const [importMediaId, setImportMediaId] = React.useState(null);

  React.useEffect(() => {
    if (importMediaId) {
      const importButton = document.querySelector('.import-dialog__button');
      importButton?.click();
    }
  });

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

  const handleImportClickFromChild = (mediaId) => {
    setImportMediaId(mediaId);
    setSelectedMediaIds([mediaId]);
  };

  return (
    <React.Fragment>
      <div id="feed-requested-media">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" height="48px">
            <Checkbox
              checked={selectedMediaIds.length === request.medias.edges.length}
              onChange={handleSelectAllCheckbox}
            />
            <strong>
              <FormattedMessage
                id="feedRequestedMedia.numberOfMedias"
                defaultMessage="{mediasCount, plural, one {# media} other {# medias}}"
                description="Header of medias list. Example: 3 medias"
                values={{ mediasCount: request.medias?.edges.length }}
              />
            </strong>
          </Box>
          <ImportDialog mediaIds={selectedMediaIds} />
        </Box>
        { request.medias?.edges.map((m, index) => (
          <Box key={m.node.dbid} display="flex" alignItems="center">
            <Checkbox
              id={`feed-requested-media-${m.node.dbid}`}
              checked={selectedMediaIds.includes(m.node.dbid)}
              onChange={e => handleMediaCheckbox(e, m.node.dbid, index)}
            />
            { /* FIXME: Find the optimal way of passing props to MediaCardCondensed for the sake of reusability  */ }
            <MediaCardCondensed
              details={[
                m.node.type,
                (<FormattedMessage
                  id="feedRequestedMedia.lastSubmitted"
                  defaultMessage="Last submitted {date}"
                  description="Header of medias list. Example: 3 medias"
                  values={{
                    date: (
                      <FormattedDate
                        value={request.last_submitted_at}
                        year="numeric"
                        month="short"
                        day="2-digit"
                      />
                    ),
                  }}
                />),
                (<FormattedMessage
                  id="feedRequestedMedia.requestCount"
                  defaultMessage="{requestCount, plural, one {# request} other {# requests}}"
                  description="Header of verification requests for this media. Example: 3 requests"
                  values={{ requestCount: request.requests_count }}
                />),
              ]}
              media={m.node}
              request={request}
              onImport={handleImportClickFromChild}
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
          type
          ...MediaCardCondensed_media
        }
      }
    }
    last_submitted_at
    requests_count
  }
`);
