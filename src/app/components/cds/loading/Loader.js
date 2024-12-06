import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import CheckMarkIcon from '../../../icons/check_color_mark.svg';
import styles from './loader.module.css';

const Loader = ({
  size,
  text,
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
        [styles.showLoadingText]: text,
      })
    }
  >
    <CheckMarkIcon />
    { text && (
      <small>
        {text}
      </small>
    )}
  </div>);

Loader.defaultProps = {
  size: 'large',
  text: null,
  theme: 'grey',
  variant: 'page',
};

Loader.propTypes = {
  size: PropTypes.oneOf(['icon', 'small', 'medium', 'large']),
  text: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  theme: PropTypes.oneOf(['grey', 'white']),
  variant: PropTypes.oneOf(['page', 'inline', 'icon']),
};

export default Loader;
