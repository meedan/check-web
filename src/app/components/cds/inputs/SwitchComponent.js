import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Switch,
  Typography,
} from '@material-ui/core';
// import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
  grayBorderMain,
  brandMain,
  otherWhite,
  textDisabled,
  brandHoverAccent,
  textSecondary,
} from '../../../styles/js/shared';

const useStyles = makeStyles({
  root: {
    width: 60,
    height: 32,
    padding: 0,
  },
  switchBase: {
    padding: 0,
    '&$checked': {
      transform: 'translateX(26px)',
      color: 'white',
      '& + $track': {
        backgroundColor: brandMain,
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: otherWhite,
    },
  },
  thumb: disabled => ({
    padding: 0,
    width: 26,
    height: 26,
    borderRadius: 6,
    color: disabled ? textDisabled : otherWhite,
    alignItems: 'center',
    marginTop: 3,
    marginRight: 3,
    marginLeft: 3,
    marginBottom: 3,
    '&:hover': {
      color: brandHoverAccent,
    },
  }),
  track: {
    borderRadius: 8,
    border: `1px solid ${grayBorderMain}`,
    backgroundColor: grayBorderMain,
    opacity: 1,
  },
  botton: {
    color: textSecondary,
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
  },

  left: {

  },
  right: {

  },
  top: {

  },
  checked: {},
  focusVisible: {},
});

const SwitchComponent = ({
  label,
  disabled,
  labelPlacement,
  helperContent,
}) => {
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: false,
  });
  const classes = useStyles(disabled);

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={state.checkedB}
            onChange={handleChange}
            name="checkedB"
            disabled={disabled}
            classes={{
              root: classes.root,
              switchBase: classes.switchBase,
              thumb: classes.thumb,
              track: classes.track,
              checked: classes.checked,
            }}
          />
        }
        labelPlacement={labelPlacement}
        value={labelPlacement}
        label={
          <Typography variant="body2" style={{ color: textSecondary }} >
            {label}
          </Typography>
        }
        color={textSecondary}
      />
      <Typography variant="body2" className={classes.botton}>
        {helperContent}
      </Typography>
    </>
  );
};

SwitchComponent.defaultProps = {
  disabled: false,
  label: null,
  labelPlacement: '',
  helperContent: '',
  // helperPlacement: '',
};

SwitchComponent.propTypes = {
  label: PropTypes.object,
  disabled: PropTypes.bool,
  labelPlacement: String,
  helperContent: String,
  // helperPlacement: String,
};

export default SwitchComponent;
