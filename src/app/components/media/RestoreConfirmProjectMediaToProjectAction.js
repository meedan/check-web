/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FlashMessageSetterContext } from '../FlashMessage';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import CheckArchivedFlags from '../../CheckArchivedFlags';

function handleRestore({
  team,
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
      check_search_spam: team.check_search_spam,
      context: newContext,
      srcProj: null,
      dstProj: null,
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
              defaultMessage="Restored item and move it to 'All'"
              description="Tooltip message for button that restores item from Trash.. 'All' here is the name of the default view in the workspace, which is localized under the id projectsComponent.allItems"
            />
          ) :
          (
            <FormattedMessage
              id="mediaActionsBar.movedSpamBack"
              defaultMessage="Marked item as not Spam and move it to 'All'"
              description="Tooltip message for button that marks items as not spam. 'All' here is the name of the default view in the workspace, which is localized under the id projectsComponent.allItems"
            />
          );
        setFlashMessage(message, 'success');
        window.location.assign(window.location.pathname);
      },
      // FIXME: Add onFailure handler
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
  } else if (projectMedia.archived === CheckArchivedFlags.UNCONFIRMED) {
    buttonLabel = (
      <FormattedMessage
        id="mediaActionsBar.confirmTo"
        defaultMessage="Confirm"
        description="Label for button that confirms an item"
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

  return (
    <React.Fragment>
      <Button
        id="media-actions-bar__restore-confirm-to"
        variant="contained"
        className={className}
        endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
        color="primary"
        onClick={handleSubmit}
      >
        { buttonLabel }
      </Button>
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
      check_search_spam {
        id
        number_of_results
      }
      slug
    }
  `,
  projectMedia: graphql`
    fragment RestoreConfirmProjectMediaToProjectAction_projectMedia on ProjectMedia {
      id
      dbid
      archived
    }
  `,
});
