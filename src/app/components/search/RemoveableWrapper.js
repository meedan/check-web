import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import searchStyles from './search.module.css';
import CloseIcon from '../../icons/clear.svg';

const RemoveableWrapper = ({
  icon,
  onRemove,
  children,
  readOnly,
  boxProps,
}) => {
  const [showDeleteIcon, setShowDeleteIcon] = React.useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div
      className={searchStyles.inputWrapper}
      onMouseEnter={() => setShowDeleteIcon(true)}
      onMouseLeave={() => setShowDeleteIcon(false)}
    >
      <Box display="flex" alignItems="center" {...boxProps}>
        { showDeleteIcon && !readOnly ? <CloseIcon className="multi-select-filter__remove" onClick={handleClick} /> : icon }
      </Box>
      {children}
    </div>
  );
};

RemoveableWrapper.defaultProps = {
  readOnly: false,
  boxProps: {},
  children: null,
};

RemoveableWrapper.propTypes = {
  icon: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  children: PropTypes.node,
  readOnly: PropTypes.bool,
  boxProps: PropTypes.object,
};

export default RemoveableWrapper;
