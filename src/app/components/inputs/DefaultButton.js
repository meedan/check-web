import React from 'react';
import { bemClass } from '../../helpers';

const DefaultButton = (props) => {
  const buttonClassName = `${bemClass('default-button', props.size, `--${props.size}`)} default-button--${props.style}`;

  return (
    <span className={props.className}>
      <button type="submit" onClick={props.onClick} className={buttonClassName}>{props.children}</button>
    </span>
  );
};

export default DefaultButton;
