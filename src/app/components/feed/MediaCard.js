import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { makeStyles } from '@material-ui/core/styles';
import MediaPreview from './MediaPreview';
import ExternalLink from '../ExternalLink';
import ParsedText from '../ParsedText';
import { brandSecondary, black54 } from '../../styles/js/shared';

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
    marginBottom: theme.spacing(2),
  },
  details: {
    color: black54,
    marginBottom: theme.spacing(2),
  },
  description: {
    marginBottom: theme.spacing(2),
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
  const subtitleDetails = details.map((d, index) => (
    <span key={d}>
      { index > 0 ? ' • ' : null }
      {d}
    </span>
  ));

  console.log('media', media); // eslint-disable-line

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <ParsedText text={title || media.quote} />
      </div>
      <div className={classes.details}>{subtitleDetails}</div>
      <div className={classes.description}>
        <ParsedText text={description || media.metadata?.description} />
      </div>
      { url ?
        <div className={classes.url}>
          <ExternalLink url={url} />
        </div>
        : null
      }
      <MediaPreview media={media} />
    </div>
  );
};

MediaCard.propTypes = {
  title: PropTypes.string.isRequired,
  details: PropTypes.array.isRequired,
  description: PropTypes.string.isRequired,
  url: PropTypes.string,
};

MediaCard.defaultProps = {
  url: null,
};

export default createFragmentContainer(MediaCard, graphql`
  fragment MediaCard_media on Media {
    quote
    url
    metadata
  }
`);
