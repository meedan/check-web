import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import SettingsHeader from '../../team/SettingsHeader';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../../FlashMessage';

const useStyles = makeStyles(theme => ({
  newProjectHeader: {
    marginBottom: theme.spacing(-3),
    paddingBottom: 0,
  },
}));

const NewProject = ({
  type,
  open,
  noDescription,
  title,
  teamId,
  buttonLabel,
  helpUrl,
  onClose,
  errorMessage,
  successMessage,
  setFlashMessage,
}) => {
  const classes = useStyles();
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
    setFlashMessage(errorMessage, 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage(successMessage, 'success');
    setNewTitle('');
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
      title={
        <SettingsHeader
          title={title}
          helpUrl={helpUrl}
          className={classes.newProjectHeader}
        />
      }
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
            className="new-project__title"
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
              className="new-project__description"
              fullWidth
            /> : null }
        </React.Fragment>
      }
      proceedDisabled={!newTitle}
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
  type: PropTypes.oneOf(['folder', 'collection', 'list']).isRequired,
  teamId: PropTypes.number.isRequired,
  open: PropTypes.bool,
  noDescription: PropTypes.bool,
  title: PropTypes.object.isRequired,
  buttonLabel: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  helpUrl: PropTypes.string.isRequired,
  errorMessage: PropTypes.node.isRequired,
  successMessage: PropTypes.node.isRequired,
};

export default withSetFlashMessage(NewProject);
