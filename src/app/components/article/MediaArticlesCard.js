/* eslint-disable react/sort-prop-types */
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

const MediaArticlesCard = ({ article, onAdd, team }) => {
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
      arrow
      key={article.id}
      placement="top"
      title={
        <>
          { article.nodeType === 'FactCheck' && <FormattedMessage defaultMessage="Add Claim & Fact-Check article to this media cluster" description="Tooltip message displayed on article cards on item page for fact-check type articles." id="mediaArticlesCard.factcheckTooltip" /> }
          { article.nodeType === 'Explainer' && <FormattedMessage defaultMessage="Add Explainer article to this media cluster" description="Tooltip message displayed on article cards on item page for explainer type articles." id="mediaArticlesCard.explainerTooltip" /> }
        </>
      }
    >
      <div className={styles.articlesSidebarCard} onClick={handleClick} onKeyDown={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className={cx(styles.articlesSidebarCardIcon, 'media-articles-card__card')}>
          { isHovered && <AddIcon /> }
          { article.nodeType === 'Explainer' && !isHovered && <BookIcon /> }
          { article.nodeType === 'FactCheck' && !isHovered && <FactCheckIcon /> }
          { article.nodeType === 'FactCheck' && <FormattedMessage defaultMessage="Claim & Fact-Check" description="Type description of a fact-check article card." id="mediaArticlesCard.factCheck" tagName="small" /> }
          { article.nodeType === 'Explainer' && <FormattedMessage defaultMessage="Explainer" description="Type description of an explainer article card." id="mediaArticlesCard.explainer" tagName="small" /> }
        </div>
        <div className={cx('typography-body1', styles.articlesSidebarCardTitle)}>
          {article.title}
          { ratingLabel && ratingColor && <div className={cx('typography-caption', styles.articlesSidebarCardCaption)}><EllipseIcon style={{ color: ratingColor }} /> {ratingLabel}</div> }
        </div>
      </div>
    </Tooltip>
  );
};

MediaArticlesCard.defaultProps = {
  onAdd: null,
};

MediaArticlesCard.propTypes = {
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
export { MediaArticlesCard }; // For unit test

export default createFragmentContainer(MediaArticlesCard, graphql`
  fragment MediaArticlesCard_team on Team {
    verification_statuses
  }
  fragment MediaArticlesCard_article on Node {
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
