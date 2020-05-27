import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { black54 } from '../../../styles/js/shared';

const useStyles = makeStyles(() => ({
  button: {
    textTransform: 'uppercase',
    paddingLeft: 0,
    paddingRight: 0,
    minWidth: 0,
  },
  label: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  enabled: {
  },
  disabled: {
    color: black54,
  },
}));

const RuleOperatorButton = (props) => {
  const classes = useStyles();
  const enabled = (props.currentValue === props.value);

  return (
    <Button
      onClick={props.onClick}
      classes={{
        root: [
          classes.button,
          (enabled ? classes.enabled : classes.disabled),
        ].join(' '),
        label: classes.label,
      }}
      style={enabled ? { color: props.color } : {}}
    >
      {props.children}
    </Button>
  );
};

RuleOperatorButton.propTypes = {
  currentValue: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default RuleOperatorButton;
