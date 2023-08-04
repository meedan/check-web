import React from 'react';
import PropTypes from 'prop-types';
import Audiotrack from '../../icons/audiotrack.svg';
import Description from '../../icons/description.svg';
import Facebook from '../../icons/facebook.svg';
import Image from '../../icons/image.svg';
import Instagram from '../../icons/instagram.svg';
import Movie from '../../icons/movie.svg';
import PlaylistAddCheck from '../../icons/playlist_add_check.svg';
import Public from '../../icons/public.svg';
import Twitter from '../../icons/twitter.svg';
import YouTube from '../../icons/youtube.svg';

export default function MediaTypeDisplayIcon({ mediaType }) {
  switch (mediaType) {
  case 'Claim':
    return <Description style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'Link':
    return <Public style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'UploadedImage':
    return <Image style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'UploadedVideo':
    return <Movie style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'UploadedAudio':
    return <Audiotrack style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'Facebook':
    return <Facebook style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'Instagram':
    return <Instagram style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'Twitter':
    return <Twitter style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'Youtube':
    return <YouTube style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case 'Blank':
    return <PlaylistAddCheck style={{ fontSize: 'var(--iconSizeSmall)' }} />;
  case '-':
  default:
    return null;
  }
}

MediaTypeDisplayIcon.propTypes = {
  mediaType: PropTypes.string.isRequired,
};
