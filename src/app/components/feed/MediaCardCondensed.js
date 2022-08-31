import React from 'react';
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
              src={picture}
            /> : null
        }
        <div>
          <div className={classes.title}>{ title }</div>
          <div className={classes.details}>{ subtitleDetails }</div>
          { url ? <div className={classes.url}><ExternalLink url={url} /></div> : null }
          <div className={classes.description}>{ description }</div>
        </div>
      </Box>
      <FeedRequestedMediaDialog
        request={request}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </Box>
  );
};

MediaCardCondensed.propTypes = {
  title: PropTypes.string.isRequired,
  details: PropTypes.array.isRequired,
  description: PropTypes.string.isRequired,
  picture: PropTypes.string,
  url: PropTypes.string,
};

MediaCardCondensed.defaultProps = {
  picture: null,
  url: null,
};

export default MediaCardCondensed;
