import React from 'react';
import PropTypes from 'prop-types';
import {
  AudiotrackOutlined,
  DescriptionOutlined,
  ImageOutlined,
  MovieOutlined,
  PublicOutlined,
  Facebook,
  Instagram,
  Twitter,
  YouTube,
} from '@material-ui/icons';

export default function MediaTypeDisplayIcon({ mediaType }) {
  switch (mediaType) {
  case 'Claim':
    return <DescriptionOutlined />;
  case 'Link':
    return <PublicOutlined />;
  case 'UploadedImage':
    return <ImageOutlined />;
  case 'UploadedVideo':
    return <MovieOutlined />;
  case 'UploadedAudio':
    return <AudiotrackOutlined />;
  case 'Facebook':
    return <Facebook />;
  case 'Instagram':
    return <Instagram />;
  case 'Twitter':
    return <Twitter />;
  case 'Youtube':
    return <YouTube />;
  case 'Blank':
    return null;
  case '-':
  default:
    return null;
  }
}

MediaTypeDisplayIcon.propTypes = {
  mediaType: PropTypes.string.isRequired,
};
