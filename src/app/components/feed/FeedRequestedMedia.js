import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Checkbox,
} from '@material-ui/core';
import ImportDialog from './ImportDialog';
import MediaCardCondensed from './MediaCardCondensed';

const medias = [
  { title: 'bla' },
  { title: 'ble' },
  { title: 'bli' },
  { title: 'blo' },
];

const FeedRequestedMedia = () => (
  <React.Fragment>
    <div id="feed-requested-media">
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Checkbox />
          <strong>
            <FormattedMessage
              id="feedRequestedMedia.numberOfMedias"
              defaultMessage="{mediasCount, plural, one {# media} other {# medias}}"
              description="Header of medias list. Example: 3 medias"
              values={{ mediasCount: medias.length }}
            />
          </strong>
        </Box>
        <ImportDialog teams={[]} />
      </Box>
      { medias.map(m => (
        <Box display="flex">
          <Checkbox />
          <MediaCardCondensed
            title={`Video foi manipulado para sugerir que ${m.title}`}
            details={[
              'Text',
              'Last submitted Jan 22, 2022',
              '25 requests',
            ]}
            picture="https://i.imgur.com/0ndhEaM.png"
            url="https://i.imgur.com/0ndhEaM.png"
            description="Highly effective yes they are. Science is good."
          />
        </Box>
      )) }
    </div>
  </React.Fragment>
);

export default FeedRequestedMedia;
