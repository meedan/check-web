import React from 'react';
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
  if (!maskContent) {
    let mediaType = type;
    if (type === 'Link') {
      // use mediaTypeFromUrl to get the specific social icon
      mediaType = mediaTypeFromUrl(url);
    }
    if (picture) {
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
              })
            }
          >
            <div className={styles.iconContainer}>
              <img
                alt={type}
                className={styles.thumbnail}
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
            })
          }
        >
          <div className={styles.iconContainer}>
            <MediaTypeDisplayIcon className={styles.mediaIcon} fontSize="var(--iconSizeDefault)" mediaType={mediaType} />
          </div>
        </div>
      </Tooltip>
    );
  }
  return (
    <div
      className={cx(
        styles.thumbnail,
        styles.container,
        styles.contentScreen,
        {
          [styles.sizeDefault]: size === 'default',
          [styles.sizeSmall]: size === 'small',
        })
      }
    >
      <div className={styles.iconContainer}>
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
