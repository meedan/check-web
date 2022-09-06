import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
} from '@material-ui/core';
import FeedRequestedMediaDialog from './FeedRequestedMediaDialog';
import ExternalLink from '../ExternalLink';
import { brandSecondary, black54 } from '../../styles/js/shared';

// Modelled after src/app/components/media/Similarity/MediaItem.js

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    border: `1px solid ${brandSecondary}`,
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  image: {
    height: 96,
    width: 96,
    objectFit: 'cover',
    border: `1px solid ${brandSecondary}`,
    marginRight: theme.spacing(1),
  },
  url: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  title: {
    fontWeight: 500,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  details: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: black54,
  },
  description: {
    marginTop: theme.spacing(1),
  },
}));

const MediaCardCondensed = ({
  title,
  details,
  description,
  picture,
  url,
  media,
  request,
}) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const classes = useStyles();
  const defaultImage = '/images/image_placeholder.svg';
  const subtitleDetails = details.map((d, index) => (
    <span key={d}>
      { index > 0 ? ' • ' : null }
      {d}
    </span>
  ));

  return (
    <Box
      className={classes.root}
      onClick={() => setOpenDialog(true)}
    >
      <Box display="flex">
        {
          picture ?
            <img
              alt=""
              className={classes.image}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              src={media?.picture || picture}
            /> : null
        }
        <div>
          <div className={classes.title}>{ title || media?.quote || media.metadata.title}</div>
          <div className={classes.details}>{ subtitleDetails }</div>
          { url ? <div className={classes.url}><ExternalLink url={media?.url || url} /></div> : null }
          <div className={classes.description}>{ media?.quote || description }</div>
        </div>
      </Box>
      { openDialog ?
        <FeedRequestedMediaDialog
          open
          media={media}
          request={request}
          onClose={() => setOpenDialog(false)}
        />
        : null
      }
    </Box>
  );
};

MediaCardCondensed.propTypes = {
  title: PropTypes.string,
  details: PropTypes.array,
  description: PropTypes.string,
  picture: PropTypes.string,
  url: PropTypes.string,
};

MediaCardCondensed.defaultProps = {
  title: null,
  details: null,
  description: null,
  picture: null,
  url: null,
};

export default createFragmentContainer(MediaCardCondensed, graphql`
  fragment MediaCardCondensed_media on Media {
    quote
    picture
    url
    metadata
    ...FeedRequestedMediaDialog_media
  }
`);
