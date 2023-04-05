import React from 'react';
import TextField from './TextField';

const TextArea = ({
  ...inputProps
}) => (
  <TextField textArea {...inputProps} />
);

// eslint-disable-next-line import/no-unused-modules
export default TextArea;
