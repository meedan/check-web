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
  PlaylistAddCheck,
} from '@material-ui/icons';

export default function MediaTypeDisplayIcon({ mediaType }) {
  const props = { fontSize: 'small' };
  switch (mediaType) {
  case 'Claim':
    return <DescriptionOutlined {...props} />;
  case 'Link':
    return <PublicOutlined {...props} />;
  case 'UploadedImage':
    return <ImageOutlined {...props} />;
  case 'UploadedVideo':
    return <MovieOutlined {...props} />;
  case 'UploadedAudio':
    return <AudiotrackOutlined {...props} />;
  case 'Facebook':
    return <Facebook {...props} />;
  case 'Instagram':
    return <Instagram {...props} />;
  case 'Twitter':
    return <Twitter {...props} />;
  case 'Youtube':
    return <YouTube {...props} />;
  case 'Blank':
    return <PlaylistAddCheck {...props} />;
  case '-':
  default:
    return null;
  }
}

MediaTypeDisplayIcon.propTypes = {
  mediaType: PropTypes.string.isRequired,
};
