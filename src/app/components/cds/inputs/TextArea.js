// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3606-26274&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import TextField from './TextField';

const TextArea = ({
  ...inputProps
}) => (
  <TextField textArea {...inputProps} />
);

// eslint-disable-next-line import/no-unused-modules
export default TextArea;
