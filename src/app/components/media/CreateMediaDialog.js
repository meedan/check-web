/* eslint-disable @calm/react-intl/missing-attribute */
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
  const formId = 'create-media-dialog-form';

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <CreateMediaInput formId={formId} onSubmit={onSubmit} />
      </DialogContent>
      <DialogActions>
        <Button id="create-media-dialog__dismiss-button" onClick={onDismiss}>
          <FormattedMessage {...globalStrings.cancel} />
        </Button>
        <Button type="submit" form={formId} id="create-media-dialog__submit-button" color="primary">
          <FormattedMessage {...globalStrings.submit} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
CreateMediaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage>
  onSubmit: PropTypes.func.isRequired, // func({ ... }) => undefined
  onDismiss: PropTypes.func.isRequired, // func() => undefined
};
