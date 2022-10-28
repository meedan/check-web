import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
} from '@material-ui/core';
import FeedRequestedMediaDialog from './FeedRequestedMediaDialog';
import ExternalLink from '../ExternalLink';
import ParsedText from '../ParsedText';
import BulletSeparator from '../layout/BulletSeparator';
import { brandSecondary } from '../../styles/js/shared';

// Modelled after src/app/components/media/Similarity/MediaItem.js

const useStyles = makeStyles(theme => ({
  root: {
    cursor: 'pointer',
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
    marginRight: theme.spacing(1.5),
  },
  text: {
    overflow: 'hidden',
  },
  url: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    lineHeight: '143%',
  },
  title: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
    lineHeight: '150%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  description: {
    marginTop: theme.spacing(0.5),
    maxHeight: '20px',
    lineHeight: '143%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
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
  onImport,
}) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const classes = useStyles();
  const defaultImage = '/images/image_placeholder.svg';

  const handleClose = (e) => {
    setOpenDialog(false);
    e.stopPropagation();
  };

  const handleImport = (e) => {
    setOpenDialog(false);
    onImport(media.dbid);
    e.stopPropagation();
  };

  return (
    <Box
      className={classes.root}
      onClick={() => setOpenDialog(true)}
    >
      <Box display="flex">
        {
          media?.picture || picture || media.type === 'UploadedAudio' ?
            <img
              alt=""
              className={classes.image}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              src={media?.picture || picture || defaultImage}
            /> : null
        }
        <div className={classes.text}>
          <div className={classes.title}>{title || media?.quote || media.metadata.title}</div>
          <BulletSeparator details={details} />
          { media?.url || url ? <div className={classes.url}><ExternalLink url={media?.url || url} maxUrlLength={60} /></div> : null }
          <div className={classes.description}>
            <ParsedText text={description || media.metadata?.description || media.quote} />
          </div>
        </div>
      </Box>
      { openDialog ?
        <FeedRequestedMediaDialog
          open={openDialog}
          media={media}
          request={request}
          onClose={handleClose}
          onImport={handleImport}
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
  details: [],
  description: null,
  picture: null,
  url: null,
};

export { MediaCardCondensed };
export default createFragmentContainer(MediaCardCondensed, graphql`
  fragment MediaCardCondensed_media on Media {
    dbid
    type
    quote
    picture
    url
    metadata
    ...FeedRequestedMediaDialog_media
  }
`);
