import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import SelectProjectDialog from './SelectProjectDialog';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

function commitMoveProjectMediaToProject({
  projectMedia, fromProject, toProject, onSuccess, onFailure,
}) {
  const variables = {
    input: {
      id: projectMedia.id,
      project_id: toProject.dbid,
    },
  };
  const optimisticResponse = {
    updateProjectMedia: {
      project_media: {
        id: projectMedia.id,
        project_id: toProject.dbid,
        project: {
          id: toProject.id,
        },
      },
      project: {
        id: toProject.id,
        medias_count: toProject.medias_count + 1,
        search: {
          id: toProject.search_id,
          number_of_results: toProject.medias_count + 1,
        },
      },
    },
  };
  if (fromProject) {
    optimisticResponse.updateProjectMedia.project_was = {
      id: fromProject.id,
      medias_count: fromProject.medias_count - 1,
      search: {
        id: fromProject.search_id,
        number_of_results: fromProject.medias_count - 1,
      },
    };
    variables.input.previous_project_id = fromProject.dbid;
  }
  return commitMutation(Relay.Store, {
    mutation: graphql`
      mutation MoveProjectMediaActionMutation($input: UpdateProjectMediaInput!) {
        updateProjectMedia(input: $input) {
          project_media {
            id
            project_id
            project {
              id
            }
          }
          project {
            id
            medias_count
            search {
              id
              number_of_results
              # medias
            }
          }
          project_was {
            id
            medias_count
            search {
              id
              number_of_results
              # medias
            }
          }
        }
      }
    `,
    optimisticResponse,
    variables,
    onError: onFailure,
    onCompleted: onSuccess,
  });
}

function MoveProjectMediaAction({
  team, project, projectMedia, className,
}) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(false), [setIsDialogOpen]);
  const handleSubmit = React.useCallback((toProject) => {
    setIsDialogOpen(false);
    setIsSaving(true);
    commitMoveProjectMediaToProject({
      projectMedia,
      fromProject: project,
      toProject,
      onSuccess: () => {
        setIsSaving(false);
        browserHistory.push(`/${team.slug}/project/${toProject.dbid}`);
      },
      onFailure: (errors) => {
        setIsSaving(false);
        console.error(errors); // eslint-disable-line no-console
        setFlashMessage((
          getErrorMessageForRelayModernProblem(errors)
          || <GenericUnknownErrorMessage />
        ), 'error');
      },
    });
  }, [
    setFlashMessage, team, project, projectMedia, setIsDialogOpen, setIsSaving,
  ]);

  return (
    <React.Fragment>
      <Button
        id="media-actions-bar__move-to"
        variant="contained"
        className={className}
        endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
        color="primary"
        onClick={openDialog}
      >
        <FormattedMessage id="mediaActionsBar.moveTo" defaultMessage="Move to…" />
      </Button>
      <SelectProjectDialog
        open={isDialogOpen}
        team={team}
        excludeProjectDbids={[projectMedia.project_id]}
        title={
          <FormattedMessage
            id="mediaActionsBar.dialogMoveTitle"
            defaultMessage="Move to a different list"
          />
        }
        cancelLabel={<FormattedMessage id="mediaActionsBar.cancelButton" defaultMessage="Cancel" />}
        submitLabel={<FormattedMessage id="mediaActionsBar.move" defaultMessage="Move" />}
        submitButtonClassName="media-actions-bar__move-button"
        onCancel={closeDialog}
        onSubmit={handleSubmit}
      />
    </React.Fragment>
  );
}
MoveProjectMediaAction.propTypes = {
  className: PropTypes.string.isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    project_id: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(MoveProjectMediaAction, {
  team: graphql`
    fragment MoveProjectMediaAction_team on Team {
      slug
      ...SelectProjectDialog_team
    }
  `,
  projectMedia: graphql`
    fragment MoveProjectMediaAction_projectMedia on ProjectMedia {
      id
      dbid
      project_id
    }
  `,
  project: graphql`
    fragment MoveProjectMediaAction_project on Project {
      id
      dbid
      medias_count  # for mutation to decrease it
      search_id  # for mutation to update search.number_of_results
    }
  `,
});
