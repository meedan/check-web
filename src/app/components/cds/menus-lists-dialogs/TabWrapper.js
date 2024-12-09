import React, { useEffect, useLayoutEffect } from 'react';
import cx from 'classnames/bind';
import PropTypes from 'prop-types';
import Tab from './Tab';
import Select from '../inputs/Select';
import { getQueryStringValue, pushQueryStringValue } from '../../../urlHelpers';
import styles from './TabWrapper.module.css';

const TabWrapper = ({
  className,
  onChange,
  size,
  tabs,
  value,
  variant,
  wrapContent,
}) => {
  const [activeTab, setActiveTab] = React.useState(getQueryStringValue('tab') || value || tabs.find(tab => tab.show !== false).value);
  const wrapperRef = React.useRef(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [fullTabWidth, setFullTabWidth] = React.useState(0);
  const wrapperHeightMax = size === 'large' ? 130 : 95;

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const tabItems = Array.from(wrapperRef.current.children);
      const totalTabWidth = tabItems.reduce((total, tab) => total + tab.clientWidth, 0);
      setFullTabWidth(totalTabWidth + (tabItems.length * 16));
    }
  }, []);

  useLayoutEffect(() => {
    const checkOverflow = (tabWidth) => {
      if (wrapperRef.current) {
        const containerWidth = wrapperRef.current.clientWidth;
        const containerHeight = wrapperRef.current.clientHeight;
        if (tabWidth > containerWidth && !isOverflowing && !wrapContent) {
          setIsOverflowing(true);
        } else if (tabWidth <= containerWidth && isOverflowing) {
          setIsOverflowing(false);
        }

        if (containerHeight > wrapperHeightMax && wrapContent) {
          setIsOverflowing(true);
        }
      }
    };

    checkOverflow(fullTabWidth);

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow(fullTabWidth);
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      if (wrapperRef.current) {
        resizeObserver.unobserve(wrapperRef.current);
      }
    };
  }, [fullTabWidth]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        const containerWidth = wrapperRef.current.clientWidth;
        const containerHeight = wrapperRef.current.clientHeight;
        if (fullTabWidth > containerWidth && !wrapContent) {
          setIsOverflowing(true);
        } else {
          setIsOverflowing(false);
        }

        if (containerHeight > wrapperHeightMax && !isOverflowing && wrapContent) {
          setIsOverflowing(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [fullTabWidth]);

  useEffect(() => {
    if (getQueryStringValue('tab')) {
      onChange(getQueryStringValue('tab'));
    } else {
      pushQueryStringValue('tab', activeTab);
    }
  }, []);

  const handleClick = (newValue) => {
    setActiveTab(newValue);
    pushQueryStringValue('tab', newValue);
    onChange(newValue);
  };

  return (
    <div
      className={cx(
        'tab-wrapper',
        [styles.tabWrapper],
        {
          [className]: true,
          [styles.sizeDefault]: size === 'default',
          [styles.sizeLarge]: size === 'large' || isOverflowing,
          [styles.variantBanner]: variant === 'banner',
          [styles.wrapContent]: wrapContent,
        },
      )}
      ref={wrapperRef}
    >
      { isOverflowing &&
        <Select
          className={styles.select}
          value={activeTab}
          onChange={e => handleClick(e.target.value)}
        >
          {tabs.map(tab => (
            <option
              className={tab.className}
              key={tab.value}
              value={tab.value}
            >
              {tab.label}{tab.extraLabel}
            </option>
          ))}
        </Select>
      }
      { !isOverflowing &&
        tabs.map(tab => (
          <Tab
            active={activeTab === tab.value}
            key={tab.value}
            size={size}
            {...tab}
            onClick={handleClick}
          />
        ))
      }
    </div>
  );
};

TabWrapper.defaultProps = {
  className: null,
  size: 'default',
  value: null,
  variant: 'default',
  wrapContent: false,
};

TabWrapper.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['large', 'default']),
  tabs: PropTypes.array.isRequired,
  value: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'banner']),
  wrapContent: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export default TabWrapper;
