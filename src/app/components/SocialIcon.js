import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import YouTubeIcon from '@material-ui/icons/YouTube';
import LinkIcon from '@material-ui/icons/Link';
import { FaSlack } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import {
  slackGreen,
  twitterBlue,
  facebookBlue,
  youTubeRed,
} from '../styles/js/shared';

const maybeColor = color => ({ inColor }) => inColor ? { color } : {};

// Styles are either "{ color: facebookBlue }" or "{}", depending on the "inColor" prop
const useStyles = makeStyles({
  twitter: maybeColor(twitterBlue),
  facebook: maybeColor(facebookBlue),
  slack: maybeColor(slackGreen),
  youtube: maybeColor(youTubeRed),
});

const SocialIcon = ({ domain, inColor }) => {
  const classes = useStyles({ inColor });

  switch (domain) {
  case 'slack.com':
  case 'slack':
    return <FaSlack className="logo" classes={{ root: classes.slack }} />;
  case 'twitter.com':
  case 'twitter':
    return <TwitterIcon className="logo" classes={{ root: classes.twitter }} />;
  case 'youtube.com':
  case 'youtube':
    return <YouTubeIcon className="logo" classes={{ root: classes.youtube }} />;
  case 'instagram.com':
  case 'instagram':
    return <InstagramIcon className="logo" />;
  case 'facebook.com':
  case 'facebook':
    return <FacebookIcon className="logo" classes={{ root: classes.facebook }} />;
  case 'google.com':
  case 'google_oauth2':
    return <FcGoogle className="logo" />;
  default:
    return <LinkIcon />;
  }
};
SocialIcon.defaultProps = {
  domain: null,
  inColor: false,
};
SocialIcon.propTypes = {
  domain: PropTypes.oneOf([
    'facebook',
    'facebook.com',
    'instagram',
    'instagram.com',
    'slack',
    'slack.com',
    'twitter',
    'twitter.com',
    'youtube',
    'youtube.com',
    '', // "link"
  ]), // or null
  inColor: PropTypes.bool, // default false
};

export default SocialIcon;
