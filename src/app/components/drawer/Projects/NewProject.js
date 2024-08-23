/* eslint-disable react/sort-prop-types */
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
  buttonLabel,
  errorMessage,
  onClose,
  open,
  setFlashMessage,
  successMessage,
  team,
  title,
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
      body={
        <FormattedMessage
          defaultMessage="Enter a short, easily remembered name for this custom list"
          description="Placeholder for creating a new custom list"
          id="projectsComponent.placeholder"
        >
          { placeholder => (
            <TextField
              className="new-project__title"
              componentProps={{
                id: 'new-project__title',
              }}
              label={
                <FormattedMessage
                  defaultMessage="Title"
                  description="Text field label for the title input"
                  id="projectsComponent.title"
                />
              }
              placeholder={placeholder}
              onChange={(e) => { setNewTitle(e.target.value); }}
            />
          )}
        </FormattedMessage>
      }
      cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Dialog label for the cancel button to close the dialog" id="newProject.cancel" />}
      isSaving={saving}
      open={open}
      proceedDisabled={!newTitle}
      proceedLabel={buttonLabel}
      title={title}
      onCancel={onClose}
      onProceed={handleCreate}
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
