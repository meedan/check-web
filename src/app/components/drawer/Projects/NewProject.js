import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import TextField from '@material-ui/core/TextField';
import { FormattedMessage } from 'react-intl';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../../FlashMessage';

const NewProject = ({
  type,
  open,
  noDescription,
  title,
  teamId,
  buttonLabel,
  onClose,
  setFlashMessage,
}) => {
  const [newTitle, setNewTitle] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const mutations = {
    folder: graphql`
      mutation NewProjectCreateProjectMutation($input: CreateProjectInput!) {
        createProject(input: $input) {
          team {
            projects(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  medias_count
                  project_group_id
                }
              }
            }
          }
        }
      }
    `,
    collection: graphql`
      mutation NewProjectCreateProjectGroupMutation($input: CreateProjectGroupInput!) {
        createProjectGroup(input: $input) {
          team {
            project_groups(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  medias_count
                }
              }
            }
          }
        }
      }
    `,
    list: graphql`
      mutation NewProjectCreateSavedSearchMutation($input: CreateSavedSearchInput!) {
        createSavedSearch(input: $input) {
          team {
            saved_searches(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  filters
                }
              }
            }
          }
        }
      }
    `,
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="newProject.defaultErrorMessage"
        defaultMessage="Could not create, please try again"
        description="Generic error message displayed when it's not possible to create a collection, folder or list"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="newProject.savedSuccessfully"
        defaultMessage="Created successfully"
        description="Generic message displayed when a collection, folder or list is created"
      />
    ), 'success');
    onClose();
  };

  const handleCreate = () => {
    setSaving(true);

    const input = {
      title: newTitle,
      team_id: teamId,
    };

    if (!noDescription) {
      input.description = newDescription;
    }

    commitMutation(Store, {
      mutation: mutations[type],
      variables: {
        input,
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <ConfirmProceedDialog
      open={open}
      title={title}
      body={
        <React.Fragment>
          <TextField
            label={
              <FormattedMessage
                id="projectsComponent.title"
                defaultMessage="Title"
              />
            }
            onChange={(e) => { setNewTitle(e.target.value); }}
            variant="outlined"
            margin="normal"
            fullWidth
          />
          { !noDescription ?
            <TextField
              label={
                <FormattedMessage
                  id="projectsComponent.description"
                  defaultMessage="Description"
                />
              }
              onChange={(e) => { setNewDescription(e.target.value); }}
              variant="outlined"
              margin="normal"
              fullWidth
            /> : null }
        </React.Fragment>
      }
      proceedLabel={buttonLabel}
      onProceed={handleCreate}
      isSaving={saving}
      cancelLabel={<FormattedMessage id="newProject.cancel" defaultMessage="Cancel" />}
      onCancel={onClose}
    />
  );
};

NewProject.defaultProps = {
  open: false,
  noDescription: false,
};

NewProject.propTypes = {
  type: PropTypes.oneOf(['folder', 'collection']).isRequired,
  teamId: PropTypes.number.isRequired,
  open: PropTypes.bool,
  noDescription: PropTypes.bool,
  title: PropTypes.object.isRequired,
  buttonLabel: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withSetFlashMessage(NewProject);
