import React from 'react';
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
import CheckPropTypes from '../../CheckPropTypes';
import CheckMediaTypes from '../../constants/CheckMediaTypes';

export function mediaTypeFromUrl(url) {
  let mediaType = CheckMediaTypes.LINK;

  if (/^(https?:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/.test(url)) {
    mediaType = CheckMediaTypes.YOUTUBE;
  } else if (/^(https?:\/\/)?((www\.)?instagram\.com)\/.+$/.test(url)) {
    mediaType = CheckMediaTypes.INSTAGRAM;
  } else if (/^(https?:\/\/)?((www\.)?(twitter|x)\.com)\/.+$/.test(url)) {
    mediaType = CheckMediaTypes.TWITTER;
  } else if (/^(https?:\/\/)?((www\.)?facebook\.com|fb\.watch)\/.+$/.test(url)) {
    mediaType = CheckMediaTypes.FACEBOOK;
  } else if (/^(https?:\/\/)?((www\.)?t\.me)\/.+$/.test(url)) {
    mediaType = CheckMediaTypes.TELEGRAM;
  } else if (/^(https?:\/\/)?((www\.)?tiktok\.com)\/.+$/.test(url)) {
    mediaType = CheckMediaTypes.TIKTOK;
  }

  return mediaType;
}

export function mediaTypeFromFilename(fileName) {
  let mediaType = null;

  const match = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const fileExtension = match && match[1];

  if (fileExtension) {
    if (['jpg', 'jpeg', 'gif', 'png'].includes(fileExtension.toLowerCase())) {
      mediaType = CheckMediaTypes.UPLOADED_IMAGE;
    } else if (['mp3', 'wav', 'oga', 'ogg', 'm4a'].includes(fileExtension.toLowerCase())) {
      mediaType = CheckMediaTypes.UPLOADED_AUDIO;
    } else if (['mp4', 'ogg', 'ogv', 'webm', 'mov', 'm4v'].includes(fileExtension.toLowerCase())) {
      mediaType = CheckMediaTypes.UPLOADED_VIDEO;
    }
  }

  return mediaType;
}

export default function MediaTypeDisplayIcon({ mediaType }) {
  switch (mediaType) {
  case CheckMediaTypes.CLAIM:
    return <Description />;
  case CheckMediaTypes.LINK:
    return <Public />;
  case CheckMediaTypes.UPLOADED_IMAGE:
    return <Image />;
  case CheckMediaTypes.UPLOADED_VIDEO:
    return <Movie />;
  case CheckMediaTypes.UPLOADED_AUDIO:
    return <Audiotrack />;
  case CheckMediaTypes.FACEBOOK:
    return <Facebook />;
  case CheckMediaTypes.INSTAGRAM:
    return <Instagram />;
  case CheckMediaTypes.TELEGRAM:
    return <Telegram />;
  case CheckMediaTypes.TIKTOK:
    return <Tiktok />;
  case CheckMediaTypes.TWITTER:
    return <Twitter />;
  case CheckMediaTypes.YOUTUBE:
    return <YouTube />;
  case CheckMediaTypes.BLANK:
    return <EmptyMedia />;
  case '-':
  default:
    return null;
  }
}

MediaTypeDisplayIcon.propTypes = {
  mediaType: CheckPropTypes.mediaType.isRequired,
};
