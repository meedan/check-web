// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=157-5443&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import styles from './Chip.module.css';
import CancelFillIcon from '../../../icons/cancel_fill.svg';

const Chip = ({
  label,
  onRemove,
}) => {
  const handleRemove = () => {
    onRemove();
  };

  return (
    <div
      className={`${styles['chip-container']} typography-body2`}
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
  onRemove: null,
};

Chip.propTypes = {
  onRemove: PropTypes.func,
  label: PropTypes.string.isRequired,
};

export default Chip;
