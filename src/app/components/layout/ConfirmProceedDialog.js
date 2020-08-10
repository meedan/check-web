import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormattedGlobalMessage } from '../MappedMessage';

const ConfirmProceedDialog = ({
  open,
  title,
  body,
  cancelLabel,
  isSaving,
  onCancel,
  onProceed,
  proceedDisabled,
  proceedLabel,
}) => (
  <Dialog
    open={open}
  >
    <DialogTitle>
      {title}
    </DialogTitle>
    <DialogContent>
      {body}
    </DialogContent>
    <DialogActions>
      <Button className="confirm-proceed-dialog__cancel" onClick={onCancel}>
        { cancelLabel ||
          <FormattedGlobalMessage messageKey="cancel" />
        }
      </Button>
      <Button
        className="confirm-proceed-dialog__proceed"
        color="primary"
        disabled={proceedDisabled || isSaving}
        endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
        onClick={onProceed}
        variant="contained"
      >
        {proceedLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

ConfirmProceedDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.element.isRequired,
  body: PropTypes.element.isRequired,
  cancelLabel: PropTypes.element,
  isSaving: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
  proceedDisabled: PropTypes.bool,
  proceedLabel: PropTypes.element.isRequired,
};

ConfirmProceedDialog.defaultProps = {
  cancelLabel: null,
  proceedDisabled: false,
  isSaving: false,
};

export default ConfirmProceedDialog;
