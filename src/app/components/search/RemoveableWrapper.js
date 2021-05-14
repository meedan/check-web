import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';
import Box from '@material-ui/core/Box';

// FIXME: Get rid of styled-components
// Based on example from material-ui doc: https://material-ui.com/components/autocomplete/#useautocomplete
const InputWrapper = styled('div')`
  background-color: #eee;
  border-radius: 4px;
  padding-right: 4px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  &.focused {
    background-color: #ccc;
  }

  .multi-select-filter__remove {
    cursor: pointer;
  }
`;

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
    <InputWrapper
      onMouseEnter={() => setShowDeleteIcon(true)}
      onMouseLeave={() => setShowDeleteIcon(false)}
    >
      <Box display="flex" alignItems="center" {...boxProps}>
        { showDeleteIcon && !readOnly ? <CloseIcon className="multi-select-filter__remove" onClick={handleClick} /> : icon }
      </Box>
      {children}
    </InputWrapper>
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
