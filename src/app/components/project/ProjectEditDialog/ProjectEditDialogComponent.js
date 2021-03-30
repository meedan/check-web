import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import { withSetFlashMessage } from '../../FlashMessage';
import { FormattedGlobalMessage } from '../../MappedMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const useStyles = makeStyles(theme => ({
  editProjectButtons: {
    gap: `${theme.spacing(1)}px`,
    margin: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
}));

const ProjectEditDialogComponent = ({ project, onDismiss, setFlashMessage }) => {
  const classes = useStyles();
  const [saving, setSaving] = React.useState(false);
  const [title, setTitle] = React.useState(project.title);
  const [description, setDescription] = React.useState(project.description);
  const [showConfirmUpdateProjectDialog, setShowConfirmUpdateProjectDialog] = React.useState(false);

  const canSubmit = (title && (title !== project.title || description !== project.description));

  const handleError = () => {
    setSaving(false);
    // FIXME: Get error message from backend
    setFlashMessage((
      <FormattedMessage
        id="projectEditDialogComponent.ialogComponent.defaultErrorMessage"
        defaultMessage="Could not update list details."
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    onDismiss();
    setFlashMessage((
      <FormattedMessage
        id="projectEditDialogComponent.ialogComponent.savedSuccessfully"
        defaultMessage="List details updated successfully."
      />
    ), 'success');
  };

  const handleSave = () => {
    setShowConfirmUpdateProjectDialog(false);

    if (!canSubmit) {
      return;
    }

    setSaving(true);

    const mutation = graphql`
      mutation ProjectEditDialogComponentUpdateProjectMutation($input: UpdateProjectInput!) {
        updateProject(input: $input) {
          project {
            id
            title
            description
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: project.id,
          title,
          description,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <Dialog
      open
      className="project__edit-dialog"
      onClose={onDismiss}
    >
      <DialogTitle>
        <FormattedMessage
          id="projectEditDialogComponent.title"
          defaultMessage="List details"
        />
      </DialogTitle>
      <DialogContent className="project-edit project-edit__form">
        <TextField
          name="name"
          id="project-title-field"
          className="project-edit__title-field"
          label={<FormattedMessage id="projectEditDialogComponent.titleField" defaultMessage="Title" />}
          type="text"
          fullWidth
          value={title}
          onChange={(e) => { setTitle(e.target.value); }}
          margin="normal"
          variant="outlined"
        />

        <TextField
          name="description"
          id="project-description-field"
          className="project-edit__description-field"
          type="text"
          fullWidth
          multiline
          value={description}
          label={
            <FormattedMessage
              id="projectEditDialogComponent.descriptionField"
              defaultMessage="Description"
            />
          }
          onChange={(e) => { setDescription(e.target.value); }}
          margin="normal"
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Box display="flex" className={classes.editProjectButtons}>
          <Button
            onClick={onDismiss}
            className="project-edit__editing-button project-edit__editing-button--cancel"
          >
            <FormattedGlobalMessage messageKey="cancel" />
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="project-edit__editing-button project-edit__editing-button--save"
            onClick={() => { setShowConfirmUpdateProjectDialog(true); }}
            disabled={!canSubmit || saving}
          >
            <FormattedMessage id="projectEditDialogComponent.saveButton" defaultMessage="Update" />
          </Button>
        </Box>
      </DialogActions>
      <ConfirmProceedDialog
        open={showConfirmUpdateProjectDialog}
        title={
          <FormattedMessage
            id="projectEditDialogComponent.confirmProceedTitle"
            defaultMessage="Are you sure you want to change this list?"
          />
        }
        body={(
          <Box>
            <Typography variant="body1" component="p" paragraph>
              <FormattedMessage
                id="projectEditDialogComponent.confirmProceedBody"
                defaultMessage="Changes made to this list will be reflected for everyone in this workspace."
              />
            </Typography>
          </Box>
        )}
        proceedLabel={<FormattedMessage id="projectEditDialogComponent.confirmProceedLabel" defaultMessage="Save changes" />}
        onProceed={handleSave}
        cancelLabel={<FormattedMessage id="projectEditDialogComponent.confirmCancelLabel" defaultMessage="Go back" />}
        onCancel={() => { setShowConfirmUpdateProjectDialog(false); }}
      />
    </Dialog>
  );
};

ProjectEditDialogComponent.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(ProjectEditDialogComponent);
