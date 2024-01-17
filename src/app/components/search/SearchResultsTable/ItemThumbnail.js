import React from 'react';
import PropTypes from 'prop-types';
import VisibilityOffIcon from '../../../icons/visibility_off.svg';
import styles from './ItemThumbnail.module.css';
import MediaTypeDisplayIcon, { mediaTypeFromUrl } from '../../media/MediaTypeDisplayIcon';

const ItemThumbnail = ({
  type, picture, maskContent, url,
}) => {
  if (!maskContent) {
    if (picture) {
      return (
        <div className={`${styles.thumbnail} ${styles.container}`}>
          <div className={styles.iconContainer}>
            <img
              className={styles.thumbnail}
              alt={type}
              src={picture}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/image_placeholder.svg';
              }}
            />
          </div>
        </div>
      );
    }
    let mediaType = type;
    if (type === 'Link') {
      // use mediaTypeFromUrl to get the specific social icon
      mediaType = mediaTypeFromUrl(url);
    }
    return (
      <div className={`${styles.thumbnail} ${styles.container}`}>
        <div className={styles.iconContainer}>
          <MediaTypeDisplayIcon mediaType={mediaType} className={styles.mediaIcon} fontSize="var(--iconSizeDefault)" />
        </div>
      </div>
    );
  }
  return (
    <div className={`${styles.thumbnail} ${styles.container} ${styles.contentScreen}`}>
      <div className={`${styles.iconContainer}`}>
        <VisibilityOffIcon className={styles.visibilityOffIcon} />
      </div>
    </div>
  );
};

ItemThumbnail.propTypes = {
  url: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  picture: PropTypes.string.isRequired,
  maskContent: PropTypes.bool.isRequired,
};

export default ItemThumbnail;
