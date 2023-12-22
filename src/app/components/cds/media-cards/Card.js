import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ItemDate from './ItemDate';
import ItemRating from './ItemRating';
import ItemDescription from './ItemDescription';
import styles from './Card.module.css';

const MaybeLink = ({ to, children }) => {
  if (to) {
    if (/^http/.test(to)) {
      return <a href={to} target="_blank" rel="noreferrer noopener" className={styles.clickableCard}>{children}</a>;
    }
    return <Link to={to} className={styles.clickableCard}>{children}</Link>;
  }
  return <div>{children}</div>;
};

const Card = ({
  title,
  description,
  factCheckUrl,
  cardUrl,
  tag,
  tagColor,
  date,
  footer,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`${styles.card} card`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MaybeLink to={cardUrl}>
        <div className={styles.cardContent}>
          <div>
            <ItemDescription title={title} description={description} factCheckUrl={factCheckUrl} showCollapseButton={isHovered} />
            { footer ? <div className={styles.cardFooter}>{footer}</div> : null }
          </div>
          { (tag || date) ?
            <div className={styles.cardRight}>
              { tag ? <ItemRating rating={tag} ratingColor={tagColor} /> : null }
              { date ? <ItemDate date={date} /> : null }
            </div> : null
          }
        </div>
      </MaybeLink>
    </div>
  );
};

Card.defaultProps = {
  description: null,
  factCheckUrl: null,
  cardUrl: null,
  tag: null,
  tagColor: 'black',
  date: null,
  footer: null,
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  factCheckUrl: PropTypes.string,
  cardUrl: PropTypes.string,
  tag: PropTypes.node,
  tagColor: PropTypes.string,
  date: PropTypes.number, // Timestamp
  footer: PropTypes.node,
};

export default Card;
