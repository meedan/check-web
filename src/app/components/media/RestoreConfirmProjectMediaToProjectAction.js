import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FlashMessageSetterContext } from '../FlashMessage';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import SelectProjectDialog from './SelectProjectDialog';
import CheckArchivedFlags from '../../CheckArchivedFlags';

function handleRestore({
  team,
  project,
  projectMedia,
  context,
  onSuccess,
}) {
  const newContext = context;
  if (context.team && !context.team.public_team) {
    newContext.team.public_team = Object.assign({}, context.team);
  }
  const onFailure = () => {};

  Relay.Store.commitUpdate(
    new UpdateProjectMediaMutation({
      id: projectMedia.id,
      media: projectMedia,
      archived: CheckArchivedFlags.NONE,
      check_search_team: team.search,
      check_search_project: null,
      check_search_trash: team.check_search_trash,
      context: newContext,
      srcProj: null,
      dstProj: project,
    }),
    { onSuccess, onFailure },
  );
}

function RestoreConfirmProjectMediaToProjectAction({
  team,
  projectMedia,
  context,
  className,
}) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const openDialog = React.useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);
  const closeDialog = React.useCallback(() => setIsDialogOpen(false), [setIsDialogOpen]);

  const handleSubmit = React.useCallback((project) => {
    setIsDialogOpen(false);
    setIsSaving(true);
    handleRestore({
      team,
      project,
      projectMedia,
      context,
      onSuccess: () => {
        setIsSaving(false);
        const message = projectMedia.archived === CheckArchivedFlags.TRASHED ?
          (
            <FormattedMessage
              id="mediaActionsBar.movedRestoreBack"
              defaultMessage="Restored from trash, redirecting…"
            />
          ) :
          (
            <FormattedMessage
              id="mediaActionsBar.movedConfirmBack"
              defaultMessage="Confirmed, redirecting…"
            />
          );
        setFlashMessage(message, 'success');
        window.location.assign(window.location.pathname);
      },
      // FIXME: Add onFailure handler
    });
  }, [
    setFlashMessage, team, projectMedia, setIsDialogOpen, setIsSaving,
  ]);

  return (
    <React.Fragment>
      <Button
        id="media-actions-bar__restore-confirm-to"
        variant="contained"
        className={className}
        endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
        color="primary"
        onClick={openDialog}
      >
        { projectMedia.archived === CheckArchivedFlags.TRASHED ?
          <FormattedMessage id="mediaActionsBar.restoreTo" defaultMessage="Restore from trash" />
          : <FormattedMessage id="mediaActionsBar.confirmTo" defaultMessage="Confirm" />
        }
      </Button>
      <SelectProjectDialog
        open={isDialogOpen}
        team={team}
        excludeProjectDbids={projectMedia.project_ids}
        title={
          <FormattedMessage
            id="mediaActionsBar.dialogRestoreOrConfirmToListTitle"
            defaultMessage="Move item to list…"
          />
        }
        cancelLabel={<FormattedMessage id="mediaActionsBar.cancelButton" defaultMessage="Cancel" />}
        submitLabel={<FormattedMessage id="mediaActionsBar.restoreOrConfirm" defaultMessage="Move to list" />}
        submitButtonClassName="media-actions-bar__add-button"
        onCancel={closeDialog}
        onSubmit={handleSubmit}
      />

    </React.Fragment>
  );
}
RestoreConfirmProjectMediaToProjectAction.propTypes = {
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

export default createFragmentContainer(RestoreConfirmProjectMediaToProjectAction, {
  team: graphql`
    fragment RestoreConfirmProjectMediaToProjectAction_team on Team {
      search {
        id
        number_of_results
      }
      check_search_trash {
        id
        number_of_results
      }
      slug
      ...SelectProjectDialog_team
    }
  `,
  projectMedia: graphql`
    fragment RestoreConfirmProjectMediaToProjectAction_projectMedia on ProjectMedia {
      id
      dbid
      project_ids
      archived
    }
  `,
});
