import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Dialog from '@material-ui/core/Dialog';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import { getErrorMessage } from '../../helpers';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const messages = defineMessages({
  duplicating: {
    id: 'createTeamDialog.duplicating',
    defaultMessage: 'Duplicating…',
    description: 'Button label status message while duplicating a workspace is in process',
  },
  duplicate: {
    id: 'createTeamDialog.duplicate',
    defaultMessage: 'Duplicate',
    description: 'Button label to start to duplicate a workspace',
  },
  creating: {
    id: 'createTeamDialog.creating',
    defaultMessage: 'Creating…',
    description: 'Button label status message while creating a new workspace is in process',
  },
  create: {
    id: 'createTeamDialog.create',
    defaultMessage: 'Create',
    description: 'Button label to start to create a new workspace',
  },
});

const CreateTeamDialog = ({ onDismiss, team, intl }) => {
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState(team ? `Copy of ${team.name}` : '');
  const [slug, setSlug] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const autoSlug = name.toLowerCase().replace(/ /g, '-').replace(/[^-a-z0-9]/g, '').replace(/-+/g, '-');

  const handleError = (error) => {
    setSaving(false);
    const defaultErrorMessage = (
      <FormattedMessage
        id="createTeamDialog.defaultErrorMessage"
        defaultMessage="Could not create new workspace"
        description="Error message when a workspace could not be created"
      />
    );
    setErrorMessage(getErrorMessage(error, defaultErrorMessage));
  };

  const handleSuccess = (newTeamSlug) => {
    setSaving(false);
    window.location.assign(`/${newTeamSlug}`);
  };

  const handleCreate = () => {
    setSaving(true);
    setErrorMessage(null);

    const mutation = graphql`
      mutation CreateTeamDialogCreateTeamMutation($input: CreateTeamInput!) {
        createTeam(input: $input) {
          team {
            slug
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          name,
          slug: slug || autoSlug,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError(error);
        } else {
          handleSuccess(response.createTeam.team.slug);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  const handleDuplicate = () => {
    setSaving(true);
    setErrorMessage(null);

    const mutation = graphql`
      mutation CreateTeamDialogDuplicateTeamMutation($input: DuplicateTeamMutationInput!) {
        duplicateTeam(input: $input) {
          team {
            slug
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          team_id: team.id,
          custom_name: name,
          custom_slug: slug || autoSlug,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError(error);
        } else {
          handleSuccess(response.duplicateTeam.team.slug);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  const handleSubmit = team ? handleDuplicate : handleCreate;
  const { formatMessage } = intl;

  let buttonLabel = null;
  if (team && saving) {
    buttonLabel = formatMessage(messages.duplicating);
  } else if (team && !saving) {
    buttonLabel = formatMessage(messages.duplicate);
  } else if (!team && saving) {
    buttonLabel = formatMessage(messages.creating);
  } else if (!team && !saving) {
    buttonLabel = formatMessage(messages.create);
  }

  return (
    <Dialog className={styles['dialog-window']} open>
      <div className={styles['dialog-title']}>
        { team ?
          <>
            <FormattedMessage
              tagName="h6"
              id="createTeamDialog.dialogTitleDuplicate"
              defaultMessage="Duplicate workspace"
              description="Title of a dialog box to duplicate the current workspace"
            />
            <Alert
              className={styles['dialog-alert']}
              variant="info"
              content={
                <FormattedMessage
                  id="createTeamDialog.description"
                  defaultMessage="All settings from this workspace will be duplicated. No content will be added."
                  description="Description note to tell the user what information will be duplicated"
                />
              }
            />
          </> :
          <FormattedMessage
            tagName="h6"
            id="createTeamDialog.dialogTitleCreate"
            defaultMessage="Create new workspace"
            description="Dialog title for creating a new workspace"
          /> }
      </div>
      <div className={styles['dialog-content']}>
        <div className={inputStyles['form-fieldset']}>
          <div className={inputStyles['form-fieldset-field']}>
            <TextField
              required
              value={name}
              id="create-team-dialog__name-input"
              label={
                <FormattedMessage
                  id="createTeamDialog.name"
                  defaultMessage="Workspace name"
                  description="Text field label for the name of the new workspace"
                />
              }
              onChange={(e) => { setName(e.target.value); }}
            />
          </div>
          <div className={inputStyles['form-fieldset-field']}>
            <TextField
              required
              value={slug || autoSlug}
              label={
                <FormattedMessage
                  id="createTeamDialog.url"
                  defaultMessage="Workspace URL"
                  description="Text field label for the URL of the new workspace"
                />
              }
              onChange={(e) => {
                if (errorMessage) {
                  setErrorMessage(null);
                }
                setSlug(e.target.value);
              }}
              helpContent={errorMessage ? `${errorMessage}
              https://checkmedia.org/${slug || autoSlug}` : `https://checkmedia.org/${slug || autoSlug}`} // maintain line break to separate error message from help text
              error={Boolean(errorMessage)}
              helperText={errorMessage}
            />
          </div>
        </div>
      </div>
      <div className={styles['dialog-actions']}>
        <ButtonMain
          onClick={onDismiss}
          theme="text"
          variant="text"
          size="default"
          label={
            <FormattedMessage
              id="createTeamDialog.cancel"
              defaultMessage="Cancel"
              description="Button label to cancel creating a workspace"
            />
          }
        />
        <ButtonMain
          theme="brand"
          variant="contained"
          size="default"
          className="create-team-dialog__confirm-button"
          onClick={handleSubmit}
          disabled={saving || !name}
          label={buttonLabel}
        />
      </div>
    </Dialog>
  );
};

CreateTeamDialog.defaultProps = {
  team: null,
};

CreateTeamDialog.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  // If a team is passed as a prop, a duplicate of that team is created, instead of a blank new team
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }),
  intl: intlShape.isRequired,
};

export default createFragmentContainer(injectIntl(CreateTeamDialog), graphql`
  fragment CreateTeamDialog_team on Team {
    id
    name
    slug
  }
`);
