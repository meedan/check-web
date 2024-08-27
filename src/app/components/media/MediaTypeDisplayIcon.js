import React from 'react';
import PropTypes from 'prop-types';
import Audiotrack from '../../icons/audiotrack.svg';
import Description from '../../icons/description.svg';
import Facebook from '../../icons/facebook.svg';
import Image from '../../icons/image.svg';
import Instagram from '../../icons/instagram.svg';
import Movie from '../../icons/movie.svg';
import EmptyMedia from '../../icons/empty_media.svg';
import Public from '../../icons/public.svg';
import Telegram from '../../icons/telegram.svg';
import Tiktok from '../../icons/tiktok.svg';
import Twitter from '../../icons/twitter.svg';
import YouTube from '../../icons/youtube.svg';

export function mediaTypeFromUrl(url) {
  let mediaType = 'Link';

  if (/^(https?:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/.test(url)) {
    mediaType = 'Youtube';
  } else if (/^(https?:\/\/)?((www\.)?instagram\.com)\/.+$/.test(url)) {
    mediaType = 'Instagram';
  } else if (/^(https?:\/\/)?((www\.)?(twitter|x)\.com)\/.+$/.test(url)) {
    mediaType = 'Twitter';
  } else if (/^(https?:\/\/)?((www\.)?facebook\.com|fb\.watch)\/.+$/.test(url)) {
    mediaType = 'Facebook';
  } else if (/^(https?:\/\/)?((www\.)?t\.me)\/.+$/.test(url)) {
    mediaType = 'Telegram';
  } else if (/^(https?:\/\/)?((www\.)?tiktok\.com)\/.+$/.test(url)) {
    mediaType = 'Tiktok';
  }

  return mediaType;
}

export function mediaTypeFromFilename(fileName) {
  let mediaType = null;

  const match = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const fileExtension = match && match[1];

  if (fileExtension) {
    if (['jpg', 'jpeg', 'gif', 'png'].includes(fileExtension.toLowerCase())) {
      mediaType = 'UploadedImage';
    } else if (['mp3', 'wav', 'oga', 'ogg', 'm4a'].includes(fileExtension.toLowerCase())) {
      mediaType = 'UploadedAudio';
    } else if (['mp4', 'ogg', 'ogv', 'webm', 'mov', 'm4v'].includes(fileExtension.toLowerCase())) {
      mediaType = 'UploadedVideo';
    }
  }

  return mediaType;
}

export default function MediaTypeDisplayIcon({ color = 'var(--color-gray-75)', fontSize = 'var(--iconSizeSmall)', mediaType }) {
  switch (mediaType) {
  case 'Claim':
    return <Description style={{ fontSize, color }} />;
  case 'Link':
    return <Public style={{ fontSize, color }} />;
  case 'UploadedImage':
    return <Image style={{ fontSize, color }} />;
  case 'UploadedVideo':
    return <Movie style={{ fontSize, color }} />;
  case 'UploadedAudio':
    return <Audiotrack style={{ fontSize, color }} />;
  case 'Facebook':
    return <Facebook style={{ fontSize, color }} />;
  case 'Instagram':
    return <Instagram style={{ fontSize, color }} />;
  case 'Telegram':
    return <Telegram style={{ fontSize, color }} />;
  case 'Tiktok':
    return <Tiktok style={{ fontSize, color }} />;
  case 'Twitter':
    return <Twitter style={{ fontSize, color }} />;
  case 'Youtube':
    return <YouTube style={{ fontSize, color }} />;
  case 'Blank':
    return <EmptyMedia style={{ fontSize, color }} />;
  case '-':
  default:
    return null;
  }
}

MediaTypeDisplayIcon.propTypes = {
  mediaType: PropTypes.string.isRequired,
};
