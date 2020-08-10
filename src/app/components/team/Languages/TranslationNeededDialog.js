import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { FormattedGlobalMessage } from '../../MappedMessage';

const TranslationNeededDialog = ({
  languageName,
  onClose,
  open,
}) => (
  <Dialog
    open={open}
  >
    <DialogTitle>
      <FormattedMessage id="translationNeededDialog.title" defaultMessage="Status translation needed" />
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" component="p">
        <FormattedMessage
          id="translationNeededDialog.body"
          defaultMessage="In order to make {language} the default language, you must first translate all existing statuses into {language} in the Statuses setting tab."
          values={{ language: <strong>{languageName}</strong> }}
        />
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button className="translation-needed-dialog__close" onClick={onClose}>
        <FormattedGlobalMessage messageKey="close" />
      </Button>
    </DialogActions>
  </Dialog>
);

TranslationNeededDialog.propTypes = {
  languageName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default TranslationNeededDialog;
