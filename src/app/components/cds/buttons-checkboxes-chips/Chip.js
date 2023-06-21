import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import styles from './Chip.module.css';
import CancelFillIcon from '../../../icons/cancel_fill.svg';

const Chip = ({
  label,
  onRemove,
  removable,
}) => {
  const handleRemove = () => {
    onRemove();
  };

  return (
    <div
      className={`${styles['chip-container']} typography-body2`}
    >
      <span>{label}</span>
      { removable && (
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
  removable: false,
  onRemove: () => {},
};

Chip.propTypes = {
  onRemove: PropTypes.func,
  removable: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

export default Chip;
