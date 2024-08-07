import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import styles from './search.module.css';
import CloseIcon from '../../icons/clear.svg';

// FIXME This should probably not be called RemoveableWrapper as removing can be optional
// FilterWrapper maybe?
const RemoveableWrapper = ({
  icon,
  onRemove,
  children,
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
          disableHoverListener={readOnly || !onRemove}
          title={
            <FormattedMessage id="filter.removeFilter" defaultMessage="Remove filter" description="Tooltip to tell the user they can remove this filter" />
          }
          arrow
        >
          <span>
            <ButtonMain
              className={cx('int-removeable-wrapper__button--remove', styles['filter-icon-remove'])}
              iconCenter={showDeleteIcon && onRemove && !readOnly ? <CloseIcon /> : icon}
              onClick={handleClick}
              theme={showDeleteIcon && onRemove && !readOnly ? 'lightError' : 'text'}
              variant={showDeleteIcon && onRemove && !readOnly ? 'contained' : 'text'}
              size="small"
              disabled={!showDeleteIcon && !onRemove && readOnly}
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
