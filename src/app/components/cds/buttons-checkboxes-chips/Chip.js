// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=157-5443&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../alerts-and-prompts/Tooltip';
import ButtonMain from './ButtonMain';
import CancelFillIcon from '../../../icons/cancel_fill.svg';
import styles from './Chip.module.css';

const Chip = ({
  label,
  onClick,
  onRemove,
  className,
}) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove();
  };

  /* eslint jsx-a11y/click-events-have-key-events: 0 */
  return (
    <div
      className={`${styles['chip-container']} typography-body2 ${className}`}
      onClick={onClick}
    >
      <span title={label}>{label}</span>
      { onRemove && (
        <Tooltip
          placement="top"
          title={
            <FormattedMessage
              id="chip.tooltipRemove"
              defaultMessage="Remove Tag"
              description="Tooltip message displayed on a tag item to let the user know they can click to remove it."
            />
          }
          arrow
        >
          <span className={styles['delete-button']}>
            <ButtonMain
              className="int-chip__button--delete"
              iconCenter={<CancelFillIcon />}
              size="small"
              variant="text"
              theme="error"
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
