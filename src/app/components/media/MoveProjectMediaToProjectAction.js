import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FormattedGlobalMessage } from '../MappedMessage';
import { FlashMessageSetterContext } from '../FlashMessage';
import SelectProjectDialog from './SelectProjectDialog';
import { stringHelper } from '../../customHelpers';

function commitMoveProjectMediaToProject({
  projectMedia, projectMediaProject, fromProject, toProject, onSuccess, onFailure,
}) {
  return commitMutation(Relay.Store, {
    mutation: graphql`
      mutation MoveProjectMediaToProjectActionMutation($input: UpdateProjectMediaProjectInput!) {
        updateProjectMediaProject(input: $input) {
          project_media_project {
            id
            project_id
            project {
              id
            }
            project_media {
              id
              project_ids
              # FIXME: we're missing "projects" here. Add RANGE_ADD/RANGE_DELETE.
              # [adamhooper, 2020-07-17] in the meantime, I'm altering other files
              # so nobody ever queries "ProjectMedia.projects". Maybe we can nix
              # the connection entirely? :)
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
    optimisticResponse: {
      updateProjectMediaProject: {
        project_media_project: {
          id: projectMediaProject.id,
          project_id: toProject.dbid,
          project: {
            id: toProject.id,
          },
          project_media: {
            id: projectMedia.id,
            project_ids: [
              ...projectMedia.project_ids.filter(id => id !== fromProject.dbid),
              toProject.dbid,
            ].sort((a, b) => a - b),
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
        project_was: {
          id: fromProject.id,
          medias_count: fromProject.medias_count - 1,
          search: {
            id: fromProject.search_id,
            number_of_results: fromProject.medias_count - 1,
          },
        },
      },
    },
    variables: {
      input: {
        project_media_id: projectMedia.dbid,
        project_id: toProject.dbid,
        previous_project_id: fromProject.dbid,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function MoveProjectMediaToProjectAction({
  team, project, projectMedia, projectMediaProject, className,
}) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const handleSubmit = React.useCallback((toProject) => {
    setIsDialogOpen(false);
    setIsSaving(true);
    commitMoveProjectMediaToProject({
      projectMedia,
      projectMediaProject,
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
          <FormattedGlobalMessage
            messageKey="unknownError"
            values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
          />
        ));
      },
    });
  }, [
    setFlashMessage, team, project, projectMedia, projectMediaProject, setIsDialogOpen, setIsSaving,
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
        <FormattedMessage id="mediaActionsBar.moveTo" defaultMessage="Move to..." />
      </Button>
      <SelectProjectDialog
        open={isDialogOpen}
        team={team}
        excludeProjectDbids={projectMedia.project_ids}
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
MoveProjectMediaToProjectAction.propTypes = {
  className: PropTypes.string.isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    project_ids: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  projectMediaProject: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(MoveProjectMediaToProjectAction, {
  team: graphql`
    fragment MoveProjectMediaToProjectAction_team on Team {
      slug
      ...SelectProjectDialog_team
    }
  `,
  projectMedia: graphql`
    fragment MoveProjectMediaToProjectAction_projectMedia on ProjectMedia {
      id
      dbid
      project_ids
    }
  `,
  projectMediaProject: graphql`
    fragment MoveProjectMediaToProjectAction_projectMediaProject on ProjectMediaProject {
      id
    }
  `,
  project: graphql`
    fragment MoveProjectMediaToProjectAction_project on Project {
      id
      dbid
      medias_count  # for mutation to decrease it
      search_id  # for mutation to update search.number_of_results
    }
  `,
});
