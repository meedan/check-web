import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './MediaChip.module.css';
import MediaTypeDisplayIcon, { mediaTypeFromFilename, mediaTypeFromUrl } from '../../media/MediaTypeDisplayIcon';
import Tooltip from '../alerts-and-prompts/Tooltip';

const MediaChip = ({
  label,
  url,
}) => {
  const isFile = /assets\.checkmedia\.org/.test(url);

  const mediaType = mediaTypeFromFilename(label) || mediaTypeFromUrl(url);

  // Shortens url by hiding https://wwww.
  const shortUrl = !isFile ? url.match(/https?:\/\/www.?([^ ]+)/)?.[1] : null;

  return (
    <Tooltip title={url} arrow>
      <div className={cx(styles['media-chip'], 'media-chip')}>
        <div className={cx(styles['media-chip-icon'], 'media-chip-icon')}><MediaTypeDisplayIcon mediaType={mediaType} /></div>
        <div className={cx('typography-body2', styles['media-chip-label'], 'media-chip-label')}>{shortUrl || label}</div>
      </div>
    </Tooltip>
  );
};

MediaChip.propTypes = {
  label: PropTypes.string.isRequired, // filename or url to website
  url: PropTypes.string.isRequired, // actual url to file or website
};

export default MediaChip;
