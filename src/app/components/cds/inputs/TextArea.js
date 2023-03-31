import React from 'react';
import TextField from './TextField';

const TextArea = ({
  ...inputProps
}) => (
  <TextField textArea {...inputProps} />
);

export default TextArea;
