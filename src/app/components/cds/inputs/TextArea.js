// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3606-26274&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import TextField from './TextField';

const TextArea = React.forwardRef(({
  autoGrow,
  rows,
  maxHeight,
  ...inputProps
}, ref) => {
  const handleChange = (event) => {
    event.target.parentNode.setAttribute('data-replicated-value', event.target.value);
  };

  const customStyle = inputProps.style || {};
  return <TextField textArea autoGrow={autoGrow} ref={ref} {...inputProps} style={{ ...customStyle }} rows={rows} onInput={handleChange} />;
});

TextArea.defaultProps = {
  autoGrow: true,
  rows: '1',
  maxHeight: null,
};

TextArea.propTypes = {
  autoGrow: PropTypes.bool,
  rows: PropTypes.string,
  maxHeight: PropTypes.number,
};

export default TextArea;
