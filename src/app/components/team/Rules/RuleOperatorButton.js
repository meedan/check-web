import React from 'react';
import PropTypes from 'prop-types';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';

const RuleOperatorButton = (props) => {
  const enabled = (props.currentValue === props.value);

  return (
    <ButtonMain
      size="default"
      variant="text"
      theme={enabled ? 'brand' : 'text'}
      onClick={props.onClick}
      label={props.children}
    />
  );
};

RuleOperatorButton.propTypes = {
  currentValue: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default RuleOperatorButton;
