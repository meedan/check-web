/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { Link } from 'react-router';
import styles from './Card.module.css';

const CardHoverContext = React.createContext(false);

const MaybeLink = ({ children, to }) => {
  if (to) {
    if (/^http/.test(to)) {
      return <a className={styles.clickableCard} href={to} rel="noreferrer noopener" target="_blank">{children}</a>;
    }
    return <Link className={styles.clickableCard} to={to}>{children}</Link>;
  }
  return <>{children}</>;
};

const Card = ({
  cardUrl,
  children,
  className,
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
      className={cx(styles.card, 'card')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MaybeLink to={cardUrl}>
        <div className={cx(styles.cardContent, { [className]: true })}>
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
  className: null,
};

Card.propTypes = {
  cardUrl: PropTypes.string,
  footer: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

export { CardHoverContext };
export default Card;
