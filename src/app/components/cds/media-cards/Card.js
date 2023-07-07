import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import styles from './Card.module.css';
// import ArrowDropUpIcon from '../../../icons/arrow_drop_up.svg';
// import ArrowDropDownIcon from '../../../icons/arrow_drop_down.svg';
import ExpandLessIcon from '../../../icons/expand_less.svg';
import ExpandMoreIcon from '../../../icons/expand_more.svg';

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
  url,
  tag,
  tagColor,
  footer,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const buttonContent = isCollapsed ? (
    <>
      <ExpandLessIcon />
      <ExpandMoreIcon />
    </>
  ) : (
    <>
      <ExpandMoreIcon />
      <ExpandLessIcon />
    </>
  );
  // eslint-disable-next-line
  (console.log(isHovered))
  return (
    <div
      className={`${styles.card} card`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MaybeLink to={url}>
        <div className={styles.cardContent}>
          <div className={`${isCollapsed ? styles.cardLeft : ''}`}>
            <h6 className={`typography-button ${styles.cardTitle} ${isCollapsed ? styles.textEllipsis : ''}`}>{title}</h6>
            { description ?
              <p className={`typography-body2 ${styles.cardDescription} ${styles.cardDescription} ${isCollapsed ? styles.cardDescriptionCollapse : ''}`} >{description}</p>
              : null }

          </div>
          { isHovered ?
            <div className={styles.toggleIcon}>
              <button type="button" onClick={toggleCollapse} className={`${styles.toggleCollapse}`}>
                {buttonContent}
              </button>
            </div>
            : null
          }
          { (tag || footer) ?
            <div className={styles.cardRight}>
              { tag ? <div title={tag}><ButtonMain customStyle={{ color: tagColor, cursor: 'default', background: 'white' }} label={tag} variant="outlined" /></div> : null }
              { footer ? <div className={`typography-body2 ${styles.cardFooter}`}>{footer}</div> : null }
            </div> : null
          }
        </div>
      </MaybeLink>
    </div>
  );
};
Card.defaultProps = {
  description: null,
  url: null,
  tag: null,
  tagColor: 'black',
  footer: null,
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  url: PropTypes.string,
  tag: PropTypes.node,
  tagColor: PropTypes.string,
  footer: PropTypes.node,
};

export default Card;
