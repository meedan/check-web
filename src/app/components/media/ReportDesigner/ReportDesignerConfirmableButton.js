import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import ConfirmDialog from '../../layout/ConfirmDialog';

const useStyles = makeStyles(theme => ({
  button: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(1),
    boxShadow: 'none',
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
        <Button
          variant="contained"
          disabled={props.disabled}
          onClick={handleClick}
          className={[classes.button, props.className].join(' ')}
        >
          {props.icon}
          {props.label}
        </Button>
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
