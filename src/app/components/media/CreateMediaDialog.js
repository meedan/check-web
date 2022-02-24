import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import CreateMediaInput from './CreateMediaInput';
import globalStrings from '../../globalStrings';

const useStyles = makeStyles({
  title: {
    '& h2': {
      fontSize: '20px',
    },
  },
});

export default function CreateMediaDialog({
  open, title, onSubmit, onDismiss, team,
}) {
  const classes = useStyles();
  const formId = 'create-media-dialog-form';

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle className={classes.title}>{title}</DialogTitle>
      <DialogContent>
        <CreateMediaInput formId={formId} onSubmit={onSubmit} team={team} />
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
