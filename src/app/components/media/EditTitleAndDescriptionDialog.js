import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import { FlashMessageSetterContext } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

function commitSetProjectMediaTitleAndDescription({
  projectMedia, title, description, onSuccess, onFailure,
}) {
  const metadata = {
    ...projectMedia.metadata,
    title: title.trim(),
    description: description.trim(),
  };
  if (!metadata.title && projectMedia.media.embed_path) {
    metadata.title = projectMedia.media.embed_path.split('/').pop().replace('embed_', '');
  }

  return commitMutation(Relay.Store, {
    mutation: graphql`
      mutation EditTitleAndDescriptionDialog_SubmitMutation($input: UpdateProjectMediaInput!) {
        updateProjectMedia(input: $input) {
          project_media {
            id
            metadata
            title  # redundant field
            description  # redundant field
          }
        }
      }
    `,
    optimisticResponse: {
      updateProjectMedia: {
        project_media: {
          id: projectMedia.id,
          metadata,
          title: metadata.title, // derived value
          description: metadata.description, // derived value
        },
      },
    },
    variables: {
      input: {
        id: projectMedia.id,
        metadata: JSON.stringify(metadata),
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

/**
 * Form prompting the user for new title+description.
 *
 * On submit, this form calls `onClose()` and starts writing the new values
 * to the database. If there's an error afterwards, it calls
 * `setFlashMessage()`.
 *
 * Internal state is `null` by default, meaning "the form values will be
 * whatever is in GraphQL". If the user starts editing, the edits will
 * persist until the user saves or the form is rendered with `open === false`.
 */
function EditTitleAndDescriptionDialog({
  projectMedia, open, onClose,
}) {
  // State is null by default: if the data changes, the form will update.
  const [newTitle, setNewTitle] = React.useState(null);
  const [newDescription, setNewDescription] = React.useState(null);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const handleChangeTitle = React.useCallback(
    ev => setNewTitle(ev.target.value),
    [setNewTitle],
  );
  const handleChangeDescription = React.useCallback(
    ev => setNewDescription(ev.target.value),
    [setNewDescription],
  );

  const formId = `edit-title-and-description-${projectMedia.dbid}`;

  React.useEffect(() => {
    // If ever the caller closes the dialog, clear its state.
    if (!open) {
      setNewTitle(null);
      setNewDescription(null);
    }
    // If ever a user update or server update makes the user-visible value
    // the same as the api-side value, clear its state.
    if (newTitle === projectMedia.metadata.title) {
      setNewTitle(null);
    }
    if (newDescription === projectMedia.metadata.description) {
      setNewDescription(null);
    }
  }, [open, newTitle, newDescription, setNewTitle, setNewDescription]);

  const title = newTitle === null ? projectMedia.metadata.title : newTitle;
  const description = newDescription === null ? projectMedia.metadata.description : newDescription;

  const handleSubmit = React.useCallback((ev) => {
    ev.preventDefault();
    onClose(); // useEffect() will clear state
    commitSetProjectMediaTitleAndDescription({
      projectMedia,
      title,
      description,
      onSuccess: () => {},
      onFailure: (errors) => {
        console.error(errors); // eslint-disable-line no-console
        setFlashMessage(getErrorMessageForRelayModernProblem(errors) || (
          <FormattedMessage
            id="mediaDetail.editReportError"
            defaultMessage="Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists."
            values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
          />
        ));
      },
    });
  }, [projectMedia, title, description, onClose, setFlashMessage]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage id="mediaDetail.editReport" defaultMessage="Edit" />
      </DialogTitle>
      <DialogContent>
        <form id={formId} onSubmit={handleSubmit} name="edit-media-form">
          <TextField
            autoFocus
            id="media-detail__title-input"
            label={<FormattedMessage id="mediaDetail.mediaTitle" defaultMessage="Title" />}
            value={title}
            onChange={handleChangeTitle}
            fullWidth
            margin="normal"
          />

          <TextField
            id="media-detail__description-input"
            label={
              <FormattedMessage id="mediaDetail.mediaDescription" defaultMessage="Description" />
            }
            value={description}
            onChange={handleChangeDescription}
            multiline
            fullWidth
            margin="normal"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="media-detail__cancel-edits">
          <FormattedMessage id="mediaDetail.cancelButton" defaultMessage="Cancel" />
        </Button>
        <Button
          type="submit"
          form={formId}
          className="media-detail__save-edits"
          disabled={newTitle === null && newDescription === null}
          color="primary"
        >
          <FormattedMessage id="mediaDetail.doneButton" defaultMessage="Done" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
EditTitleAndDescriptionDialog.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    metadata: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired,
    media: PropTypes.shape({
      embed_path: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(EditTitleAndDescriptionDialog, {
  projectMedia: graphql`
    fragment EditTitleAndDescriptionDialog_projectMedia on ProjectMedia {
      id
      dbid
      metadata
      media {
        embed_path
      }
    }
  `,
});
