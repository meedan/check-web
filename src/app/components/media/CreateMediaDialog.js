/* eslint-disable @calm/react-intl/missing-attribute */
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
          <FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />
        </Button>
        <Button type="submit" form={formId} id="create-media-dialog__submit-button" color="primary">
          <FormattedMessage id="global.submit" defaultMessage="Submit" description="Generic label for a button or link for a user to press when they wish to submit and form or action" />
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
