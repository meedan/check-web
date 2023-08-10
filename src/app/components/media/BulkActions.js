/* eslint-disable @calm/react-intl/missing-attribute, relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ReportGmailerrorredIcon from '@material-ui/icons/ReportGmailerrorred';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import BulkActionsMenu from './BulkActionsMenu';
import Can from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';
import BulkArchiveProjectMediaMutation from '../../relay/mutations/BulkArchiveProjectMediaMutation';
import BulkRestoreProjectMediaMutation from '../../relay/mutations/BulkRestoreProjectMediaMutation';
import CheckArchivedFlags from '../../CheckArchivedFlags';

const useStyles = makeStyles(theme => ({
  // buttonSpan: a <span> between a <Tooltip> and a <Button>. (The <Button> may be
  // disabled, and disabled buttons can't be direct children of <Tooltip>.)
  buttonSpan: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
  },
}));

function ButtonWithTooltip({ title, ...buttonProps }) {
  const classes = useStyles();

  return (
    <Tooltip title={title}>
      <span className={classes.buttonSpan}>
        <Button {...buttonProps} />
      </span>
    </Tooltip>
  );
}
ButtonWithTooltip.propTypes = {
  title: PropTypes.element.isRequired, // <FormattedMessage>
  // every other prop is passed to <Button>
};

function IconButtonWithTooltip({ title, ...buttonProps }) {
  const classes = useStyles();

  return (
    <Tooltip title={title}>
      <span className={classes.buttonSpan}>
        <IconButton {...buttonProps} />
      </span>
    </Tooltip>
  );
}
IconButtonWithTooltip.propTypes = {
  title: PropTypes.element.isRequired, // <FormattedMessage>
  // every other prop is passed to <IconButton>
};

class BulkActions extends React.Component {
  fail = (transaction) => {
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    this.props.setFlashMessage(message, 'error');
  };

  handleRestoreOrConfirm = (params) => {
    const onSuccess = () => {
      const message = this.props.page === 'trash' ? (
        <FormattedMessage
          id="bulkActions.movedRestoreSuccessfully"
          defaultMessage="{count, plural, one {# item} other {# items}} moved from Trash to 'All'"
          values={{
            count: this.props.selectedMedia?.length,
          }}
          description="Banner displayed after items are moved successfully. 'All' here is the name of the default view in the workspace, which is localized under the id projectsComponent.allItems"
        />
      ) : (
        <FormattedMessage
          id="bulkActions.movedFromSpamSuccessfully"
          defaultMessage="{count, plural, one {# item} other {# items}} moved from Spam to 'All'"
          values={{
            count: this.props.selectedMedia?.length,
          }}
          description="Banner displayed after items are moved successfully. 'All' here is the name of the default view in the workspace, which is localized under the id projectsComponent.allItems"
        />
      );
      this.props.setFlashMessage(message, 'success');
      this.props.onUnselectAll();
    };

    if (this.props.selectedMedia.length) {
      Relay.Store.commitUpdate(
        new BulkRestoreProjectMediaMutation({
          ids: this.props.selectedMedia,
          team: this.props.team,
          archived_was: params.archived_was,
        }),
        { onSuccess, onFailure: this.fail },
      );
    }
  }

  handleArchive(archived) {
    const onSuccess = () => {
      const message = archived === CheckArchivedFlags.TRASHED ? (
        <FormattedMessage
          id="bulkActions.moveToTrashSuccessfully"
          defaultMessage="{count, plural, one {# item} other {# items}} moved to Trash."
          values={{
            count: this.props.selectedMedia?.length,
          }}
          description="Message that appears when one or more items have been selected and moved to the trash."
        />
      ) : (
        <FormattedMessage
          id="bulkActions.moveToSpamSuccessfully"
          defaultMessage="{count, plural, one {# item} other {# items}} moved to Spam."
          values={{
            count: this.props.selectedMedia?.length,
          }}
          description="Message that appears when one or more items have been selected and moved to spam."
        />
      );
      this.props.setFlashMessage(message, 'success');
      this.props.onUnselectAll();
    };

    if (this.props.selectedMedia.length) {
      const mutation = new BulkArchiveProjectMediaMutation({
        ids: this.props.selectedMedia,
        team: this.props.team,
        archived,
      });
      Relay.Store.commitUpdate(mutation, { onSuccess });
    }
  }

  render() {
    const {
      page, team, selectedMedia,
    } = this.props;
    const disabled = selectedMedia.length === 0;
    let actionsAvailable = null;
    let permissionKey = 'bulk_update ProjectMedia';
    if (page === 'trash' || page === 'spam') {
      let archivedWas = null;
      let moveTooltipMessage = null;
      let moveButtonMessage = null;
      if (page === 'trash') {
        permissionKey = 'restore ProjectMedia';
        archivedWas = CheckArchivedFlags.TRASHED;
        moveTooltipMessage = (
          <FormattedMessage
            id="bulkActions.trash"
            defaultMessage="Restore selected items and move them to another folder"
            description="Tooltip message for button that restores items from Trash"
          />
        );
        moveButtonMessage = (
          <FormattedMessage id="bulkActions.restore" defaultMessage="Restore from Trash" />
        );
      } else if (page === 'spam') {
        permissionKey = 'not_spam ProjectMedia';
        archivedWas = CheckArchivedFlags.SPAM;
        moveTooltipMessage = (
          <FormattedMessage
            id="bulkActions.spam"
            defaultMessage="Mark selected items as not spam and move them to 'All Items'"
            description="Tooltip message for button that mark items as not spam"
          />
        );
        moveButtonMessage = (
          <FormattedMessage id="bulkActions.notSpam" defaultMessage="Not Spam" />
        );
      }

      actionsAvailable = (
        <React.Fragment>
          <ButtonWithTooltip
            title={moveTooltipMessage}
            id="media-bulk-actions__move-to"
            onClick={() => this.handleRestoreOrConfirm({ archived_was: archivedWas })}
            disabled={disabled}
            color="primary"
            variant="contained"
          >
            {moveButtonMessage}
          </ButtonWithTooltip>
        </React.Fragment>
      );
    } else {
      actionsAvailable = (
        <BulkActionsMenu
          selectedMedia={this.props.selectedMedia}
          /*
            FIXME: The `selectedMedia` prop above contained IDs only, so I had to add the `selectedProjectMedia` prop
            below to contain the PM objects as the tagging mutation currently requires dbids and
            also for other requirements such as warning about published reports before bulk changing statuses
            additional data is needed.
            I suggest refactoring this later to nix the ID array and pass the ProjectMedia array only.
          */
          selectedProjectMedia={this.props.selectedProjectMedia}
          team={team}
        />
      );
    }

    const archiveButton = page === 'trash' || page === 'spam' ? null :
      (
        <span>
          <IconButtonWithTooltip
            title={
              <FormattedMessage
                id="bulkActions.sendItemsToSpam"
                defaultMessage="Mark as spam"
              />
            }
            disabled={disabled}
            className="media-bulk-actions__spam-icon"
            onClick={this.handleArchive.bind(this, CheckArchivedFlags.SPAM)}
          >
            <ReportGmailerrorredIcon />
          </IconButtonWithTooltip>
          <IconButtonWithTooltip
            title={
              <FormattedMessage
                id="bulkActions.sendItemsToTrash"
                defaultMessage="Send to trash"
              />
            }
            disabled={disabled}
            className="media-bulk-actions__delete-icon"
            onClick={this.handleArchive.bind(this, CheckArchivedFlags.TRASHED)}
          >
            <DeleteIcon />
          </IconButtonWithTooltip>
        </span>
      );

    return (
      <span id="media-bulk-actions">
        <Box id="media-bulk-actions__actions" display="flex" alignItems="center">
          <React.Fragment>
            <Can permission={permissionKey} permissions={team.permissions}>
              {actionsAvailable}
            </Can>
            {archiveButton}
          </React.Fragment>
        </Box>
      </span>
    );
  }
}

BulkActions.defaultProps = {
  page: null,
};

BulkActions.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
  page: PropTypes.string,
  selectedMedia: PropTypes.array.isRequired,
  selectedProjectMedia: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onUnselectAll: PropTypes.func.isRequired,
};

export default createFragmentContainer(withSetFlashMessage(BulkActions), graphql`
  fragment BulkActions_team on Team {
    id
    medias_count
    permissions
    search_id
    slug
    check_search_trash {
      id
      number_of_results
    }
    check_search_spam {
      id
      number_of_results
    }
    public_team {
      id
      trash_count
      spam_count
    }
  }
`);
