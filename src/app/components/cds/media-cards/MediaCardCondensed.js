import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
} from '@material-ui/core';
import ExternalLink from '../../ExternalLink';
import ParsedText from '../../ParsedText';
import BulletSeparator from '../../layout/BulletSeparator';
import { brandBorder } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    border: `1px solid ${brandBorder}`,
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    justifyContent: 'space-between',
    overflow: 'hidden',
    maxHeight: theme.spacing(14),
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
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    lineHeight: '143%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '33vw', // 1/3 of the viewport width
  },
  title: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
    lineHeight: '150%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '33vw', // 1/3 of the viewport width
  },
  description: {
    marginTop: theme.spacing(0.5),
    maxHeight: '20px',
    lineHeight: '143%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '33vw', // 1/3 of the viewport width
  },
  placeholder: {
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: theme.spacing(1),
    color: 'black',
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

const MediaCardCondensed = ({
  title,
  details,
  description,
  picture,
  url,
  media,
  onClick,
  menu,
  placeholder,
}) => {
  const classes = useStyles();
  const defaultImage = '/images/image_placeholder.svg';
  const externalUrl = media?.url || url || media?.media?.url;

  if (placeholder) {
    return (
      <Box
        className={classes.placeholder}
      >
        {placeholder}
      </Box>
    );
  }

  return (
    <Box
      className={classes.root}
      display="flex"
      alignItems="center"
    >
      <Box
        display="flex"
        onClick={onClick}
        className={classes.innerBox}
      >
        {
          media?.picture || picture ?
            <img
              alt=""
              className={classes.image}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              src={media?.picture || picture}
            /> : null
        }
        <div className={classes.text}>
          <div className={classes.title}>{title || media?.quote || media.metadata?.title}</div>
          <BulletSeparator compact details={details} />
          { externalUrl ? <div className={classes.url}><ExternalLink url={externalUrl} maxUrlLength={60} /></div> : null }
          <div className={classes.description}>
            <ParsedText text={description || media.metadata?.description || media.quote} />
          </div>
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

MediaCardCondensed.propTypes = {
  title: PropTypes.string,
  details: PropTypes.array,
  description: PropTypes.string,
  picture: PropTypes.string,
  url: PropTypes.string,
  onClick: PropTypes.func,
  menu: PropTypes.element,
  placeholder: PropTypes.element,
};

MediaCardCondensed.defaultProps = {
  title: null,
  details: null,
  description: null,
  picture: null,
  url: null,
  onClick: () => {},
  menu: null,
  placeholder: null,
};

export default MediaCardCondensed;
