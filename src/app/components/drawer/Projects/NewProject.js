import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import TextField from '../../cds/inputs/TextField';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../../FlashMessage';

const NewProject = ({
  open,
  title,
  team,
  buttonLabel,
  onClose,
  errorMessage,
  successMessage,
  setFlashMessage,
}) => {
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
      title={title}
      body={
        <FormattedMessage
          id="projectsComponent.placeholder"
          defaultMessage="Enter a short, easily remembered name for this custom list"
          description="Placeholder for creating a new custom list"
        >
          { placeholder => (
            <TextField
              componentProps={{
                id: 'new-project__title',
              }}
              placeholder={placeholder}
              label={
                <FormattedMessage
                  id="projectsComponent.title"
                  defaultMessage="Title"
                  description="Text field label for the title input"
                />
              }
              onChange={(e) => { setNewTitle(e.target.value); }}
              className="new-project__title"
            />
          )}
        </FormattedMessage>
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
  errorMessage: PropTypes.node.isRequired,
  successMessage: PropTypes.node.isRequired,
};

export default withSetFlashMessage(NewProject);
