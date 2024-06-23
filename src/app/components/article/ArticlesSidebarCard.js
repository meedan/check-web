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

const ArticlesSidebarCard = ({ article, team, onAdd }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e) => {
    if (onAdd) {
      let id = null;
      if (article.nodeType === 'FactCheck') {
        ({ id } = article.claim_description);
      } else if (article.nodeType === 'Explainer') {
        id = article.dbid;
      }
      onAdd(article.nodeType, id);
    }
    e.stopPropagation();
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
      <div className={styles.articlesSidebarCard} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} onKeyDown={handleClick}>
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

ArticlesSidebarCard.defaultProps = {
  onAdd: null,
};

ArticlesSidebarCard.propTypes = {
  team: PropTypes.shape({
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
  article: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    rating: PropTypes.string,
    claim_description: PropTypes.shape({
      id: PropTypes.string,
    }),
    nodeType: PropTypes.oneOf(['FactCheck', 'Explainer']).isRequired,
  }).isRequired,
  onAdd: PropTypes.func,
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
      dbid
      title
    }
    ... on FactCheck {
      id
      dbid
      title
      rating
      claim_description {
        id
      }
    }
  }
`);
