import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
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
  typeTextToConfirm,
}) => {
  const [confirmationText, setConfirmationText] = React.useState('');

  return (
    <Dialog open={open}>
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <Box>
          {body}
        </Box>
        { typeTextToConfirm ?
          <Box>
            <Typography variant="body1" component="p" paragraph>
              <strong>
                <FormattedMessage
                  id="confirmProceedDialog.confirmationText"
                  defaultMessage='Type "{text}" to permanently delete this language and all content in this language.'
                  values={{ text: typeTextToConfirm }}
                />
              </strong>
            </Typography>
            <FormattedMessage id="confirmProceedDialog.confirmationTextPlaceholder" defaultMessage="Type here">
              {placeholder => (
                <TextField
                  key={typeTextToConfirm}
                  id="confirm-proceed-dialog__confirmation-text"
                  name="confirmation-text"
                  placeholder={placeholder}
                  value={confirmationText}
                  onChange={(e) => { setConfirmationText(e.target.value); }}
                  variant="outlined"
                  fullWidth
                />
              )}
            </FormattedMessage>
          </Box> : null }
      </DialogContent>
      <DialogActions>
        <Box m={2}>
          { onCancel ?
            <Button className="confirm-proceed-dialog__cancel" onClick={onCancel}>
              { cancelLabel ||
                <FormattedGlobalMessage messageKey="cancel" />
              }
            </Button> : null }
          <Button
            id="confirm-dialog__confirm-action-button"
            className="confirm-proceed-dialog__proceed"
            color="primary"
            disabled={proceedDisabled || isSaving || confirmationText !== typeTextToConfirm}
            endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
            onClick={onProceed}
            variant="contained"
          >
            {proceedLabel}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

ConfirmProceedDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired,
  body: PropTypes.node.isRequired,
  cancelLabel: PropTypes.element,
  isSaving: PropTypes.bool,
  onCancel: PropTypes.func,
  onProceed: PropTypes.func.isRequired,
  proceedDisabled: PropTypes.bool,
  proceedLabel: PropTypes.node,
  typeTextToConfirm: PropTypes.string,
};

ConfirmProceedDialog.defaultProps = {
  onCancel: null,
  cancelLabel: null,
  proceedDisabled: false,
  isSaving: false,
  typeTextToConfirm: '',
  proceedLabel: (
    <FormattedMessage
      id="confirmProceedDialog.continue"
      defaultMessage="Continue"
    />
  ),
};

export default ConfirmProceedDialog;
