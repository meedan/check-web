import React, { useEffect } from 'react';
import cx from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './TabWrapper.module.css';

const TabWrapper = ({
  children,
  size,
}) => {
  const wrapperRef = React.useRef(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (wrapperRef.current) {
        const {
          clientHeight,
          clientWidth,
          scrollHeight,
          scrollWidth,
        } = wrapperRef.current;
        if (scrollHeight > clientHeight || scrollWidth > clientWidth) {
          setIsOverflowing(true);
        } else {
          setIsOverflowing(false);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  return (
    <div
      className={cx(
        'tab-wrapper',
        [styles.tabWrapper],
        {
          [styles.sizeDefault]: size === 'default',
          [styles.sizeLarge]: size === 'large',
        },
      )}
      ref={wrapperRef}
    >
      { isOverflowing &&
        <div className={styles.tabWrapperOverflow}>Overflowing</div>
      }
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOverflowing }),
      )}
    </div>
  );
};

TabWrapper.defaultProps = {
  size: 'default',
};

TabWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['large', 'default']),
};

export default TabWrapper;
