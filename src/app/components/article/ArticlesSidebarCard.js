import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import AddIcon from '../../icons/add.svg';
import BookIcon from '../../icons/book.svg';
import FactCheckIcon from '../../icons/fact_check.svg';
import EllipseIcon from '../../icons/ellipse.svg';
import { getStatus, getStatusStyle } from '../../helpers';
import styles from './Articles.module.css';

const ArticlesSidebarCard = ({ article, team }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  let ratingLabel = null;
  let ratingColor = null;
  if (article.rating) {
    const status = getStatus(team.verification_statuses, article.rating);
    ratingLabel = status.label;
    ratingColor = getStatusStyle(status, 'color');
  }

  return (
    <Tooltip
      key={article.id}
      placement="top"
      title={
        <FormattedMessage
          id="articlesSidebarCard.tooltip"
          defaultMessage="Add explainer article to this media cluster"
          description="Tooltip message displayed on explainer cards on item page."
        />
      }
      arrow
    >
      <div className={styles.articlesSidebarCard} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className={styles.articlesSidebarCardIcon}>
          { isHovered && <AddIcon /> }
          { article.nodeType === 'Explainer' && !isHovered && <BookIcon /> }
          { article.nodeType === 'FactCheck' && !isHovered && <FactCheckIcon /> }
        </div>
        <div className={cx('typography-body1', styles.articlesSidebarCardTitle)}>
          {article.title}
          { ratingLabel && ratingColor && <div className={cx('typography-caption', styles.articlesSidebarCardCaption)}><EllipseIcon style={{ color: ratingColor }} /> {ratingLabel}</div> }
        </div>
      </div>
    </Tooltip>
  );
};

ArticlesSidebarCard.propTypes = {
  team: PropTypes.shape({
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
  article: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    rating: PropTypes.string,
    nodeType: PropTypes.oneOf(['FactCheck', 'Explainer']).isRequired,
  }).isRequired,
};

// eslint-disable-next-line import/no-unused-modules
export { ArticlesSidebarCard }; // For unit test

export default createFragmentContainer(ArticlesSidebarCard, graphql`
  fragment ArticlesSidebarCard_team on Team {
    verification_statuses
  }
  fragment ArticlesSidebarCard_article on Node {
    nodeType: __typename
    ... on Explainer {
      id
      title
    }
    ... on FactCheck {
      id
      title
      rating
    }
  }
`);
