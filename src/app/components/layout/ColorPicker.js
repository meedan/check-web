/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '../../icons/expand_more.svg';

const useStyles = makeStyles(theme => ({
  statusButton: props => ({
    borderRadius: theme.spacing(0.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    color: 'var(--otherWhite)',
    backgroundColor: props.backgroundColor,
  }),
  input: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
}));

const ColorPicker = ({ color, onChange }) => {
  const classes = useStyles({ backgroundColor: color });

  return (
    <React.Fragment>
      <IconButton
        className={classes.statusButton}
      >
        <ExpandMoreIcon />
        <input className={classes.input} type="color" id="head" name="head" value={color} onChange={onChange} />
      </IconButton>
    </React.Fragment>
  );
};

ColorPicker.propTypes = {
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ColorPicker;
