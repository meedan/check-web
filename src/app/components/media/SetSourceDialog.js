/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import dialogStyles from '../../styles/css/dialog.module.css';

function SetSourceDialog({
  onCancel,
  onSubmit,
  open,
  primaryUrl,
  sourceName,
}) {
  return (
    <Dialog className={dialogStyles['dialog-window']} fullWidth maxWidth="sm" open={open}>
      <div className={dialogStyles['dialog-title']}>
        { primaryUrl ?
          <FormattedMessage
            defaultMessage="Existing source URL"
            description="Dialog title for existing source with same primary url"
            id="setSourceDialog.existingSourceWithUrl"
            tagName="h6"
          /> :
          <FormattedMessage
            defaultMessage="Existing source name"
            description="Dialog title for existing source with same name"
            id="setSourceDialog.existingSource"
            tagName="h6"
          />
        }
      </div>
      <div className={dialogStyles['dialog-content']}>
        { primaryUrl ?
          <FormattedHTMLMessage
            defaultMessage="The source <strong>{name}</strong> with the primary URL <strong>{url}</strong> already exists."
            description="Text to inform user about existing source"
            id="setSourceDialog.existDescriptionWithUrl"
            tagName="p"
            values={{
              name: sourceName,
              url: primaryUrl,
            }}
          /> :
          <FormattedHTMLMessage
            defaultMessage="The source <strong>{name}</strong> already exists."
            description="Text to inform user about existing source"
            id="setSourceDialog.existDescription"
            tagName="p"
            values={{
              name: sourceName,
            }}
          />
        }
        <FormattedMessage
          defaultMessage="Do you want to use the existing sources for this media?"
          description="Confirm message to relate media to an existing source"
          id="setSourceDialog.confirm"
          tagName="p"
        />
      </div>
      <div className={dialogStyles['dialog-actions']}>
        <ButtonMain
          label={
            <FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />
          }
          size="default"
          theme="lightText"
          variant="text"
          onClick={onCancel}
        />
        <ButtonMain
          className="source__create-use-existing-source"
          label={
            <FormattedMessage
              defaultMessage="Use existing source"
              description="Submit button to relate media to an existing source"
              id="setSourceDialog.useExistingSource"
            />
          }
          size="default"
          theme="info"
          variant="contained"
          onClick={onSubmit}
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
