import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import BookIcon from '../../icons/book.svg';
import FactCheckIcon from '../../icons/fact_check.svg';
import EllipseIcon from '../../icons/ellipse.svg';
import { getStatus, getStatusStyle } from '../../helpers';
import styles from './Articles.module.css';

const ArticlesSidebarCard = ({ article, team }) => {
  let ratingLabel = null;
  let ratingColor = null;
  if (article.rating) {
    const status = getStatus(team.verification_statuses, article.rating);
    ratingLabel = status.label;
    ratingColor = getStatusStyle(status, 'color');
  }

  return (
    <div className={styles.articlesSidebarCard}>
      <div className={styles.articlesSidebarCardIcon}>
        { article.nodeType === 'Explainer' && <BookIcon /> }
        { article.nodeType === 'FactCheck' && <FactCheckIcon /> }
      </div>
      <div className={cx('typography-body1', styles.articlesSidebarCardTitle)}>
        {article.title}
        { ratingLabel && ratingColor && <div className={cx('typography-caption', styles.articlesSidebarCardCaption)}><EllipseIcon style={{ color: ratingColor }} /> {ratingLabel}</div> }
      </div>
    </div>
  );
};

ArticlesSidebarCard.propTypes = {
  team: PropTypes.shape({
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
  article: PropTypes.shape({
    title: PropTypes.string.isRequired,
    nodeType: PropTypes.oneOf(['FactCheck', 'Explainer']).isRequired,
  }).isRequired,
};

export default createFragmentContainer(ArticlesSidebarCard, graphql`
  fragment ArticlesSidebarCard_team on Team {
    verification_statuses
  }
  fragment ArticlesSidebarCard_article on Node {
    nodeType: __typename
    ... on Explainer {
      title
    }
    ... on FactCheck {
      title
      rating
    }
  }
`);
