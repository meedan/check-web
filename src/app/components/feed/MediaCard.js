import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { makeStyles } from '@material-ui/core/styles';
import MediaPreview from './MediaPreview';
import ExternalLink from '../ExternalLink';
import ParsedText from '../ParsedText';
import BulletSeparator from '../layout/BulletSeparator';
import { brandSecondary } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    border: `1px solid ${brandSecondary}`,
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    padding: theme.spacing(2),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  title: {
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '24px',
  },
  description: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  url: {
    marginBottom: theme.spacing(2),
  },
}));

const MediaCard = ({
  title,
  details,
  description,
  url,
  media,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <ParsedText text={title || media.quote || media.metadata?.title} />
      </div>
      <BulletSeparator details={details} />
      <div className={classes.description}>
        <ParsedText text={description || media.metadata?.description || media.quote} />
      </div>
      { url || media.url ?
        <div className={classes.url}>
          <ExternalLink url={url || media.url} />
        </div>
        : null
      }
      <MediaPreview media={media} />
    </div>
  );
};

MediaCard.propTypes = {
  title: PropTypes.string,
  details: PropTypes.array.isRequired,
  description: PropTypes.string,
  url: PropTypes.string,
};

MediaCard.defaultProps = {
  title: null,
  description: null,
  url: null,
};

export default createFragmentContainer(MediaCard, graphql`
  fragment MediaCard_media on Media {
    quote
    url
    metadata
    ...MediaPreview_media
  }
`);
