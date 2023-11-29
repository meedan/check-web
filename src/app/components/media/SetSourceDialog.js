import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import dialogStyles from '../../styles/css/dialog.module.css';

function SetSourceDialog({
  open,
  sourceName,
  primaryUrl,
  onCancel,
  onSubmit,
}) {
  return (
    <Dialog className={dialogStyles['dialog-window']} open={open} maxWidth="sm" fullWidth>
      <div className={dialogStyles['dialog-title']}>
        { primaryUrl ?
          <FormattedMessage
            tagName="h6"
            id="setSourceDialog.existingSourceWithUrl"
            defaultMessage="Existing source URL"
            description="Dialog title for existing source with same primary url"
          /> :
          <FormattedMessage
            tagName="h6"
            id="setSourceDialog.existingSource"
            defaultMessage="Existing source name"
            description="Dialog title for existing source with same name"
          />
        }
      </div>
      <div className={dialogStyles['dialog-content']}>
        { primaryUrl ?
          <FormattedHTMLMessage
            tagName="p"
            id="setSourceDialog.existDescriptionWithUrl"
            defaultMessage="The source <strong>{name}</strong> with the primary URL <strong>{url}</strong> already exists."
            values={{
              name: sourceName,
              url: primaryUrl,
            }}
            description="Text to inform user about existing source"
          /> :
          <FormattedHTMLMessage
            tagName="p"
            id="setSourceDialog.existDescription"
            defaultMessage="The source <strong>{name}</strong> already exists."
            values={{
              name: sourceName,
            }}
            description="Text to inform user about existing source"
          />
        }
        <FormattedMessage
          tagName="p"
          id="setSourceDialog.confirm"
          defaultMessage="Do you want to use the existing sources for this media?"
          description="Confirm message to relate media to an existing source"
        />
      </div>
      <div className={dialogStyles['dialog-actions']}>
        <ButtonMain
          variant="text"
          theme="lightText"
          size="default"
          onClick={onCancel}
          label={
            <FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />
          }
        />
        <ButtonMain
          theme="brand"
          size="default"
          variant="contained"
          className="source__create-use-existing-source"
          onClick={onSubmit}
          label={
            <FormattedMessage
              id="setSourceDialog.useExistingSource"
              defaultMessage="Use existing source"
              description="Submit button to relate media to an existing source"
            />
          }
        />
      </div>
    </Dialog>
  );
}

SetSourceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  sourceName: PropTypes.string.isRequired,
  primaryUrl: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired, // func() => undefined
  onSubmit: PropTypes.func.isRequired, // func() => undefined
};

export default SetSourceDialog;
