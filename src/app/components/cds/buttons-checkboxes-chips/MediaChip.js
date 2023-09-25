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
  const mediaType = mediaTypeFromFilename(label) || mediaTypeFromUrl(url);

  return (
    <Tooltip title={url} arrow>
      <div className={styles['media-chip']}>
        <div className={styles['media-chip-icon']}><MediaTypeDisplayIcon mediaType={mediaType} /></div>
        <div className={cx('typography-body2', styles['media-chip-label'])}>{label}</div>
      </div>
    </Tooltip>
  );
};

MediaChip.propTypes = {
  label: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default MediaChip;
