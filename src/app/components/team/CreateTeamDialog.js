import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { getErrorMessage } from '../../helpers';

const useStyles = makeStyles(theme => ({
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  actions: {
    padding: theme.spacing(3),
  },
}));

const CreateTeamDialog = ({ onDismiss, team }) => {
  const classes = useStyles();
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState(team ? `Copy of ${team.name}` : '');
  const [slug, setSlug] = React.useState(team ? `${team.slug}-copy-1` : '');
  const [errorMessage, setErrorMessage] = React.useState(null);
  const autoSlug = name.toLowerCase().replace(/ /g, '-').replace(/[^-a-z0-9]/g, '').replace(/-+/g, '-');

  const handleError = (error) => {
    setSaving(false);
    const defaultErrorMessage = (
      <FormattedMessage
        id="createTeamDialog.defaultErrorMessage"
        defaultMessage="Could not create new workspace"
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

  const textFieldProps = {
    className: classes.textField,
    variant: 'outlined',
    fullWidth: true,
  };

  const handleSubmit = team ? handleDuplicate : handleCreate;

  return (
    <Dialog open>
      <DialogTitle>
        { team ?
          <FormattedMessage
            id="createTeamDialog.dialogTitleDuplicate"
            defaultMessage="Duplicate workspace"
          /> :
          <FormattedMessage
            id="createTeamDialog.dialogTitleCreate"
            defaultMessage="Create new workspace"
          /> }
      </DialogTitle>
      <DialogContent>
        { team ?
          <Typography>
            <FormattedMessage
              id="createTeamDialog.description"
              defaultMessage="All settings from this workspace will be duplicated. No content will be added."
            />
          </Typography> : null }
        <TextField
          value={name}
          label={
            <FormattedMessage
              id="createTeamDialog.name"
              defaultMessage="Workspace name"
            />
          }
          onChange={(e) => { setName(e.target.value); }}
          {...textFieldProps}
        />
        <TextField
          value={slug || autoSlug}
          label={
            <FormattedMessage
              id="createTeamDialog.url"
              defaultMessage="Workspace URL"
            />
          }
          onChange={(e) => {
            if (errorMessage) {
              setErrorMessage(null);
            }
            setSlug(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                https://checkmedia.org/
              </InputAdornment>
            ),
          }}
          error={Boolean(errorMessage)}
          helperText={errorMessage}
          {...textFieldProps}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onDismiss}>
          <FormattedMessage
            id="createTeamDialog.cancel"
            defaultMessage="Cancel"
          />
        </Button>
        <Button color="primary" variant="contained" onClick={handleSubmit} disabled={saving || !name}>
          { team && saving ? <FormattedMessage id="createTeamDialog.duplicating" defaultMessage="Duplicating..." /> : null }
          { team && !saving ? <FormattedMessage id="createTeamDialog.duplice" defaultMessage="Duplicate" /> : null }
          { !team && saving ? <FormattedMessage id="createTeamDialog.creating" defaultMessage="Creating..." /> : null }
          { !team && !saving ? <FormattedMessage id="createTeamDialog.create" defaultMessage="Create" /> : null }
        </Button>
      </DialogActions>
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
};

export default CreateTeamDialog;
