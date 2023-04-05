import React from 'react';
import TextField from './_TextField';

const TextArea = ({
  ...inputProps
}) => (
  <TextField textArea {...inputProps} />
);

// eslint-disable-next-line import/no-unused-modules
export default TextArea;
