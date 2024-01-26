import React from 'react';
import PropTypes from 'prop-types';
import VisibilityOffIcon from '../../../icons/visibility_off.svg';
import EmptyMediaIcon from '../../../icons/empty_media.svg';
import styles from './ItemThumbnail.module.css';
import MediaTypeDisplayIcon, { mediaTypeFromUrl } from '../../media/MediaTypeDisplayIcon';

const ItemThumbnail = ({
  type, picture, maskContent, url,
}) => {
  if (!type) {
    return (
      <div className={`${styles.thumbnail} ${styles.container} ${styles.emptyMedia}`}>
        <div className={`${styles.iconContainer}`}>
          <EmptyMediaIcon />
        </div>
      </div>
    );
  }
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

// Custom propType handlers check to see if "type" is empty. If it is, then the prop for this function isRequired
function requiredStringIfTypeNotEmpty(props, propName, componentName) {
  if ((props.type && (props[propName] === undefined || typeof props[propName] !== 'string'))) {
    return new Error(`Prop ${propName} supplied to ${componentName} is required when 'type' is not empty`);
  }
  return undefined;
}

function requiredBoolIfTypeNotEmpty(props, propName, componentName) {
  if ((props.type && (props[propName] === undefined || typeof props[propName] !== 'boolean'))) {
    return new Error(`Prop ${propName} supplied to ${componentName} is required when 'type' is not empty`);
  }
  return undefined;
}

ItemThumbnail.defaultProps = {
  url: null,
  type: null,
  picture: null,
  maskContent: null,
};

ItemThumbnail.propTypes = {
  type: PropTypes.string,
  url: requiredStringIfTypeNotEmpty,
  picture: requiredStringIfTypeNotEmpty,
  maskContent: requiredBoolIfTypeNotEmpty,
};

export default ItemThumbnail;
