import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import VisibilityOffIcon from '../../../icons/visibility_off.svg';
import EmptyMediaIcon from '../../../icons/empty_media.svg';
import MediaTypeDisplayName from '../../media/MediaTypeDisplayName';
import MediaTypeDisplayIcon, { mediaTypeFromUrl } from '../../media/MediaTypeDisplayIcon';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import styles from './ItemThumbnail.module.css';

const ItemThumbnail = ({
  maskContent,
  picture,
  size,
  type,
  url,
}) => {
  const [contentMask, setContentMask] = React.useState(window.storage.getValue('contentMask') === 'true');
  const mediaType = type === 'Link' ? mediaTypeFromUrl(url) : type;
  const isHidden = contentMask || maskContent;

  useEffect(() => {
    const handleMaskChange = (event) => {
      if (event.key === 'contentMask') {
        setContentMask(event.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleMaskChange);

    return () => {
      window.removeEventListener('storage', handleMaskChange);
    };
  }, []);

  useEffect(() => {
    if (contentMask === 'true') {
      console.log('isHidden true', contentMask); //eslint-disable-line
    } else {
      console.log('isHidden false', contentMask); //eslint-disable-line
    }
  }, [contentMask]);

  if (!type && !picture) {
    return (
      <div
        className={cx(
          styles.thumbnail,
          styles.container,
          styles.emptyMedia,
          {
            [styles.sizeDefault]: size === 'default',
            [styles.sizeSmall]: size === 'small',
          })
        }
      >
        <div className={styles.iconContainer}>
          <EmptyMediaIcon />
        </div>
      </div>
    );
  }
  return (
    <Tooltip
      arrow
      title={
        <MediaTypeDisplayName
          mediaType={mediaType}
        />
      }
    >
      <div
        className={cx(
          styles.thumbnail,
          styles.container,
          {
            [styles.sizeDefault]: size === 'default',
            [styles.sizeSmall]: size === 'small',
            [styles.contentScreen]: isHidden,
          })
        }
      >
        <div className={styles.iconContainer}>
          { picture && !contentMask && !maskContent &&
            <img
              alt={type}
              className={styles.thumbnail}
              src={picture}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/image_placeholder.svg';
              }}
            />
          }
          { !picture && !contentMask && !maskContent &&
            <MediaTypeDisplayIcon className={styles.mediaIcon} mediaType={mediaType} />
          }
          { (contentMask || maskContent) &&
            <VisibilityOffIcon className={styles.visibilityOffIcon} />
          }
        </div>
      </div>
    </Tooltip>
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
  maskContent: null,
  picture: null,
  size: 'default',
  type: null,
  url: null,
};

ItemThumbnail.propTypes = {
  maskContent: requiredBoolIfTypeNotEmpty,
  picture: requiredStringIfTypeNotEmpty,
  size: PropTypes.oneOf(['default', 'small']),
  type: PropTypes.string,
  url: requiredStringIfTypeNotEmpty,
};

export default ItemThumbnail;
