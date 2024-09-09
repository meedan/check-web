/* eslint-disable react/sort-prop-types */
// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=157-5443&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from './ButtonMain';
import Tooltip from '../alerts-and-prompts/Tooltip';
import CancelFillIcon from '../../../icons/cancel_fill.svg';
import styles from './Chip.module.css';

const Chip = ({
  className,
  label,
  onClick,
  onRemove,
}) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove();
  };

  /* eslint jsx-a11y/click-events-have-key-events: 0 */
  return (
    <div
      className={cx(
        'typography-body2',
        styles['chip-container'],
        {
          [className]: true,
          [styles['chip-removable']]: onRemove,
        })
      }
      onClick={onClick}
    >
      <span title={label}>{label}</span>
      { onRemove && (
        <Tooltip
          arrow
          placement="top"
          title={
            <FormattedMessage
              defaultMessage="Remove Tag"
              description="Tooltip message displayed on a tag item to let the user know they can click to remove it."
              id="chip.tooltipRemove"
            />
          }
        >
          <span className={styles['delete-button']}>
            <ButtonMain
              className="int-chip__button--delete"
              iconCenter={<CancelFillIcon />}
              size="small"
              theme="error"
              variant="text"
              onClick={handleRemove}
            />
          </span>
        </Tooltip>
      )}
    </div>
  );
};

Chip.defaultProps = {
  onClick: null,
  onRemove: null,
  className: '',
};

Chip.propTypes = {
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Chip;
