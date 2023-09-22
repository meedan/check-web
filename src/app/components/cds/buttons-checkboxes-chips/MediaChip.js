import React from 'react';
import cx from 'classnames/bind';
import styles from './MediaChip.module.css';
import MediaTypeDisplayIcon from '../../media/MediaTypeDisplayIcon';

const MediaChip = ({
  label,
  url,
}) => {
  let mediaType = null;
  const match = label.match(/\.([a-zA-Z0-9]+)$/);
  console.log('match', match); // eslint-disable-line

  const fileExtension = match && match[1];
  console.log('fileExtension', fileExtension); // eslint-disable-line

  if (fileExtension) {
    if (['jpg', 'jpeg', 'JPG', 'JPEG'].includes(fileExtension)) {
      mediaType = 'UploadedImage';
    } else if (['mp3', 'MP3', 'ogg', 'OGG'].includes(fileExtension)) {
      mediaType = 'UploadedAudio';
    } else if (['mp4', 'MP4', 'avi', 'AVI'].includes(fileExtension)) {
      mediaType = 'UploadedVideo';
    }
  // If any link
  } else if (/^https?:\/\//.test(label)) {
    mediaType = 'Link';

    // Look out for specific link providers
    if (/^(https?:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/.test(url)) {
      mediaType = 'Youtube';
    } else if (/^(https?:\/\/)?((www\.)?instagram\.com)\/.+$/.test(url)) {
      mediaType = 'Instagram';
    } else if (/^(https?:\/\/)?((www\.)?twitter\.com)\/.+$/.test(url)) {
      mediaType = 'Twitter';
    } else if (/^(https?:\/\/)?((www\.)?facebook\.com)\/.+$/.test(url)) {
      mediaType = 'Facebook';
    }
  }

  console.log('mediaType', mediaType); // eslint-disable-line

  return (
    <div className={styles['media-chip']}>
      <div className={styles['media-chip-icon']}><MediaTypeDisplayIcon mediaType={mediaType} /></div>
      <div className={cx('typography-body2', styles['media-chip-label'])}>{label}</div>
    </div>
  );
};

export default MediaChip;
