import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { SketchPicker } from 'react-color';

const useStyles = makeStyles(theme => ({
  statusButton: props => ({
    borderRadius: theme.spacing(0.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    color: 'white',
    backgroundColor: props.backgroundColor,
  }),
  statusButtonIcon: {
    fontSize: 32,
  },
}));

const ColorPicker = ({ color, onChange }) => {
  const classes = useStyles({ backgroundColor: color });
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = React.useState(null);

  return (
    <React.Fragment>
      <IconButton
        className={classes.statusButton}
        onClick={e => setColorPickerAnchorEl(e.currentTarget)}
      >
        <ExpandMoreIcon className={classes.statusButtonIcon} />
      </IconButton>
      <Popover
        open={Boolean(colorPickerAnchorEl)}
        anchorEl={colorPickerAnchorEl}
        onClose={() => setColorPickerAnchorEl(null)}
      >
        <SketchPicker
          color={color}
          onChangeComplete={onChange}
          disableAlpha
        />
      </Popover>
    </React.Fragment>
  );
};

ColorPicker.propTypes = {
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ColorPicker;
