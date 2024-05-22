import React from 'react';
import PropTypes from 'prop-types';
import FactCheckIcon from '../../../icons/fact_check.svg';
import BookIcon from '../../../icons/book.svg';
import styles from './Card.module.css';

const icons = {
  'fact-check': <FactCheckIcon />,
  explainer: <BookIcon />,
};

const ArticleUrl = ({
  url,
  variant,
}) => {
  if (!url) return null;

  return (
    <span className={`article-url ${styles.articleLink}`}>
      { icons[variant] }
      <span>
        <a href={url} target="_blank" rel="noreferrer noopener">{url}</a>
      </span>
    </span>
  );
};

ArticleUrl.defaultProps = {
  url: null,
  variant: 'explainer',
};

ArticleUrl.propTypes = {
  url: PropTypes.string,
  variant: PropTypes.oneOf(['fact-check', 'explainer']),
};

export default ArticleUrl;