import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
} from '@material-ui/core';
import ExternalLink from '../../ExternalLink';
import ParsedText from '../../ParsedText';
import MediaSlug from '../../media/MediaSlug';
import { getMediaType } from '../../../helpers';
import { brandBorder, grayBorderAccent, otherWhite, textPrimary } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    border: `1px solid ${brandBorder}`,
    borderRadius: 8,
    color: textPrimary,
    backgroundColor: otherWhite,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    justifyContent: 'space-between',
    overflow: 'hidden',
    height: theme.spacing(14),
  },
  innerBox: {
    cursor: 'pointer',
    width: 'inherit',
    maxWidth: 'calc(100% - 48px)', // 48px is the width of a menu icon
  },
  image: {
    height: 96,
    width: 96,
    objectFit: 'cover',
    border: `1px solid ${brandBorder}`,
    marginRight: theme.spacing(1.5),
    alignSelf: 'center',
  },
  text: {
    overflow: 'hidden',
    alignSelf: 'center',
  },
  url: {
    lineHeight: '143%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '33vw', // 1/3 of the viewport width
  },
  title: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontWeight: 'normal',
    maxWidth: '33vw', // 1/3 of the viewport width
  },
  description: {
    lineHeight: '143%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontSize: 15,
    maxWidth: '33vw', // 1/3 of the viewport width
  },
  oneLineDescription: {
    maxHeight: '20px',
  },
  twoLinesDescription: { // Just works on Webkit
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    whiteSpace: 'pre-line',
  },
  placeholder: {
    border: `1px solid ${grayBorderAccent}`,
    borderRadius: theme.spacing(1),
    color: textPrimary,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  menuBox: {
    marginTop: theme.spacing(-1),
  },
}));

const SmallMediaCard = ({
  media, // { type, url, domain, quote, picture, metadata }
  customTitle,
  details,
  description,
  onClick,
  menu,
  placeholder,
  className,
}) => {
  const classes = useStyles();

  if (placeholder) {
    return (
      <Box className={classes.placeholder}>
        {placeholder}
      </Box>
    );
  }

  return (
    <Box
      className={[classes.root, className].join(' ')}
      display="flex"
      alignItems="center"
    >
      <Box
        display="flex"
        onClick={onClick}
        className={classes.innerBox}
      >
        {
          media.picture ?
            <img
              alt=""
              className={classes.image}
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }}
              src={media.picture}
            /> : null
        }
        {
          media.type === 'UploadedAudio' ?
            <img
              alt=""
              className={classes.image}
              src="/images/audio_placeholder.svg#svgView(viewBox(398,170,160,160))"
            /> : null
        }
        <div className={classes.text}>
          <div className={[classes.description, (media.url ? classes.oneLineDescription : classes.twoLinesDescription)].join(' ')}>
            <ParsedText text={media.metadata?.title || media.quote || description} />
          </div>
          <MediaSlug
            mediaType={getMediaType({ type: media.type, url: media.url, domain: media.domain })}
            slug={<div className={classes.title}>{customTitle || media.metadata?.title}</div>}
            details={details}
          />
          { media.url ? <div className={classes.url}><ExternalLink url={media.url} maxUrlLength={60} readable /></div> : null }
        </div>
      </Box>
      <Box
        display="flex"
        alignSelf="flex-start"
        className={classes.menuBox}
      >
        { menu }
      </Box>
    </Box>
  );
};

SmallMediaCard.propTypes = {
  media: PropTypes.shape({
    type: PropTypes.string.isRequired,
    url: PropTypes.string, // Mandatory for link
    domain: PropTypes.string, // Mandatory for link
    quote: PropTypes.string, // Mandatory for text claim
    picture: PropTypes.string, // URL to an image
    metadata: PropTypes.object,
  }).isRequired,
  customTitle: PropTypes.string,
  details: PropTypes.array,
  description: PropTypes.string,
  onClick: PropTypes.func,
  menu: PropTypes.element,
  placeholder: PropTypes.element,
  className: PropTypes.string,
};

SmallMediaCard.defaultProps = {
  customTitle: null,
  details: null,
  description: null,
  onClick: () => {},
  menu: null,
  placeholder: null,
  className: '',
};

export default createFragmentContainer(SmallMediaCard, graphql`
  fragment SmallMediaCard_media on Media {
    type
    url
    domain
    quote
    picture
    metadata
  }
`);
