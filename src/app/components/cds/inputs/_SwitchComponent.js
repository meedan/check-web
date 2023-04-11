import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Switch,
  Typography,
} from '@material-ui/core';
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
      '& + $track': {
        backgroundColor: brandMain,
        opacity: 1,
        border: 'none',
      },
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
  checked: {},
});

const SwitchComponent = ({
  label,
  disabled,
  labelPlacement,
  helperContent,
}) => {
  const [state, setState] = React.useState({
    checked: false,
  });
  const classes = useStyles(disabled);

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <FormControlLabel
      control={
        <div>
          <Switch
            checked={state.checked}
            onChange={handleChange}
            name="checked"
            disabled={disabled}
            classes={{
              root: classes.root,
              switchBase: classes.switchBase,
              thumb: classes.thumb,
              track: classes.track,
              checked: classes.checked,
            }}
          />
          { helperContent ?
            <Typography variant="body2" style={{ color: textSecondary }}>
              <div>
                {helperContent}
              </div>
            </Typography>
            : null }
        </div>
      }
      labelPlacement={labelPlacement}
      value={labelPlacement}
      label={
        <Typography variant="caption" style={{ color: textSecondary }} >
          {label}
        </Typography>
      }
    />
  );
};

SwitchComponent.defaultProps = {
  disabled: false,
  label: null,
  labelPlacement: '',
  helperContent: '',
};

SwitchComponent.propTypes = {
  label: PropTypes.object,
  disabled: PropTypes.bool,
  labelPlacement: PropTypes.string,
  helperContent: PropTypes.string,
};

// eslint-disable-next-line import/no-unused-modules
export default SwitchComponent;
