/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Loader from '../cds/loading/Loader';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import { FlashMessageSetterContext } from '../FlashMessage';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import CheckArchivedFlags from '../../CheckArchivedFlags';

function handleRestore({
  context,
  onFailure,
  onSuccess,
  projectMedia,
  team,
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
  className,
  context,
  projectMedia,
  team,
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
              defaultMessage="Item restored from Trash"
              description="Success message after restoring item from Trash."
              id="mediaActionsBar.movedRestoreBack"
            />
          ) :
          (
            <FormattedMessage
              defaultMessage="Item marked as Not Spam"
              description="Success message after marking item as Not Spam."
              id="mediaActionsBar.movedSpamBack"
            />
          );
        setFlashMessage(message, 'success');
        window.location.assign(window.location.pathname);
      },
      onFailure: () => {
        const message = projectMedia.archived === CheckArchivedFlags.TRASHED ?
          (
            <FormattedMessage
              defaultMessage="Failed to restore the item. Please try again later."
              description="Failure message after attempting to restore an item from Trash."
              id="mediaActionsBar.failedmovedRestoreBack"
            />
          ) :
          (
            <FormattedMessage
              defaultMessage="Failed to mark the item as Not Spam. Please try again later."
              description="Failure message after attempting to mark an item as Not Spam."
              id="mediaActionsBar.failedmovedSpamBack"
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
        defaultMessage="Restore from Trash"
        description="Label for button that restores item from Trash"
        id="mediaActionsBar.restoreTo"
      />
    );
  } else if (projectMedia.archived === CheckArchivedFlags.SPAM) {
    buttonLabel = (
      <FormattedMessage
        defaultMessage="Not spam"
        description="Label for button that marks an item as not spam"
        id="mediaActionsBar.notSpamTo"
      />
    );
  }

  if (projectMedia.archived !== CheckArchivedFlags.TRASHED && projectMedia.archived !== CheckArchivedFlags.SPAM) {
    return null;
  }

  return (
    <ButtonMain
      buttonProps={{
        id: 'media-actions-bar__restore-confirm-to',
      }}
      className={className}
      color="primary"
      disabled={isSaving}
      iconLeft={isSaving ? <Loader size="icon" theme="grey" variant="icon" /> : null}
      label={buttonLabel}
      variant="contained"
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
