/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import FactCheckIcon from '../../../icons/fact_check.svg';
import BookIcon from '../../../icons/book.svg';
import styles from './Card.module.css';

const icons = {
  'fact-check': <FactCheckIcon />,
  explainer: <BookIcon />,
};

const ArticleUrl = ({
  linkText,
  showIcon,
  title,
  url,
  variant,
}) => {
  if (!url) return null;

  const swallowClick = (e) => {
    e.stopPropagation();
  };

  return (
    <span className={cx('article-url', styles.articleLink)} onClick={swallowClick} onKeyDown={swallowClick}>
      { showIcon && icons[variant] }
      <a href={url} rel="noreferrer noopener" target="_blank" title={title || url}>{linkText || url}</a>
    </span>
  );
};

ArticleUrl.defaultProps = {
  url: null,
  variant: 'explainer',
  title: null,
  showIcon: true,
  linkText: null,
};

ArticleUrl.propTypes = {
  url: PropTypes.string,
  variant: PropTypes.oneOf(['fact-check', 'explainer']),
  title: PropTypes.string,
  showIcon: PropTypes.bool,
  linkText: PropTypes.string,
};

export default ArticleUrl;
