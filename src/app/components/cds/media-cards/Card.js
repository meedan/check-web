import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { FormattedDate } from 'react-intl';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import styles from './Card.module.css';
import UnfoldLessIcon from '../../../icons/unfold_less.svg';
import UnfoldMoreIcon from '../../../icons/unfold_more.svg';
import FactCheckIcon from '../../../icons/fact_check.svg';
import EllipseIcon from '../../../icons/ellipse.svg';

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
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTextOverflowing, setIsTextOverflowing] = React.useState(false);
  const descriptionRef = React.useRef(null);

  const toggleCollapse = (e) => {
    e.preventDefault();
    setIsCollapsed(!isCollapsed);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const checkTextOverflow = () => {
    const descriptionElement = descriptionRef.current;
    if (descriptionElement) {
      if (descriptionElement.offsetHeight < descriptionElement.scrollHeight ||
        descriptionElement.offsetWidth < descriptionElement.scrollWidth) {
        setIsTextOverflowing(true);
      } else {
        setIsTextOverflowing(false);
      }
    }
  };

  React.useEffect(() => {
    checkTextOverflow();
    window.addEventListener('resize', checkTextOverflow);

    return () => {
      window.removeEventListener('resize', checkTextOverflow);
    };
  }, [description]);

  const shouldShowButton = isHovered && (!isCollapsed || (isCollapsed && isTextOverflowing));

  return (
    <div
      className={`${styles.card} card`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MaybeLink to={cardUrl}>
        <div className={styles.cardContent}>
          <div className={styles.cardLeft}>
            <h6 className={`typography-button ${styles.cardTitle}`}>{title}</h6>
            { description ?
              <p className="typography-body2">
                <span className={`description-text ${styles.cardDescription} ${isCollapsed ? styles.cardDescriptionCollapse : ''}`} ref={descriptionRef}>
                  {description}
                </span>
                { factCheckUrl ?
                  <span className={styles.factCheckLink}>
                    <FactCheckIcon />
                    {' '}
                    <a href={factCheckUrl} target="_blank" rel="noreferrer noopener">{factCheckUrl}</a>
                  </span>
                  : null }
              </p>
              : null }
            { footer ? <div className={styles.cardFooter}>{footer}</div> : null }
          </div>
          { shouldShowButton ?
            <div>
              <button type="button" onClick={toggleCollapse} className={`${styles.toggleCollapse}`}>
                { isCollapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon /> }
              </button>
            </div>
            : null
          }
          { (tag || date) ?
            <div className={styles.cardRight}>
              { tag ?
                <div title={tag} className={styles.cardTag}>
                  <ButtonMain
                    disabled
                    variant="outlined"
                    size="default"
                    theme="text"
                    label={<span className={styles.cardTagLabel}><EllipseIcon style={{ color: tagColor }} /> {tag}</span>}
                    customStyle={{
                      borderColor: tagColor,
                      color: 'var(--textPrimary)',
                    }}
                  />
                </div>
                : null
              }
              { date ? <div className={`typography-body2 ${styles.cardDate}`}><FormattedDate value={date * 1000} year="numeric" month="long" day="numeric" /></div> : null }
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
