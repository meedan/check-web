/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const ReportDesignerConfirmableButton = (props) => {
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
      <ButtonMain
        disabled={props.disabled}
        iconLeft={props.icon}
        label={props.label}
        theme={props.theme}
        variant="contained"
        onClick={handleClick}
      />
      <ConfirmProceedDialog
        body={props.content}
        open={opened}
        title={props.title}
        onProceed={props.onConfirm || handleClose}
        {...otherProps}
      />
    </React.Fragment>
  );
};

ReportDesignerConfirmableButton.defaultProps = {
  disabled: false,
  theme: '',
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
  theme: PropTypes.string,
  disabled: PropTypes.bool,
  cancelLabel: PropTypes.object,
  proceedLabel: PropTypes.object,
  noCancel: PropTypes.bool,
};

export default ReportDesignerConfirmableButton;
