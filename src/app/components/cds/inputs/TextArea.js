// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3606-26274&mode=design&t=ZVq51pKdIKdWZicO-4
import React, { useState } from 'react';
import TextField from './TextField';

const TextArea = React.forwardRef(({
  ...inputProps
}, ref) => {
  const [height, setHeight] = useState('auto');

  const handleChange = (event) => {
    setHeight(`${event.target.scrollHeight}px`);
  };

  return <TextField textArea ref={ref} {...inputProps} style={{ height }} onChange={handleChange} />;
});

export default TextArea;
