import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import YouTubeIcon from '@material-ui/icons/YouTube';
import LinkIcon from '@material-ui/icons/Link';
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
    // eslint-disable-next-line
    return <SvgIcon className="logo" viewBox="0 0 448 512" classes={{ root: classes.slack }}><path d="M94.12 315.1c0 25.9-21.16 47.06-47.06 47.06S0 341 0 315.1c0-25.9 21.16-47.06 47.06-47.06h47.06v47.06zm23.72 0c0-25.9 21.16-47.06 47.06-47.06s47.06 21.16 47.06 47.06v117.84c0 25.9-21.16 47.06-47.06 47.06s-47.06-21.16-47.06-47.06V315.1zm47.06-188.98c-25.9 0-47.06-21.16-47.06-47.06S139 32 164.9 32s47.06 21.16 47.06 47.06v47.06H164.9zm0 23.72c25.9 0 47.06 21.16 47.06 47.06s-21.16 47.06-47.06 47.06H47.06C21.16 243.96 0 222.8 0 196.9s21.16-47.06 47.06-47.06H164.9zm188.98 47.06c0-25.9 21.16-47.06 47.06-47.06 25.9 0 47.06 21.16 47.06 47.06s-21.16 47.06-47.06 47.06h-47.06V196.9zm-23.72 0c0 25.9-21.16 47.06-47.06 47.06-25.9 0-47.06-21.16-47.06-47.06V79.06c0-25.9 21.16-47.06 47.06-47.06 25.9 0 47.06 21.16 47.06 47.06V196.9zM283.1 385.88c25.9 0 47.06 21.16 47.06 47.06 0 25.9-21.16 47.06-47.06 47.06-25.9 0-47.06-21.16-47.06-47.06v-47.06h47.06zm0-23.72c-25.9 0-47.06-21.16-47.06-47.06 0-25.9 21.16-47.06 47.06-47.06h117.84c25.9 0 47.06 21.16 47.06 47.06 0 25.9-21.16 47.06-47.06 47.06H283.1z"></path></SvgIcon>;
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
    // eslint-disable-next-line
    return <SvgIcon className="logo" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></SvgIcon>;
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
