import React from 'react';
import PropTypes from 'prop-types';
import FacebookIcon from '../icons/facebook.svg';
import GoogleColorIcon from '../icons/google_color.svg';
import InstagramIcon from '../icons/instagram.svg';
import LinkIcon from '../icons/link.svg';
import SlackIcon from '../icons/slack.svg';
import TwitterIcon from '../icons/twitter.svg';
import YouTubeIcon from '../icons/youtube.svg';

const SocialIcon = ({ domain, inColor }) => {
  switch (domain) {
  case 'slack.com':
  case 'slack':
    return <SlackIcon className="logo" style={{ color: inColor ? 'var(--slackGreen)' : '' }} />;
  case 'twitter.com':
  case 'x.com':
  case 'twitter':
    return <TwitterIcon className="logo" style={{ color: inColor ? 'var(--xBlack)' : '' }} />;
  case 'youtube.com':
  case 'youtube':
    return <YouTubeIcon className="logo" style={{ color: inColor ? 'var(--youTubeRed)' : '' }} />;
  case 'instagram.com':
  case 'instagram':
    return <InstagramIcon className="logo" style={{ color: inColor ? 'var(--color-gray-15)' : '' }} />;
  case 'facebook.com':
  case 'facebook':
    return <FacebookIcon className="logo" style={{ color: inColor ? 'var(--facebookBlue)' : '' }} />;
  case 'google.com':
  case 'google_oauth2':
    // eslint-disable-next-line
    return <GoogleColorIcon className="logo" />;
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
    'x.com',
    'youtube',
    'youtube.com',
    '', // "link"
  ]), // or null
  inColor: PropTypes.bool, // default false
};

export default SocialIcon;
