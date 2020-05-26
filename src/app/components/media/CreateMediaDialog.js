import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CreateMediaInput from './CreateMediaInput';
import globalStrings from '../../globalStrings';

export default function CreateMediaDialog({
  open, title, onSubmit, onDismiss,
}) {
  const formRef = React.useRef(null);
  const handleClickSubmit = React.useCallback(() => {
    if (!formRef.current) {
      return;
    }
    formRef.current.dispatchEvent(new Event('submit')); // ick
  }, [formRef.current]);

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <CreateMediaInput formRef={formRef} onSubmit={onSubmit} />
      </DialogContent>
      <DialogActions>
        <Button id="create-media-dialog__dismiss-button" onClick={onDismiss}>
          <FormattedMessage {...globalStrings.cancel} />
        </Button>
        <Button id="create-media-dialog__submit-button" onClick={handleClickSubmit} color="primary">
          <FormattedMessage {...globalStrings.submit} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
CreateMediaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage>
};
