import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import { withSetFlashMessage } from '../FlashMessage';
import MoveDialog from './MoveDialog';
import Can from '../Can';
import BulkArchiveProjectMediaMutation from '../../relay/mutations/BulkArchiveProjectMediaMutation';
import BulkRestoreProjectMediaMutation from '../../relay/mutations/BulkRestoreProjectMediaMutation';
import BulkUpdateProjectMediaProjectsMutation from '../../relay/mutations/BulkUpdateProjectMediaProjectsMutation';
import BulkDeleteProjectMediaProjectsMutation from '../../relay/mutations/BulkDeleteProjectMediaProjectsMutation';
import BulkCreateProjectMediaProjectsMutation from '../../relay/mutations/BulkCreateProjectMediaProjectsMutation';

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
      this.props.setFlashMessage(message);
      this.setState({ openAddDialog: false, dstProjForAdd: null });
      this.props.onUnselectAll();
    };
    const onDone = () => {};

    onSuccess();

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
      const message = (
        <FormattedMessage
          id="bulkActions.movedSuccessfully"
          defaultMessage="Items moved."
          description="Banner displayed after items are moved successfully"
        />
      );
      this.props.setFlashMessage(message);
      this.setState({ openMoveDialog: false, dstProj: null });
      this.props.onUnselectAll();
    };
    const onDone = () => {};

    onSuccess();

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

  handleDelete = (params) => {
    const onSuccess = () => {
      const message = params.archived === 1 ? (
        <FormattedMessage
          id="bulkActions.moveToTrashSuccessfully"
          defaultMessage="Items moved to the trash."
        />
      ) : (
        <FormattedMessage
          id="bulkActions.restoredFromTrashSuccessfully"
          defaultMessage="Items restored from the trash."
        />
      );
      this.props.setFlashMessage(message);
      this.props.onUnselectAll();
    };

    if (this.props.selectedMedia.length && !this.state.confirmationError) {
      const mutation = params.archived ?
        new BulkArchiveProjectMediaMutation({
          ids: this.props.selectedMedia,
          project: this.props.project,
          team: this.props.team,
        }) :
        new BulkRestoreProjectMediaMutation({
          ids: this.props.selectedMedia,
          project: this.props.project,
          team: this.props.team,
        });
      Relay.Store.commitUpdate(mutation, { onSuccess });
    }
  };

  handleSelectDestProject(dstProj) {
    this.setState({ dstProj });
  }

  handleSelectDestProjectForAdd(dstProjForAdd) {
    this.setState({ dstProjForAdd });
  }

  render() {
    const {
      page, team, selectedMedia, project,
    } = this.props;
    const disabled = selectedMedia.length === 0;

    return (
      <span id="media-bulk-actions">
        <span id="media-bulk-actions__actions">
          { page === 'trash' ? (
            <Can permission="restore ProjectMedia" permissions={team.permissions}>
              <ButtonWithTooltip
                title={
                  <FormattedMessage
                    id="bulkActions.restoreItemsFromTrash"
                    defaultMessage="Restore selected items from trash"
                  />
                }
                disabled={disabled}
                className="media-bulk-actions__restore-button"
                onClick={() => { this.handleDelete({ archived: 0 }); }}
                variant="outlined"
              >
                <FormattedMessage id="bulkActions.restore" defaultMessage="Restore from trash" />
              </ButtonWithTooltip>
            </Can>
          ) : (
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
              <MoveDialog
                actions={[
                  <Button
                    color="primary"
                    onClick={this.handleCloseDialogs.bind(this)}
                    key="bulkActions.cancelAddButton"
                  >
                    <FormattedMessage id="bulkActions.cancelButton" defaultMessage="Cancel" />
                  </Button>,
                  <Button
                    color="primary"
                    className="media-bulk-actions__add-button"
                    onClick={this.handleAdd.bind(this)}
                    disabled={!this.state.dstProjForAdd}
                    key="bulkActions.addButton"
                  >
                    <FormattedMessage id="bulkActions.addTitle" defaultMessage="Add" />
                  </Button>,
                ]}
                open={this.state.openAddDialog}
                team={this.props.team}
                onClose={this.handleCloseDialogs.bind(this)}
                excludeProjectDbids={project ? [project.dbid] : []}
                value={this.state.dstProjectForAdd}
                onChange={this.handleSelectDestProjectForAdd.bind(this)}
                title={
                  <FormattedMessage
                    id="bulkActions.dialogAddTitle"
                    defaultMessage="Add to a different list"
                  />
                }
              />

              {project ? (
                <React.Fragment>
                  <ButtonWithTooltip
                    title={
                      <FormattedMessage
                        id="bulkActions.move"
                        defaultMessage="Move selected items to another list"
                      />
                    }
                    id="media-bulk-actions__move-to"
                    onClick={this.moveSelected.bind(this)}
                    disabled={disabled}
                    color="primary"
                    variant="contained"
                  >
                    <FormattedMessage id="bulkActions.moveTo" defaultMessage="Move to…" />
                  </ButtonWithTooltip>
                  <MoveDialog
                    actions={[
                      <Button
                        key="cancel"
                        color="primary"
                        onClick={this.handleCloseDialogs.bind(this)}
                      >
                        <FormattedMessage id="bulkActions.cancelButton" defaultMessage="Cancel" />
                      </Button>,
                      <Button
                        key="move"
                        color="primary"
                        className="media-bulk-actions__move-button"
                        onClick={this.handleMove.bind(this)}
                        disabled={!this.state.dstProj}
                      >
                        <FormattedMessage id="bulkActions.moveTitle" defaultMessage="Move" />
                      </Button>,
                    ]}
                    open={this.state.openMoveDialog}
                    onClose={this.handleCloseDialogs.bind(this)}
                    team={this.props.team}
                    excludeProjectDbids={project ? [project.dbid] : []}
                    value={this.state.dstProj}
                    onChange={this.handleSelectDestProject.bind(this)}
                    title={
                      <FormattedMessage
                        id="bulkActions.dialogMoveTitle"
                        defaultMessage="Move to a different list"
                      />
                    }
                  />
                </React.Fragment>
              ) : null}

              <IconButtonWithTooltip
                title={
                  <FormattedMessage
                    id="bulkActions.sendItemsToTrash"
                    defaultMessage="Send selected items to trash"
                  />
                }
                disabled={disabled}
                className="media-bulk-actions__delete-icon"
                onClick={() => { this.handleDelete({ archived: 1 }); }}
              >
                <DeleteIcon />
              </IconButtonWithTooltip>
            </React.Fragment>
          )}
        </span>
      </span>
    );
  }
}

BulkActions.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
};

export default createFragmentContainer(withSetFlashMessage(BulkActions), graphql`
  fragment BulkActions_team on Team {
    ...MoveDialog_team
    id
    medias_count
    permissions
    search_id
    check_search_trash {
      id
      number_of_results
    }
    public_team {
      id
      trash_count
    }
  }
`);
