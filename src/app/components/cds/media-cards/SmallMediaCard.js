import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
} from '@material-ui/core';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ExternalLink from '../../ExternalLink';
import ParsedText from '../../ParsedText';
import MediaSlug from '../../media/MediaSlug';
import { getMediaType } from '../../../helpers';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    border: '1px solid var(--brandBorder)',
    borderRadius: 8,
    color: 'var(--textPrimary)',
    backgroundColor: 'var(--otherWhite)',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    justifyContent: 'space-between',
    overflow: 'hidden',
    height: theme.spacing(14),
    cursor: 'pointer',
  },
  inner: {
    width: 'calc(100% - 48px)',
  },
  image: {
    height: 96,
    width: 96,
    objectFit: 'cover',
    marginRight: theme.spacing(1),
    alignSelf: 'center',
  },
  row: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  text: {
    alignSelf: 'center',
    minWidth: 0,
  },
  titleAndUrl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
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
  menuBox: {
    marginTop: theme.spacing(-1),
  },
  contentScreen: {
    height: 96,
    width: 96,
    marginRight: theme.spacing(1),
    backgroundColor: 'var(--textPrimary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '40px',
    color: 'var(--otherWhite)',
  },
}));

const SmallMediaCard = ({
  media, // { type, url, domain, quote, picture, metadata }
  customTitle,
  details,
  description,
  maskContent,
  superAdminMask,
  onClick,
  menu,
  className,
}) => {
  const classes = useStyles();

  return (
    <Box
      className={[classes.root, className].join(' ')}
      display="flex"
      alignItems="center"
    >
      <Box
        className={classes.inner}
        display="flex"
        onClick={onClick}
      >
        {
          media.picture && !(maskContent || superAdminMask) ?
            <img
              alt=""
              className={classes.image}
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }}
              src={media.picture}
            /> : null
        }
        {
          media.type === 'UploadedAudio' && !(maskContent || superAdminMask) ?
            <img
              alt=""
              className={classes.image}
              src="/images/audio_placeholder.svg#svgView(viewBox(398,170,160,160))"
            /> : null
        }
        { maskContent || superAdminMask || !(media.picture || media.type === 'UploadedAudio') ? <Box display="flex" alignItems="center"><div className={classes.contentScreen}><VisibilityOffIcon className={classes.icon} /></div></Box> : null }
        <div className={classes.text}>
          <Box className={classes.titleAndUrl}>
            <Typography variant="subtitle2" component="div">
              <div className={[classes.row, (media.url ? classes.oneLineDescription : classes.twoLinesDescription)].join(' ')}>
                <ParsedText text={media.metadata?.title || media.quote || description} />
              </div>
            </Typography>
            { media.url ?
              <Typography variant="body1" component="div">
                <div className={classes.row}>
                  <ExternalLink url={media.url} maxUrlLength={60} readable />
                </div>
              </Typography> : null
            }
          </Box>
          <Box mt={1}>
            <MediaSlug
              mediaType={getMediaType({ type: media.type, url: media.url, domain: media.domain })}
              slug={
                <Typography variant="body1" component="div">
                  <div className={classes.row}>
                    {customTitle || media.metadata?.title}
                  </div>
                </Typography>
              }
              details={details}
            />
          </Box>
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
  maskContent: PropTypes.bool,
  superAdminMask: PropTypes.bool,
  onClick: PropTypes.func,
  menu: PropTypes.element,
  className: PropTypes.string,
};

SmallMediaCard.defaultProps = {
  customTitle: null,
  details: null,
  description: null,
  maskContent: false,
  superAdminMask: false,
  onClick: () => {},
  menu: null,
  className: '',
};

// eslint-disable-next-line import/no-unused-modules
export { SmallMediaCard }; // Used in unit test
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
