import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import { FlashMessageSetterContext } from '../FlashMessage';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import CheckArchivedFlags from '../../CheckArchivedFlags';

function handleRestore({
  team,
  projectMedia,
  context,
  onSuccess,
  onFailure,
}) {
  const newContext = context;
  if (context.team && !context.team.public_team) {
    newContext.team.public_team = Object.assign({}, context.team);
  }

  Relay.Store.commitUpdate(
    new UpdateProjectMediaMutation({
      id: projectMedia.id,
      media: projectMedia,
      archived: CheckArchivedFlags.NONE,
      check_search_team: team.search,
      check_search_project: null,
      check_search_trash: team.check_search_trash,
      check_search_spam: team.check_search_spam,
      context: newContext,
      srcProj: null,
      dstProj: null,
    }),
    { onSuccess, onFailure },
  );
}

function RestoreProjectMedia({
  team,
  projectMedia,
  context,
  className,
}) {
  const [isSaving, setIsSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleSubmit = React.useCallback((project) => {
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
              defaultMessage="Item restored from Trash"
              description="Success message after restoring item from Trash."
            />
          ) :
          (
            <FormattedMessage
              id="mediaActionsBar.movedSpamBack"
              defaultMessage="Item marked as Not Spam"
              description="Success message after marking item as Not Spam."
            />
          );
        setFlashMessage(message, 'success');
        window.location.assign(window.location.pathname);
      },
      onFailure: () => {
        const message = projectMedia.archived === CheckArchivedFlags.TRASHED ?
          (
            <FormattedMessage
              id="mediaActionsBar.failedmovedRestoreBack"
              defaultMessage="Failed to restore the item. Please try again later."
              description="Failure message after attempting to restore an item from Trash."
            />
          ) :
          (
            <FormattedMessage
              id="mediaActionsBar.failedmovedSpamBack"
              defaultMessage="Failed to mark the item as Not Spam. Please try again later."
              description="Failure message after attempting to mark an item as Not Spam."
            />
          );
        setFlashMessage(message, 'error');
      },
    });
  }, [
    setFlashMessage, team, projectMedia, setIsSaving,
  ]);

  let buttonLabel = '';
  if (projectMedia.archived === CheckArchivedFlags.TRASHED) {
    buttonLabel = (
      <FormattedMessage
        id="mediaActionsBar.restoreTo"
        defaultMessage="Restore from Trash"
        description="Label for button that restores item from Trash"
      />
    );
  } else if (projectMedia.archived === CheckArchivedFlags.SPAM) {
    buttonLabel = (
      <FormattedMessage
        id="mediaActionsBar.notSpamTo"
        defaultMessage="Not spam"
        description="Label for button that marks an item as not spam"
      />
    );
  }

  if (projectMedia.archived === CheckArchivedFlags.NONE) {
    return null;
  }

  return (
    <ButtonMain
      buttonProps={{
        id: 'media-actions-bar__restore-confirm-to',
      }}
      label={buttonLabel}
      variant="contained"
      className={className}
      endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
      color="primary"
      onClick={handleSubmit}
    />
  );
}
RestoreProjectMedia.propTypes = {
  className: PropTypes.string.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
  }).isRequired,
};

export default createFragmentContainer(RestoreProjectMedia, {
  projectMedia: graphql`
    fragment RestoreProjectMedia_projectMedia on ProjectMedia {
      id
      archived
    }
  `,
});
