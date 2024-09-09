// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3606-26274&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import TextField from './TextField';

const TextArea = React.forwardRef(({
  autoGrow,
  maxHeight,
  rows,
  ...inputProps
}, ref) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (ref?.current) {
      ref.current.parentNode.setAttribute('data-replicated-value', ref.current.value);
    }
  }, []);

  const handleChange = (event) => {
    event.target.parentNode.setAttribute('data-replicated-value', event.target.value);
    if (inputProps.onInput) {
      inputProps.onInput(event);
    }
  };

  const customStyle = inputProps.style || {};
  return (
    <TextField
      autoGrow={autoGrow}
      maxHeight={maxHeight}
      ref={ref || inputRef}
      rows={rows}
      style={{ ...customStyle }}
      textArea
      onInput={handleChange}
      {...inputProps}
    />
  );
});

TextArea.defaultProps = {
  autoGrow: true,
  maxHeight: null,
  rows: '1',
};

TextArea.propTypes = {
  autoGrow: PropTypes.bool,
  maxHeight: PropTypes.string,
  rows: PropTypes.string,
};

export default TextArea;
