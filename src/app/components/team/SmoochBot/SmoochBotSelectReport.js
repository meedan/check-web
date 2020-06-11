import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import AutoCompleteMediaItem from '../../media/AutoCompleteMediaItem';

const useStyles = makeStyles(() => ({
  dialog: {
    minHeight: 200,
  },
}));

const SmoochBotSelectReport = (props) => {
  const classes = useStyles();
  const [resource, setResource] = React.useState(null);

  const handleSelect = (newResource) => {
    setResource(newResource);
  };

  const handleConfirm = () => {
    props.onSelect(resource);
  };

  return (
    <Dialog
      open
      disableEnforceFocus
      fullWidth
    >
      <DialogTitle>
        <FormattedMessage
          id="smoochBotSelectReport.dialogTitle"
          defaultMessage="Select a report"
        />
      </DialogTitle>
      <DialogContent className={classes.dialog}>
        <Typography component="div">
          <FormattedMessage
            id="smoochBotSelectReport.dialogDescription"
            defaultMessage="Search for the title of the item that you want to send as a report. The bot will reply to the user with this report. The report must be completed before you can search for it here."
          />
        </Typography>
        <AutoCompleteMediaItem
          onlyPublished
          media={{}}
          onSelect={handleSelect}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onDismiss}>
          <FormattedMessage
            id="smoochBotSelectReport.cancel"
            defaultMessage="Cancel"
          />
        </Button>
        <Button color="primary" onClick={handleConfirm}>
          <FormattedMessage
            id="smoochBotSelectReport.confirm"
            defaultMessage="Confirm"
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SmoochBotSelectReport.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default SmoochBotSelectReport;
