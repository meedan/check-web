import React from 'react';
import PropTypes from 'prop-types';
import searchStyles from './search.module.css';
import CloseIcon from '../../icons/clear.svg';

const RemoveableWrapper = ({
  icon,
  onRemove,
  children,
  readOnly,
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
      { showDeleteIcon && onRemove && !readOnly ? <CloseIcon className="multi-select-filter__remove" onClick={handleClick} /> : icon }
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
