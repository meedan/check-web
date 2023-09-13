// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3606-26274&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import TextField from './TextField';

const TextArea = React.forwardRef(({
  autoGrow,
  rows,
  ...inputProps
}, ref) => {
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
  return <TextField textArea autoGrow={autoGrow} ref={ref} {...inputProps} style={{ ...customStyle }} rows={rows} onInput={handleChange} />;
});

TextArea.defaultProps = {
  autoGrow: true,
  rows: '1',
};

TextArea.propTypes = {
  autoGrow: PropTypes.bool,
  rows: PropTypes.string,
};

export default TextArea;
