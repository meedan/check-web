import React from 'react';
import ShortTextRespondTask from './ShortTextRespondTask';

const NumberRespondTask = (props) => {
  const textFieldProps = { type: 'number', multiline: false };
  return (
    <ShortTextRespondTask {...props} textFieldProps={textFieldProps} />
  );
};

export default NumberRespondTask;
