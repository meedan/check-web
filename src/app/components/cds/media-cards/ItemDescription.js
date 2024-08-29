/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ArticleUrl from './ArticleUrl';
import UnfoldLessIcon from '../../../icons/unfold_less.svg';
import UnfoldMoreIcon from '../../../icons/unfold_more.svg';
import styles from './Card.module.css';

const ItemDescription = ({
  className,
  description,
  showCollapseButton,
  title,
  url,
  variant,
}) => {
  const [isTextOverflowing, setIsTextOverflowing] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const descriptionRef = React.useRef(null);

  const shouldShowButton = showCollapseButton && (!isCollapsed || (isCollapsed && isTextOverflowing));

  const toggleCollapse = (e) => {
    e.stopPropagation();
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
    <div
      className={cx(
        [styles.cardSummary],
        {
          [className]: true,
          [styles.cardSummaryCollapsed]: isCollapsed,
          [styles.hideCollapse]: !isTextOverflowing,
        })
      }
    >
      <div className={styles.cardSummaryContent}>
        <h6 className={styles.cardTitle}>{title}</h6>
        { description ?
          <span className={cx('description-text', styles.cardDescription)} ref={descriptionRef}>
            {description}
          </span>
          : null }
        { url ?
          <ArticleUrl url={url} variant={variant} />
          : null }
      </div>
      <button
        className={cx(
          [styles.toggleCollapse],
          {
            [[styles.toggleCollapseVisible]]: shouldShowButton,
            [[styles.toggleCollapseHidden]]: !shouldShowButton,
          })
        }
        type="button"
        onClick={toggleCollapse}
      >
        { isCollapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon /> }
      </button>
    </div>
  );
};

ItemDescription.defaultProps = {
  description: null,
  url: null,
  showCollapseButton: false,
  className: null,
  variant: 'explainer',
};

ItemDescription.propTypes = {
  showCollapseButton: PropTypes.bool,
  url: PropTypes.string,
  description: PropTypes.string,
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['explainer', 'fact-check']),
};

export default ItemDescription;
