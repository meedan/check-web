import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import BookIcon from '../../icons/book.svg';
import FactCheckIcon from '../../icons/fact_check.svg';
import styles from './Articles.module.css';

const ArticlesSidebarCard = ({ article }) => (
  <div className={styles.articlesSidebarCard}>
    <div className={styles.articlesSidebarCardIcon}>
      { article.nodeType === 'Explainer' && <BookIcon /> }
      { article.nodeType === 'FactCheck' && <FactCheckIcon /> }
    </div>
    <div className={cx('typography-body1', styles.articlesSidebarCardTitle)}>
      {article.title}
    </div>
  </div>
);

ArticlesSidebarCard.propTypes = {
  article: PropTypes.shape({
    title: PropTypes.string.isRequired,
    nodeType: PropTypes.oneOf(['FactCheck', 'Explainer']).isRequired,
  }).isRequired,
};

export default createFragmentContainer(ArticlesSidebarCard, graphql`
  fragment ArticlesSidebarCard_article on Node {
    nodeType: __typename
    ... on Explainer {
      title
    }
    ... on FactCheck {
      title
    }
  }
`);
