import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import globalStrings from '../../globalStrings';

function SetSourceDialog({
  open,
  sourceName,
  primaryUrl,
  onCancel,
  onSubmit,
}) {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        <FormattedMessage
          id="setSourceDialog.existingSource"
          defaultMessage="Existing source URL"
          description="Dialog title for existing source with same primary url"
        />
      </DialogTitle>
      <DialogContent>
        <Typography>
          <FormattedHTMLMessage
            id="setSourceDialog.existDescription"
            defaultMessage="An the source <b>{name}</b> with the primary URL <b>{url}</b> already exists."
            values={{
              name: sourceName,
              url: primaryUrl,
            }}
            description="Text to inform user about existing source"
          />
        </Typography>
        <Typography>
          <FormattedMessage
            id="setSourceDialog.confirm"
            defaultMessage="Do you want to use the existing sources for this media?"
            description="Confirm message to relate media to an existing source"
          />
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          className="source__create-use-existing-source"
          onClick={onSubmit}
        >
          <FormattedMessage
            id="setSourceDialog.useExistingSource"
            defaultMessage="Use existing source"
            description="Submit button to relate media to an existing source"
          />
        </Button>
        <Button color="primary" onClick={onCancel}>
          <FormattedMessage {...globalStrings.cancel} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SetSourceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  sourceName: PropTypes.string.isRequired,
  primaryUrl: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired, // func() => undefined
  onSubmit: PropTypes.func.isRequired, // func(<Project>) => undefined
};

export default SetSourceDialog;
