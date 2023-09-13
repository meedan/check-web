// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=157-5443&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import styles from './Chip.module.css';
import CancelFillIcon from '../../../icons/cancel_fill.svg';

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
      <span>{label}</span>
      { onRemove && (
        <IconButton
          onClick={handleRemove}
          className={styles['delete-button']}
        >
          <CancelFillIcon />
        </IconButton>
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
