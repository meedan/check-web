// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3606-26274&mode=design&t=ZVq51pKdIKdWZicO-4
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from './TextField';

const TextArea = React.forwardRef(({
  autoGrow,
  maxHeight,
  minHeight: minHeightProp,
  ...inputProps
}, ref) => {
  const [height, setHeight] = useState('auto');

  const handleChange = (event) => {
    const minHeight = minHeightProp || 0;
    const newHeight = `${event.target.scrollHeight}px`;
    // if the input is empty reset the height
    if (event.target.value === '') {
      setHeight('auto');
    } else if ((autoGrow && event.target.scrollHeight >= minHeight) && (!maxHeight || event.target.scrollHeight <= maxHeight)) {
      setHeight(newHeight);
    }
    if (inputProps.onChange) {
      inputProps.onChange(event);
    }
  };

  const customStyle = inputProps.style || {};
  return <TextField textArea autoGrow={autoGrow} ref={ref} {...inputProps} style={{ ...customStyle, height }} onChange={handleChange} />;
});

TextArea.defaultProps = {
  autoGrow: true,
  maxHeight: null,
};

TextArea.propTypes = {
  autoGrow: PropTypes.bool,
  maxHeight: PropTypes.number,
  minHeight: PropTypes.number.isRequired,
};

export default TextArea;
