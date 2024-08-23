/* eslint-disable react/sort-prop-types */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CloseIcon from '../../icons/clear.svg';
import styles from './search.module.css';

// FIXME This should probably not be called RemoveableWrapper as removing can be optional
// FilterWrapper maybe?
const RemoveableWrapper = ({
  children,
  icon,
  onRemove,
  readOnly,
}) => {
  const [showDeleteIcon, setShowDeleteIcon] = React.useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onRemove && !readOnly) onRemove();
  };

  return (
    <div
      className={cx(
        styles['filter-removable-wrapper'],
        {
          [styles['filter-removable-wrapper-icon']]: !children,
        })
      }
      onMouseEnter={() => { if (!readOnly) setShowDeleteIcon(true); }}
      onMouseLeave={() => { if (!readOnly) setShowDeleteIcon(false); }}
    >
      {icon &&
        <Tooltip
          arrow
          disableHoverListener={readOnly || !onRemove}
          title={
            <FormattedMessage defaultMessage="Remove filter" description="Tooltip to tell the user they can remove this filter" id="filter.removeFilter" />
          }
        >
          <span>
            <ButtonMain
              className={cx('int-removeable-wrapper__button--remove', styles['filter-icon-remove'])}
              disabled={!showDeleteIcon && !onRemove && readOnly}
              iconCenter={showDeleteIcon && onRemove && !readOnly ? <CloseIcon /> : icon}
              size="small"
              theme={showDeleteIcon && onRemove && !readOnly ? 'lightError' : 'text'}
              variant={showDeleteIcon && onRemove && !readOnly ? 'contained' : 'text'}
              onClick={handleClick}
            />
          </span>
        </Tooltip>
      }
      {children}
    </div>
  );
};

RemoveableWrapper.defaultProps = {
  readOnly: false,
  children: null,
  onRemove: null,
};

RemoveableWrapper.propTypes = {
  icon: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  children: PropTypes.node,
  readOnly: PropTypes.bool,
};

export default RemoveableWrapper;
