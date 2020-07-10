import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import globalStrings from '../../globalStrings';

const ConfirmProceedDialog = ({
  open,
  title,
  body,
  cancelLabel,
  onCancel,
  onLearnMore,
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
      { onLearnMore ?
        <Button color="primary" onClick={onLearnMore}>
          <FormattedMessage
            id="confirmProceed.learnMore"
            defaultMessage="Learn more"
          />
        </Button>
        : null
      }
      <Button onClick={onCancel}>
        { cancelLabel ||
          <FormattedMessage {...globalStrings.cancel} />
        }
      </Button>
      <Button
        color="primary"
        disabled={proceedDisabled}
        onClick={onProceed}
        variant="contained"
      >
        { proceedLabel ||
          <FormattedMessage
            id="confirmProceed.confirm"
            defaultMessage="Confirm and proceed"
          />
        }
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmProceedDialog;
