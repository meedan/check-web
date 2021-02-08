import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import SelectProjectDialog from './SelectProjectDialog';
import Can from '../Can';
import BulkArchiveProjectMediaMutation from '../../relay/mutations/BulkArchiveProjectMediaMutation';
import BulkRestoreProjectMediaMutation from '../../relay/mutations/BulkRestoreProjectMediaMutation';
import BulkUpdateProjectMediaProjectsMutation from '../../relay/mutations/BulkUpdateProjectMediaProjectsMutation';
import BulkDeleteProjectMediaProjectsMutation from '../../relay/mutations/BulkDeleteProjectMediaProjectsMutation';
import BulkCreateProjectMediaProjectsMutation from '../../relay/mutations/BulkCreateProjectMediaProjectsMutation';
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
  constructor(props) {
    super(props);
    this.state = {
      openMoveDialog: false,
      openAddDialog: false,
      dstProj: null,
      dstProjForAdd: null,
    };
  }

  moveSelected() {
    if (this.props.selectedMedia.length > 0) {
      this.setState({ openMoveDialog: true });
    }
  }

  addSelected() {
    if (this.props.selectedMedia.length > 0) {
      this.setState({ openAddDialog: true });
    }
  }

  handleCloseDialogs() {
    this.setState({ openMoveDialog: false, openAddDialog: false });
  }

  handleAdd() {
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="bulkActions.addedSuccessfully"
          defaultMessage="Items added to list."
          description="Banner displayed after items are added successfully to list"
        />
      );
      this.props.enqueueSnackbar(message, {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        variant: 'success',
      });
      this.setState({ openAddDialog: false, dstProjForAdd: null });
      this.props.onUnselectAll();
    };
    const onDone = () => {};

    if (this.props.selectedMedia.length && this.state.dstProjForAdd) {
      Relay.Store.commitUpdate(
        new BulkCreateProjectMediaProjectsMutation({
          projectMediaDbids: this.props.selectedProjectMediaDbids,
          project: this.state.dstProjForAdd,
        }),
        { onSuccess, onFailure: onDone },
      );
    }
  }

  handleRemoveSelectedFromList() {
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="bulkActions.removedSuccessfully"
          defaultMessage="Items removed from this list."
          description="Banner displayed after items are removed successfully from list"
        />
      );
      this.props.setFlashMessage(message);
      this.props.onUnselectAll();
    };
    const onDone = () => {};

    onSuccess();

    if (this.props.selectedMedia.length) {
      Relay.Store.commitUpdate(
        new BulkDeleteProjectMediaProjectsMutation({
          ids: this.props.selectedProjectMediaProjectIds,
          projectMediaIds: this.props.selectedMedia,
          project: this.props.project,
        }),
        { onSuccess, onFailure: onDone },
      );
    }
  }

  handleMove() {
    const onSuccess = () => {
      const {
        title: projectTitle,
        dbid: projectId,
      } = this.state.dstProj ? this.state.dstProj : { title: null, dbid: null };
      const message = (
        <FormattedMessage
          id="bulkActions.movedSuccessfully"
          defaultMessage="Items moved to '{toProject}'"
          description="Banner displayed after items are moved successfully"
          values={{
            toProject: (
              <Link to={`/${this.props.team.slug}/project/${projectId}`}>
                {projectTitle}
              </Link>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message);
      this.setState({ openMoveDialog: false, dstProj: null });
      this.props.onUnselectAll();
    };

    const onDone = () => {};

    if (this.props.selectedMedia.length && this.state.dstProj) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaProjectsMutation({
          ids: this.props.selectedProjectMediaProjectIds,
          projectMediaIds: this.props.selectedMedia,
          dstProject: this.state.dstProj,
          srcProject: this.props.project,
        }),
        { onSuccess, onFailure: onDone },
      );
    }
  }

  handleRestoreOrConfirm = (params) => {
    const onSuccess = () => {
      const {
        title: projectTitle,
        dbid: projectId,
      } = this.state.dstProj ? this.state.dstProj : { title: null, dbid: null };
      const message = params.archived_was === CheckArchivedFlags.TRASHED ?
        (
          <FormattedMessage
            id="bulkActions.movedRestoreSuccessfully"
            defaultMessage="Items moved from Trash to '{toProject}'"
            description="Banner displayed after items are moved successfully"
            values={{
              toProject: (
                <Link to={`/${this.props.team.slug}/project/${projectId}`}>
                  {projectTitle}
                </Link>
              ),
            }}
          />
        ) :
        (
          <FormattedMessage
            id="bulkActions.movedConfirmSuccessfully"
            defaultMessage="Items moved from Unconfirmed to '{toProject}'"
            description="Banner displayed after items are moved successfully"
            values={{
              toProject: (
                <Link to={`/${this.props.team.slug}/project/${projectId}`}>
                  {projectTitle}
                </Link>
              ),
            }}
          />
        );
      this.props.setFlashMessage(message);
      this.setState({ openMoveDialog: false, dstProj: null });
      this.props.onUnselectAll();
    };

    const onDone = () => {};

    if (this.props.selectedMedia.length && this.state.dstProj) {
      Relay.Store.commitUpdate(
        new BulkRestoreProjectMediaMutation({
          ids: this.props.selectedMedia,
          project: this.props.project,
          team: this.props.team,
          archived_was: params.archived_was,
          dstProject: this.state.dstProj,
        }),
        { onSuccess, onFailure: onDone },
      );
    }
  }

  handleDelete() {
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="bulkActions.moveToTrashSuccessfully"
          defaultMessage="Items moved to the Trash."
        />
      );
      this.props.setFlashMessage(message);
      this.props.onUnselectAll();
    };

    if (this.props.selectedMedia.length && !this.state.confirmationError) {
      const mutation = new BulkArchiveProjectMediaMutation({
        ids: this.props.selectedMedia,
        project: this.props.project,
        team: this.props.team,
      });
      Relay.Store.commitUpdate(mutation, { onSuccess });
    }
  }

  render() {
    const {
      page, team, selectedMedia, project,
    } = this.props;
    const disabled = selectedMedia.length === 0;

    let actionButtons = null;
    let modalToMove = null;
    let moveTooltipMessage = null;
    let moveButtonMessage = null;
    let archivedWas = CheckArchivedFlags.TRASHED;
    let moveAction = false;
    if (page === 'trash') {
      moveTooltipMessage = (
        <FormattedMessage
          id="bulkActions.trash"
          defaultMessage="Restore selected items and move items to another list"
        />
      );
      moveButtonMessage = (
        <FormattedMessage id="bulkActions.restore" defaultMessage="Restore from Trash" />
      );
    } else if (page === 'unconfirmed') {
      archivedWas = CheckArchivedFlags.UNCONFIRMED;
      moveTooltipMessage = (
        <FormattedMessage
          id="bulkActions.unconfirmed"
          defaultMessage="Confirm selected items and move items to another list"
        />
      );
      moveButtonMessage = (
        <FormattedMessage id="bulkActions.confirm" defaultMessage="Move from Unconfirmed" />
      );
    } else if (project) {
      moveAction = true;
      moveTooltipMessage = (
        <FormattedMessage
          id="bulkActions.move"
          defaultMessage="Move selected items to another list"
        />
      );
      moveButtonMessage = (
        <FormattedMessage id="bulkActions.moveTo" defaultMessage="Move to…" />
      );
    }

    const deleteButton = (
      <IconButtonWithTooltip
        title={
          <FormattedMessage
            id="bulkActions.sendItemsToTrash"
            defaultMessage="Send selected items to Trash"
          />
        }
        disabled={disabled}
        className="media-bulk-actions__delete-icon"
        onClick={this.handleDelete.bind(this)}
      >
        <DeleteIcon />
      </IconButtonWithTooltip>
    );

    if (moveTooltipMessage) {
      modalToMove = (
        <React.Fragment>
          <ButtonWithTooltip
            title={moveTooltipMessage}
            id="media-bulk-actions__move-to"
            onClick={this.moveSelected.bind(this)}
            disabled={disabled}
            color="primary"
            variant="contained"
          >
            {moveButtonMessage}
          </ButtonWithTooltip>
          <SelectProjectDialog
            open={this.state.openMoveDialog}
            excludeProjectDbids={project ? [project.dbid] : []}
            team={team}
            title={
              <FormattedMessage
                id="bulkActions.dialogMoveTitle"
                defaultMessage="{selectedCount, plural, one {Move 1 item to list…} other {Move # items to list…}}"
                values={{
                  selectedCount: this.props.selectedMedia.length,
                }}
              />
            }
            cancelLabel={<FormattedMessage id="bulkActions.cancelButton" defaultMessage="Cancel" />}
            submitLabel={<FormattedMessage id="bulkActions.moveTitle" defaultMessage="Move to list" />}
            submitButtonClassName="media-bulk-actions__move-button"
            onSubmit={(dstProj) => {
              this.setState({ dstProj }, () => (
                moveAction
                  ? this.handleMove()
                  : this.handleRestoreOrConfirm({ archived_was: archivedWas })
              ));
            }}
            onCancel={this.handleCloseDialogs.bind(this)}
          />
        </React.Fragment>
      );
    }
    switch (page) {
    case 'trash':
      actionButtons = (
        <Can permission="restore ProjectMedia" permissions={team.permissions}>
          {modalToMove}
        </Can>
      );
      break;
    case 'unconfirmed':
      actionButtons = (
        <React.Fragment>
          <Can permission="confirm ProjectMedia" permissions={team.permissions}>
            {modalToMove}
          </Can>
          {deleteButton}
        </React.Fragment>
      );
      break;
    default:
      actionButtons = (
        <React.Fragment>
          <ButtonWithTooltip
            title={
              <FormattedMessage
                id="bulkActions.add"
                defaultMessage="Add selected items to another list"
              />
            }
            id="media-bulk-actions__add-icon"
            disabled={disabled}
            onClick={this.addSelected.bind(this)}
            color="primary"
            variant="contained"
          >
            <FormattedMessage id="bulkActions.addTo" defaultMessage="Add to…" />
          </ButtonWithTooltip>
          <SelectProjectDialog
            open={this.state.openAddDialog}
            excludeProjectDbids={project ? [project.dbid] : []}
            team={team}
            title={
              <FormattedMessage
                id="bulkActions.dialogAddTitle"
                defaultMessage="Add to a different list"
              />
            }
            cancelLabel={<FormattedMessage id="bulkActions.cancelButton" defaultMessage="Cancel" />}
            submitLabel={<FormattedMessage id="bulkActions.addTitle" defaultMessage="Add" />}
            submitButtonClassName="media-bulk-actions__add-button"
            onSubmit={(dstProjForAdd) => {
              this.setState({ dstProjForAdd }, this.handleAdd);
            }}
            onCancel={this.handleCloseDialogs.bind(this)}
          />

          { project ? modalToMove : null }

          {deleteButton}
        </React.Fragment>
      );
      break;
    }

    return (
      <span id="media-bulk-actions">
        <span id="media-bulk-actions__actions">
          { actionButtons }
        </span>
      </span>
    );
  }
}

BulkActions.propTypes = {
  enqueueSnackbar: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
};

export default createFragmentContainer(withSnackbar(BulkActions), graphql`
  fragment BulkActions_team on Team {
    ...SelectProjectDialog_team
    id
    medias_count
    permissions
    search_id
    slug
    check_search_trash {
      id
      number_of_results
    }
    check_search_unconfirmed {
      id
      number_of_results
    }
    public_team {
      id
      trash_count
      unconfirmed_count
    }
  }
`);
