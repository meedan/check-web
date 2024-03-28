import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import UnfoldLessIcon from '../../../icons/unfold_less.svg';
import UnfoldMoreIcon from '../../../icons/unfold_more.svg';
import FactCheckUrl from './FactCheckUrl';
import styles from './Card.module.css';

const ItemDescription = ({
  description,
  title,
  showCollapseButton,
  factCheckUrl,
  className,
}) => {
  const [isTextOverflowing, setIsTextOverflowing] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const descriptionRef = React.useRef(null);

  const shouldShowButton = showCollapseButton && (!isCollapsed || (isCollapsed && isTextOverflowing));

  const toggleCollapse = (e) => {
    e.preventDefault();
    setIsCollapsed(!isCollapsed);
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

  return (
    <div className={cx(styles.cardSummary, className)}>
      <div>
        <h6 className={`typography-button ${styles.cardTitle} ${isCollapsed ? styles.cardTitleCollapse : ''}`}>{title}</h6>
        { description ?
          <p className="typography-body2">
            <span className={`description-text ${styles.cardDescription} ${isCollapsed ? styles.cardDescriptionCollapse : ''}`} ref={descriptionRef}>
              {description}
            </span>
            { factCheckUrl ?
              <FactCheckUrl factCheckUrl={factCheckUrl} />
              : null }
          </p>
          : null }
      </div>
      <div style={{ visibility: shouldShowButton ? 'visible' : 'hidden' }}>
        <button type="button" onClick={toggleCollapse} className={`${styles.toggleCollapse}`}>
          { isCollapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon /> }
        </button>
      </div>
    </div>
  );
};

ItemDescription.defaultProps = {
  description: null,
  factCheckUrl: null,
  showCollapseButton: false,
  className: null,
};

ItemDescription.propTypes = {
  showCollapseButton: PropTypes.bool,
  factCheckUrl: PropTypes.string,
  description: PropTypes.string,
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ItemDescription;
