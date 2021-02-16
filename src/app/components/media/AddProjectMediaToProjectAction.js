import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Link } from 'react-router';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { FlashMessageSetterContext } from '../FlashMessage';
import SelectProjectDialog from './SelectProjectDialog';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

function commitAddProjectMediaToProject({
  projectMedia, project, onSuccess, onFailure,
}) {
  return commitMutation(Relay.Store, {
    mutation: graphql`
      mutation AddProjectMediaToProjectActionMutation($input: CreateProjectMediaProjectInput!) {
        createProjectMediaProject(input: $input) {
          project_media {
            id
            project_ids
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
        }
      }
    `,
    optimisticResponse: {
      createProjectMediaProject: {
        project_media: {
          id: projectMedia.id,
          project_ids: [...projectMedia.project_ids, project.dbid].sort((a, b) => a - b),
        },
        project: {
          id: project.id,
          medias_count: project.medias_count + 1,
          search: {
            id: project.search_id,
            number_of_results: project.medias_count + 1,
          },
        },
      },
    },
    variables: {
      input: {
        project_media_id: projectMedia.dbid,
        project_id: project.dbid,
      },
    },
    onError: onFailure,
    onCompleted: (response, errors) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess();
    },
  });
}

function AddProjectMediaToProjectAction({ team, projectMedia, className }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(false), [setIsDialogOpen]);
  const handleSubmit = React.useCallback((project) => {
    setIsDialogOpen(false);
    setIsSaving(true);
    commitAddProjectMediaToProject({
      projectMedia,
      project,
      onSuccess: () => {
        setIsSaving(false);
        setFlashMessage((
          <FormattedMessage
            id="mediaMetadata.addedToList"
            defaultMessage="Added to list {listName}"
            values={{
              listName: (
                <Link to={`/${team.slug}/project/${project.dbid}`}>
                  {project.title}
                </Link>
              ),
            }}
          />
        ), 'success');
      },
      onFailure: (errors) => {
        setIsSaving(false);
        console.error(errors); // eslint-disable-line no-console
        setFlashMessage((
          getErrorMessageForRelayModernProblem(errors)
          || <GenericUnknownErrorMessage />
        ), 'success');
      },
    });
  }, [
    setFlashMessage, team, projectMedia, setIsDialogOpen, setIsSaving,
  ]);

  return (
    <React.Fragment>
      <Button
        id="media-actions-bar__add-to"
        variant="contained"
        className={className}
        endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
        color="primary"
        onClick={openDialog}
      >
        <FormattedMessage id="mediaActionsBar.addTo" defaultMessage="Add to…" />
      </Button>
      <SelectProjectDialog
        open={isDialogOpen}
        team={team}
        excludeProjectDbids={projectMedia.project_ids}
        title={
          <FormattedMessage
            id="mediaActionsBar.dialogAddToListTitle"
            defaultMessage="Add to a different list"
          />
        }
        cancelLabel={<FormattedMessage id="mediaActionsBar.cancelButton" defaultMessage="Cancel" />}
        submitLabel={<FormattedMessage id="mediaActionsBar.add" defaultMessage="Add" />}
        submitButtonClassName="media-actions-bar__add-button"
        onCancel={closeDialog}
        onSubmit={handleSubmit}
      />
    </React.Fragment>
  );
}
AddProjectMediaToProjectAction.propTypes = {
  className: PropTypes.string.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    project_ids: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  }).isRequired,
};

export default createFragmentContainer(AddProjectMediaToProjectAction, {
  team: graphql`
    fragment AddProjectMediaToProjectAction_team on Team {
      slug
      ...SelectProjectDialog_team
    }
  `,
  projectMedia: graphql`
    fragment AddProjectMediaToProjectAction_projectMedia on ProjectMedia {
      id
      dbid
      project_ids
    }
  `,
});
