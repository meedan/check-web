import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './mediasloading.module.css';
import CheckMarkIcon from '../../icons/check_color_mark.svg';

const MediasLoading = ({
  size,
  theme,
  variant,
}) => (
  <div
    className={cx(
      'medias-loading',
      [styles.loadingWrapper],
      styles[`theme-${theme}`],
      {
        [styles.sizeIcon]: size === 'icon',
        [styles.sizeSmall]: size === 'small',
        [styles.sizeMedium]: size === 'medium',
        [styles.sizeLarge]: size === 'large',
        [styles.pageLevel]: variant === 'page',
        [styles.inlineLevel]: variant === 'inline',
        [styles.iconLevel]: variant === 'icon',
      })
    }
  >
    <CheckMarkIcon />
  </div>);

MediasLoading.defaultProps = {
  size: 'large',
  theme: 'grey',
  variant: 'page',
};

MediasLoading.propTypes = {
  size: PropTypes.oneOf(['icon', 'small', 'medium', 'large']),
  theme: PropTypes.oneOf(['grey', 'white']),
  variant: PropTypes.oneOf(['page', 'inline', 'icon']),
};

export default MediasLoading;
