import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
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
  url,
  tag,
  tagColor,
  footer,
}) => (
  <div className={`${styles.card} card`}>
    <MaybeLink to={url}>
      <div className={styles.cardContent}>
        <div className={styles.cardLeft}>
          <h6 className={`typography-button ${styles.cardTitle}`}>{title}</h6>
          { description ? <p className={`typography-body2 ${styles.cardDescription}`}>{description}</p> : null }
        </div>
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
