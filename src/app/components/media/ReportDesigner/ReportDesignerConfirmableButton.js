import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import ConfirmDialog from '../../layout/ConfirmDialog';

const useStyles = makeStyles(theme => ({
  button: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

const ReportDesignerConfirmableButton = (props) => {
  const classes = useStyles();
  const [opened, setOpened] = React.useState(false);

  const handleClose = () => {
    setOpened(false);
  };

  const handleClick = () => {
    setOpened(true);
  };

  return (
    <React.Fragment>
      <Tooltip title={props.tooltip}>
        <Box>
          <Button
            variant="contained"
            disabled={props.disabled}
            onClick={handleClick}
            className={[classes.button, props.className].join(' ')}
          >
            {props.icon}
            {props.label}
          </Button>
        </Box>
      </Tooltip>
      <ConfirmDialog
        open={opened}
        title={props.title}
        blurb={props.content}
        handleClose={handleClose}
        handleConfirm={props.onConfirm}
      />
    </React.Fragment>
  );
};

ReportDesignerConfirmableButton.defaultProps = {
  disabled: false,
  className: '',
};

ReportDesignerConfirmableButton.propTypes = {
  label: PropTypes.object.isRequired,
  icon: PropTypes.object.isRequired,
  tooltip: PropTypes.object.isRequired,
  title: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default ReportDesignerConfirmableButton;
