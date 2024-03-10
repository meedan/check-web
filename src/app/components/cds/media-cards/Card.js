import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styles from './Card.module.css';

const CardHoverContext = React.createContext(false);

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
  cardUrl,
  footer,
  children,
  className,
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
        <div className={`${styles.cardContent} ${className}`}>
          <CardHoverContext.Provider value={isHovered}>
            { children }
          </CardHoverContext.Provider>
          { footer ? <div className={styles.cardFooter}>{footer}</div> : null }
        </div>
      </MaybeLink>
    </div>
  );
};

Card.defaultProps = {
  cardUrl: null,
  footer: null,
  children: null,
  className: '',
};

Card.propTypes = {
  cardUrl: PropTypes.string,
  footer: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

export { CardHoverContext };
export default Card;
