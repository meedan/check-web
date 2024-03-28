import React from 'react';
import PropTypes from 'prop-types';
import VisibilityOffIcon from '../../../icons/visibility_off.svg';
import styles from './ItemThumbnail.module.css';
import MediaTypeDisplayName from '../../media/MediaTypeDisplayName';
import MediaTypeDisplayIcon, { mediaTypeFromUrl } from '../../media/MediaTypeDisplayIcon';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';

const ItemThumbnail = ({
  type, picture, maskContent, url,
}) => {
  if (!maskContent) {
    let mediaType = type;
    if (type === 'Link') {
      // use mediaTypeFromUrl to get the specific social icon
      mediaType = mediaTypeFromUrl(url);
    }
    if (picture) {
      return (
        <Tooltip
          title={
            <MediaTypeDisplayName
              mediaType={mediaType}
            />
          }
        >
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
        </Tooltip>
      );
    }
    return (
      <Tooltip
        title={
          <MediaTypeDisplayName
            mediaType={mediaType}
          />
        }
      >
        <div className={`${styles.thumbnail} ${styles.container}`}>
          <div className={styles.iconContainer}>
            <MediaTypeDisplayIcon mediaType={mediaType} className={styles.mediaIcon} fontSize="var(--iconSizeDefault)" />
          </div>
        </div>
      </Tooltip>
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
