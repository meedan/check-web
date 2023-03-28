import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import {
  Box,
  Checkbox,
} from '@material-ui/core';
import ImportDialog from './ImportDialog';
import FeedRequestedMediaDialog from './FeedRequestedMediaDialog'; // eslint-disable-line no-unused-vars
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';

const FeedRequestedMedia = ({ request }) => {
  const [expandedMedia, setExpandedMedia] = React.useState(null);
  const [selectedMediaIds, setSelectedMediaIds] = React.useState([]);
  const [importMediaId, setImportMediaId] = React.useState(null);

  React.useEffect(() => {
    if (importMediaId) {
      const importButton = document.querySelector('.import-dialog__button');
      importButton?.click();
    }
  });

  const handleClose = (e) => {
    setExpandedMedia(null);
    e.stopPropagation();
  };

  const handleSelectAllCheckbox = () => {
    setImportMediaId(null);
    if (selectedMediaIds.length) {
      setSelectedMediaIds([]);
    } else {
      setSelectedMediaIds(request.medias.edges.map(m => m.node.dbid));
    }
  };

  const handleMediaCheckbox = (e, mediaDbid) => {
    setImportMediaId(null);
    const newSelectedMediaIds = [...selectedMediaIds];
    if (e.target.checked) {
      newSelectedMediaIds.push(mediaDbid);
    } else {
      const index = newSelectedMediaIds.indexOf(mediaDbid);
      newSelectedMediaIds.splice(index, 1);
    }
    setSelectedMediaIds(newSelectedMediaIds);
  };

  const handleImportClickFromChild = (mediaId) => {
    setImportMediaId(mediaId);
    setSelectedMediaIds([mediaId]);
  };

  const handleImport = (e) => {
    setExpandedMedia(null);
    handleImportClickFromChild(expandedMedia.dbid);
    e.stopPropagation();
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
                values={{ mediasCount: request.medias_count }}
              />
            </strong>
          </Box>
          <ImportDialog mediaIds={selectedMediaIds} importedTitlePrefix={`${request.request_type}-${request.feed.name.replace(' ', '-')}-`} />
        </Box>
        { request.medias?.edges.map((m, index) => (
          <Box key={m.node.dbid} display="flex" alignItems="center">
            <Checkbox
              id={`feed-requested-media-${m.node.dbid}`}
              checked={selectedMediaIds.includes(m.node.dbid)}
              onChange={e => handleMediaCheckbox(e, m.node.dbid, index)}
            />
            { /* FIXME: Find the optimal way of passing props to SmallMediaCard for the sake of reusability (details?) */ }
            <SmallMediaCard
              customTitle={m.node.quote || `${request.request_type}-${request.feed.name.replace(' ', '-')}-${m.node.dbid}`}
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
              media={m.node}
              onClick={() => { setExpandedMedia(m.node); }}
            />
          </Box>
        )) }
      </div>
      { expandedMedia ?
        <FeedRequestedMediaDialog
          open={Boolean(expandedMedia)}
          media={expandedMedia}
          request={request}
          onClose={handleClose}
          onImport={handleImport}
        />
        : null
      }
    </React.Fragment>
  );
};

export { FeedRequestedMedia };
export default createFragmentContainer(FeedRequestedMedia, graphql`
  fragment FeedRequestedMedia_request on Request {
    dbid
    request_type
    medias_count
    last_submitted_at
    feed {
      name
    }
    medias(first: 100) {
      edges {
        node {
          dbid
          ...SmallMediaCard_media
          ...FeedRequestedMediaDialog_media
        }
      }
    }
  }
`);
