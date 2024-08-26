import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import MediaTypeDisplayIcon, { mediaTypeFromFilename, mediaTypeFromUrl } from '../../media/MediaTypeDisplayIcon';
import Tooltip from '../alerts-and-prompts/Tooltip';
import styles from './MediaChip.module.css';

const MediaChip = ({
  label,
  url,
}) => {
  const isFile = /assets\.checkmedia\.org/.test(url);

  const mediaType = mediaTypeFromFilename(label) || mediaTypeFromUrl(url);

  // Shortens url by hiding https://www.
  const shortUrl = !isFile ? url.match(/https?:\/\/www.?([^ ]+)/)?.[1] : null;

  return (
    <Tooltip arrow title={url}>
      <div className={cx(styles['media-chip'], 'media-chip')}>
        <div className={cx(styles['media-chip-icon'], 'media-chip-icon')}><MediaTypeDisplayIcon mediaType={mediaType} /></div>
        <div className={cx(styles['media-chip-label'], 'media-chip-label')}>{shortUrl || label}</div>
      </div>
    </Tooltip>
  );
};

MediaChip.propTypes = {
  label: PropTypes.string.isRequired, // filename or url to website
  url: PropTypes.string.isRequired, // actual url to file or website
};

export default MediaChip;
