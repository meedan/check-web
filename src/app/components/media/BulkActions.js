import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import { withSetFlashMessage } from '../FlashMessage';
import MoveDialog from './MoveDialog';
import Can from '../Can';
import BulkUpdateProjectMediaMutation from '../../relay/mutations/BulkUpdateProjectMediaMutation';
import { Row } from '../../styles/js/shared';

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
          defaultMessage="Done! Please note that it can take a while until the items are actually added."
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
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0],
          ids: this.props.selectedMedia,
          teamSearchId: this.props.team.search_id,
          count: this.props.count,
          dstProject: null,
          dstProjectForAdd: null,
          srcProject: null,
          srcProjectForRemove: null,
        }),
        { onSuccess: onDone, onFailure: onDone },
      );
    }
  }

  handleRemoveSelectedFromList() {
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="bulkActions.removedSuccessfully"
          defaultMessage="Done! Please note that it can take a while until the items are actually removed from this list."
        />
      );
      this.props.setFlashMessage(message);
      this.props.onUnselectAll();
    };
    const onDone = () => {};

    onSuccess();

    if (this.props.selectedMedia.length) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0],
          ids: this.props.selectedMedia,
          teamSearchId: this.props.team.search_id,
          srcProjectForRemove: this.props.project,
          count: this.props.count,
          dstProject: null,
          dstProjectForAdd: null,
          srcProject: null,
        }),
        { onSuccess: onDone, onFailure: onDone },
      );
    }
  }

  handleMove() {
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="bulkActions.movedSuccessfully"
          defaultMessage="Done! Please note that it can take a while until the items are actually moved."
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
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0],
          ids: this.props.selectedMedia,
          dstProject: this.state.dstProj,
          srcProject: this.props.project,
          teamSearchId: this.props.team.search_id,
          count: this.props.count,
          dstProjectForAdd: null,
          srcProjectForRemove: null,
        }),
        { onSuccess: onDone, onFailure: onDone },
      );
    }
  }

  handleDelete = (params) => {
    const onSuccess = () => {
      const message = params.archived === 1 ? (
        <FormattedMessage
          id="bulkActions.moveToTrashSuccessfully"
          defaultMessage="Done! Please note that it can take a while until the items are actually moved to the trash."
        />
      ) : (
        <FormattedMessage
          id="bulkActions.restoredFromTrashSuccessfully"
          defaultMessage="Done! Please note that it can take a while until the items are actually restored from the trash."
        />
      );
      this.props.setFlashMessage(message);
      this.props.onUnselectAll();
      if (this.props.parentComponent) {
        this.props.parentComponent.props.relay.forceFetch();
      }
    };

    if (this.props.selectedMedia.length && !this.state.confirmationError) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0],
          ids: this.props.selectedMedia,
          srcProject: this.props.project,
          archived: params.archived,
          teamSearchId: this.props.team.search_id,
          count: this.props.count,
          dstProject: null,
          dstProjectForAdd: null,
          srcProjectForRemove: null,
        }),
        { onSuccess },
      );
    }
  };

  handleSelectDestProject(dstProj) {
    this.setState({ dstProj });
  }

  handleSelectDestProjectForAdd(dstProjForAdd) {
    this.setState({ dstProjForAdd });
  }

  render() {
    const { page, team, selectedMedia } = this.props;
    const disabled = selectedMedia.length === 0;

    const actions = (
      <div id="media-bulk-actions__actions">
        { page === 'trash' ?
          <Can permission="restore ProjectMedia" permissions={team.permissions}>
            <Tooltip title={
              <FormattedMessage
                id="bulkActions.restoreItemsFromTrash"
                defaultMessage="Restore selected items from trash"
              />
            }
            >
              <Button
                disabled={disabled}
                className="media-bulk-actions__restore-button"
                onClick={() => { this.handleDelete({ archived: 0 }); }}
                variant="outlined"
              >
                <FormattedMessage id="bulkActions.restore" defaultMessage="Restore from trash" />
              </Button>
            </Tooltip>
          </Can>
          :
          <Row>
            <Tooltip
              title={
                <FormattedMessage
                  id="bulkActions.add"
                  defaultMessage="Add selected items to another list"
                />
              }
              style={{ margin: '0 10px' }}
            >
              <Button
                id="media-bulk-actions__add-icon"
                disabled={disabled}
                onClick={this.addSelected.bind(this)}
                color="primary"
                variant="contained"
              >
                <FormattedMessage id="bulkActions.addTo" defaultMessage="Add to..." />
              </Button>
            </Tooltip>
            <Tooltip
              title={
                <FormattedMessage
                  id="bulkActions.move"
                  defaultMessage="Move selected items to another list"
                />
              }
              style={{ margin: '0 10px' }}
            >
              <Button
                id="media-bulk-actions__move-to"
                onClick={this.moveSelected.bind(this)}
                disabled={disabled}
                color="primary"
                variant="contained"
              >
                <FormattedMessage id="bulkActions.moveTo" defaultMessage="Move to..." />
              </Button>
            </Tooltip>
            { !/all-items/.test(window.location.pathname) ?
              <Tooltip
                title={
                  <FormattedMessage
                    id="bulkActions.remove"
                    defaultMessage="Remove selected items from this list"
                  />
                }
                style={{ margin: '0 10px' }}
              >
                <Button
                  id="media-bulk-actions__remove-from-list"
                  disabled={disabled}
                  style={{ margin: '0 8px', border: '1px solid #000' }}
                  onClick={this.handleRemoveSelectedFromList.bind(this)}
                >
                  <FormattedMessage
                    id="bulkActions.removeFromList"
                    defaultMessage="Remove from list"
                  />
                </Button>
              </Tooltip> : null }
            <Tooltip title={
              <FormattedMessage
                id="bulkActions.sendItemsToTrash"
                defaultMessage="Send selected items to trash"
              />
            }
            >
              <IconButton
                disabled={disabled}
                className="media-bulk-actions__delete-icon"
                onClick={() => { this.handleDelete({ archived: 1 }); }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Row>
        }
      </div>
    );

    const moveDialogActions = [
      <Button
        key="cancel"
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
      >
        <FormattedMessage
          id="bulkActions.cancelButton"
          defaultMessage="Cancel"
        />
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
    ];

    const addDialogActions = [
      <Button
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
        key="bulkActions.cancelAddButton"
      >
        <FormattedMessage
          id="bulkActions.cancelButton"
          defaultMessage="Cancel"
        />
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
    ];

    return (
      <span id="media-bulk-actions">
        {actions}

        <MoveDialog
          actions={moveDialogActions}
          open={this.state.openMoveDialog}
          onClose={this.handleCloseDialogs.bind(this)}
          team={this.props.team}
          excludeProjectDbids={this.props.project ? [this.props.project.dbid] : []}
          value={this.state.dstProj}
          onChange={this.handleSelectDestProject.bind(this)}
          title={
            <FormattedMessage
              id="bulkActions.dialogMoveTitle"
              defaultMessage="Move to a different list"
            />
          }
        />

        <MoveDialog
          actions={addDialogActions}
          open={this.state.openAddDialog}
          team={this.props.team}
          onClose={this.handleCloseDialogs.bind(this)}
          excludeProjectDbids={this.props.project ? [this.props.project.dbid] : []}
          value={this.state.dstProjectForAdd}
          onChange={this.handleSelectDestProjectForAdd.bind(this)}
          title={
            <FormattedMessage
              id="bulkActions.dialogAddTitle"
              defaultMessage="Add to a different list"
            />
          }
        />
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
    permissions
    search_id
  }
`);
