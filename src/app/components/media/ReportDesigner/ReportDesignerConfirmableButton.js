import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

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
    if (props.onClose) {
      props.onClose();
    }
    setOpened(false);
  };

  const handleClick = () => {
    setOpened(true);
  };

  const otherProps = {};
  if (props.cancelLabel) {
    otherProps.cancelLabel = props.cancelLabel;
  }
  if (props.proceedLabel) {
    otherProps.proceedLabel = props.proceedLabel;
  }
  if (!props.noCancel) {
    otherProps.onCancel = handleClose;
  }

  return (
    <React.Fragment>
      <Button
        variant="contained"
        disabled={props.disabled}
        onClick={handleClick}
        className={[classes.button, props.className].join(' ')}
      >
        {props.icon}
        {props.label}
      </Button>
      <ConfirmProceedDialog
        open={opened}
        title={props.title}
        body={props.content}
        onProceed={props.onConfirm || handleClose}
        {...otherProps}
      />
    </React.Fragment>
  );
};

ReportDesignerConfirmableButton.defaultProps = {
  disabled: false,
  className: '',
  proceedLabel: null,
  cancelLabel: null,
  onConfirm: null,
  onClose: null,
  noCancel: false,
};

ReportDesignerConfirmableButton.propTypes = {
  label: PropTypes.object.isRequired,
  icon: PropTypes.object.isRequired,
  title: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  cancelLabel: PropTypes.object,
  proceedLabel: PropTypes.object,
  noCancel: PropTypes.bool,
};

export default ReportDesignerConfirmableButton;
