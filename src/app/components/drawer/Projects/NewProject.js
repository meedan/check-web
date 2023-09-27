import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { browserHistory } from 'react-router';
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
  open,
  title,
  team,
  buttonLabel,
  helpUrl,
  onClose,
  errorMessage,
  successMessage,
  setFlashMessage,
}) => {
  const classes = useStyles();
  const [newTitle, setNewTitle] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const mutations = {
    list: graphql`
      mutation NewProjectCreateSavedSearchMutation($input: CreateSavedSearchInput!) {
        createSavedSearch(input: $input) {
          saved_search {
            dbid
          }
          team {
            saved_searches(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  filters
                  medias_count: items_count
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
      team_id: team.dbid,
    };

    commitMutation(Store, {
      mutation: mutations.list,
      variables: {
        input,
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
          const listId = response.createSavedSearch.saved_search.dbid;
          browserHistory.push(`/${team.slug}/list/${listId}`);
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
        <TextField
          id="new-project__title"
          label={
            <FormattedMessage
              id="projectsComponent.title"
              defaultMessage="Title"
              description="Text field label for the title input"
            />
          }
          onChange={(e) => { setNewTitle(e.target.value); }}
          variant="outlined"
          margin="normal"
          className="new-project__title"
          fullWidth
        />
      }
      proceedDisabled={!newTitle}
      proceedLabel={buttonLabel}
      onProceed={handleCreate}
      isSaving={saving}
      cancelLabel={<FormattedMessage id="newProject.cancel" defaultMessage="Cancel" description="Dialog label for the cancel button to close the dialog" />}
      onCancel={onClose}
    />
  );
};

NewProject.defaultProps = {
  open: false,
};

NewProject.propTypes = {
  team: PropTypes.object.isRequired,
  open: PropTypes.bool,
  title: PropTypes.object.isRequired,
  buttonLabel: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  helpUrl: PropTypes.string.isRequired,
  errorMessage: PropTypes.node.isRequired,
  successMessage: PropTypes.node.isRequired,
};

export default withSetFlashMessage(NewProject);
