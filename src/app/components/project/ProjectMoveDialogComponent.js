/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import NewProject from '../drawer/Projects/NewProject';
import { withSetFlashMessage } from '../FlashMessage';

const ProjectMoveDialogComponent = ({
  team,
  project,
  projectGroups,
  onCancel,
  setFlashMessage,
}) => {
  const [showNewCollection, setShowNewCollection] = React.useState(false);
  const [selectedGroup, selectGroup] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="projectMoveDialogComponent.couldNotMove"
        defaultMessage="Could not move folder to collection"
        description="Error message displayed when it's not possible to move folder to a collection"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="projectMoveDialogComponent.movedSuccessfully"
        defaultMessage="Folder moved to collection successfully"
        description="Message displayed when a folder is moved to a collection"
      />
    ), 'success');
    onCancel();
  };

  const handleMove = () => {
    setSaving(true);

    commitMutation(Store, {
      mutation: graphql`
        mutation ProjectMoveDialogComponentUpdateProjectMutation($input: UpdateProjectInput!) {
          updateProject(input: $input) {
            project {
              id
              project_group_id
            }
            project_group {
              id
              medias_count
            }
            project_group_was {
              id
              medias_count
            }
          }
        }
      `,
      variables: {
        input: {
          id: project.id,
          previous_project_group_id: project.project_group_id,
          project_group_id: selectedGroup.dbid,
        },
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

  // If there are no collection, show a message and a button to create a new collection

  if (projectGroups.length === 0) {
    return (
      <React.Fragment>
        <ConfirmProceedDialog
          open={!showNewCollection}
          title={
            <FormattedMessage
              id="projectMoveDialogComponent.noCollectionsTitle"
              defaultMessage="Move folder to a collection"
            />
          }
          body={(
            <Typography variant="body1" component="p" paragraph>
              <FormattedMessage
                id="projectMoveDialogComponent.noCollectionsText"
                defaultMessage="There are no collections in {teamName}. You need to create a collection first."
                values={{ teamName: team.name }}
              />
            </Typography>
          )}
          proceedLabel={<FormattedMessage id="projectMoveDialogComponent.proceedLabel" defaultMessage="Create a new collection" />}
          onCancel={onCancel}
          onProceed={() => { setShowNewCollection(true); }}
        />
        <NewProject
          open={showNewCollection}
          type="collection"
          team={team}
          onClose={() => { setShowNewCollection(false); }}
          title={<FormattedMessage id="projectMoveDialogComponent.newCollection" defaultMessage="New collection" />}
          buttonLabel={<FormattedMessage id="projectMoveDialogComponent.createCollection" defaultMessage="Create collection" />}
        />
      </React.Fragment>
    );
  }

  // If there are collections, present a dialog so the user can choose a target collection

  return (
    <ConfirmProceedDialog
      open
      title={
        <FormattedMessage
          id="projectMoveDialogComponent.moveTitle"
          defaultMessage="Move folder to a collection"
        />
      }
      body={(
        <React.Fragment>
          <Autocomplete
            options={projectGroups}
            autoHighlight
            getOptionLabel={option => option.title}
            defaultValue={projectGroups.find(option => option.dbid === project.project_group_id)}
            renderInput={params => (
              <TextField
                id="project-move-dialog__input"
                {...params}
                label={<FormattedMessage id="projectMoveDialogComponent.choose" defaultMessage="Choose a collection" />}
                variant="outlined"
                fullWidth
              />
            )}
            onChange={(event, newValue) => {
              selectGroup(newValue);
            }}
          />
        </React.Fragment>
      )}
      proceedDisabled={!selectedGroup || saving}
      proceedLabel={<FormattedMessage id="projectMoveDialogComponent.proceedLabel2" defaultMessage="Move to collection" />}
      onCancel={onCancel}
      onProceed={handleMove}
    />
  );
};

ProjectMoveDialogComponent.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    project_group_id: PropTypes.number.isRequired,
  }).isRequired,
  team: PropTypes.shape({
    name: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  projectGroups: PropTypes.arrayOf(PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default withSetFlashMessage(ProjectMoveDialogComponent);
