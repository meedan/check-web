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
// TODO write a separate mutation per action, to simplify code+tests
import BulkUpdateProjectMediaMutation from '../../relay/mutations/BulkUpdateProjectMediaMutation';

// https://material-ui.com/components/tooltips/#disabled-elements
const ButtonInASpan = React.forwardRef((props, ref) => (
  <span ref={ref}><Button {...props} /></span>
));
ButtonInASpan.displayName = 'ButtonInASpan';
const IconButtonInASpan = React.forwardRef((props, ref) => (
  <span ref={ref}><IconButton {...props} /></span>
));
IconButtonInASpan.displayName = 'IconButtonInASpan';

// Generic Relay success/failure handlers
const onSuccess = () => {};
const onFailure = err => console.error(err); // eslint-disable-line no-console

class BulkActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openMoveDialog: false,
      openAddDialog: false,
      dstProject: null,
      dstProjectForAdd: null,
    };
  }

  handleClickMove = () => {
    if (this.props.selectedMedia.length > 0) {
      this.setState({ openMoveDialog: true });
    }
  }

  handleClickAdd = () => {
    if (this.props.selectedMedia.length > 0) {
      this.setState({ openAddDialog: true });
    }
  }

  handleCloseDialogs = () => {
    this.setState({ openMoveDialog: false, openAddDialog: false });
  }

  handleSubmitAdd = () => {
    if (this.props.selectedMedia.length && this.state.dstProjectForAdd) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0], // FIXME nix this parameter from API
          ids: this.props.selectedMedia,
          teamSearchId: this.props.team.search_id,
          count: this.props.count,
          dstProjectForAdd: this.state.dstProjectForAdd,
          dstProject: null,
          srcProject: null,
          srcProjectForRemove: null,
        }),
        { onSuccess, onFailure },
      );
    }

    const message = (
      <FormattedMessage
        id="bulkActions.addedSuccessfully"
        defaultMessage="Done! Please note that it can take a while until the items are actually added."
      />
    );
    this.props.setFlashMessage(message);
    this.setState({ openAddDialog: false, dstProjectForAdd: null });
    this.props.onUnselectAll();
  }

  handleClickRemove = () => {
    if (this.props.selectedMedia.length) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0], // FIXME nix this parameter from API
          ids: this.props.selectedMedia,
          teamSearchId: this.props.team.search_id,
          srcProjectForRemove: this.props.project,
          count: this.props.count,
          dstProject: null,
          dstProjectForAdd: null,
          srcProject: null,
        }),
        { onSuccess, onFailure },
      );
    }

    const message = (
      <FormattedMessage
        id="bulkActions.removedSuccessfully"
        defaultMessage="Done! Please note that it can take a while until the items are actually removed from this list."
      />
    );
    this.props.setFlashMessage(message);
    this.props.onUnselectAll();
  }

  handleSubmitMove = () => {
    if (this.props.selectedMedia.length && this.state.dstProject) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0], // FIXME nix this parameter from API
          ids: this.props.selectedMedia,
          dstProject: this.state.dstProject,
          srcProject: this.props.project,
          teamSearchId: this.props.team.search_id,
          count: this.props.count,
          dstProjectForAdd: null,
          srcProjectForRemove: null,
        }),
        { onSuccess, onFailure },
      );
    }

    const message = (
      <FormattedMessage
        id="bulkActions.movedSuccessfully"
        defaultMessage="Done! Please note that it can take a while until the items are actually moved."
      />
    );
    this.props.setFlashMessage(message);
    this.setState({ openMoveDialog: false, dstProject: null });
    this.props.onUnselectAll();
  }

  handleClickSendToTrash = () => {
    this.updateArchived(true);
  }

  handleClickRestoreFromTrash = () => {
    this.updateArchived(false);
  }

  handleChangeDstProject = (dstProject) => {
    this.setState({ dstProject });
  }

  handleChangeDstProjectForAdd = (dstProjectForAdd) => {
    this.setState({ dstProjectForAdd });
  }

  updateArchived(archived) {
    const onSuccessShowMessage = () => {
      const message = archived ? (
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
          id: this.props.selectedMedia[0], // FIXME nix this parameter from API
          ids: this.props.selectedMedia,
          srcProject: this.props.project,
          archived: archived ? 1 : 0, // FIXME API should accept true/false, not 1/0
          teamSearchId: this.props.team.search_id,
          count: this.props.count,
          dstProject: null,
          dstProjectForAdd: null,
          srcProjectForRemove: null,
        }),
        { onSuccess: onSuccessShowMessage, onFailure },
      );
    }
  }

  render() {
    const {
      page,
      team,
      project,
      selectedMedia,
    } = this.props;
    const disabled = selectedMedia.length === 0;

    return (
      <div id="media-bulk-actions">
        { page === 'trash' ?
          <Can permission="restore ProjectMedia" permissions={team.permissions}>
            <Tooltip title={
              <FormattedMessage
                id="bulkActions.restoreItemsFromTrash"
                defaultMessage="Restore selected items from trash"
              />
            }
            >
              <ButtonInASpan
                disabled={disabled}
                className="media-bulk-actions__restore-button"
                onClick={this.handleClickRestoreFromTrash}
                variant="outlined"
              >
                <FormattedMessage id="bulkActions.restore" defaultMessage="Restore from trash" />
              </ButtonInASpan>
            </Tooltip>
          </Can>
          :
          <React.Fragment>
            <Tooltip
              title={
                <FormattedMessage
                  id="bulkActions.add"
                  defaultMessage="Add selected items to another list"
                />
              }
              style={{ margin: '0 10px' }}
            >
              <ButtonInASpan
                id="media-bulk-actions__add-icon"
                disabled={disabled}
                onClick={this.handleClickAdd}
                color="primary"
                variant="contained"
              >
                <FormattedMessage id="bulkActions.addTo" defaultMessage="Add to..." />
              </ButtonInASpan>
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
              <ButtonInASpan
                id="media-bulk-actions__move-to"
                onClick={this.handleClickMove}
                disabled={disabled}
                color="primary"
                variant="contained"
              >
                <FormattedMessage id="bulkActions.moveTo" defaultMessage="Move to..." />
              </ButtonInASpan>
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
                <ButtonInASpan
                  id="media-bulk-actions__remove-from-list"
                  disabled={disabled}
                  style={{ margin: '0 8px', border: '1px solid #000' }}
                  onClick={this.handleClickRemove}
                >
                  <FormattedMessage
                    id="bulkActions.removeFromList"
                    defaultMessage="Remove from list"
                  />
                </ButtonInASpan>
              </Tooltip> : null }
            <Tooltip title={
              <FormattedMessage
                id="bulkActions.sendItemsToTrash"
                defaultMessage="Send selected items to trash"
              />
            }
            >
              <IconButtonInASpan
                disabled={disabled}
                className="media-bulk-actions__delete-icon"
                onClick={this.handleClickSendToTrash}
              >
                <DeleteIcon />
              </IconButtonInASpan>
            </Tooltip>
          </React.Fragment>
        }

        <MoveDialog
          actions={[
            <Button key="cancel" color="primary" onClick={this.handleCloseDialogs}>
              <FormattedMessage id="bulkActions.cancelButton" defaultMessage="Cancel" />
            </Button>,
            <Button
              key="move"
              color="primary"
              className="media-bulk-actions__move-button"
              onClick={this.handleSubmitMove}
              disabled={!this.state.dstProject}
            >
              <FormattedMessage id="bulkActions.moveTitle" defaultMessage="Move" />
            </Button>,
          ]}
          open={this.state.openMoveDialog}
          onClose={this.handleCloseDialogs}
          team={this.props.team}
          excludeProjectDbids={project ? [project.dbid] : []}
          value={this.state.dstProject}
          onChange={this.handleChangeDstProject}
          title={
            <FormattedMessage
              id="bulkActions.dialogMoveTitle"
              defaultMessage="Move to a different list"
            />
          }
        />

        <MoveDialog
          actions={[
            <Button
              color="primary"
              onClick={this.handleCloseDialogs}
              key="bulkActions.cancelAddButton"
            >
              <FormattedMessage id="bulkActions.cancelButton" defaultMessage="Cancel" />
            </Button>,
            <Button
              color="primary"
              className="media-bulk-actions__add-button"
              onClick={this.handleSubmitAdd}
              disabled={!this.state.dstProjectForAdd}
              key="bulkActions.addButton"
            >
              <FormattedMessage id="bulkActions.addTitle" defaultMessage="Add" />
            </Button>,
          ]}
          open={this.state.openAddDialog}
          team={this.props.team}
          onClose={this.handleCloseDialogs}
          excludeProjectDbids={project ? [project.dbid] : []}
          value={this.state.dstProjectForAdd}
          onChange={this.handleChangeDstProjectForAdd}
          title={
            <FormattedMessage
              id="bulkActions.dialogAddTitle"
              defaultMessage="Add to a different list"
            />
          }
        />
      </div>
    );
  }
}
BulkActions.defaultProps = {
  project: null,
};
BulkActions.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
  project: PropTypes.object, // or null
  selectedMedia: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(BulkActions), graphql`
  fragment BulkActions_team on Team {
    ...MoveDialog_team
    permissions
    search_id
  }
  fragment BulkActions_project on Project {
    id
    dbid
    ...BulkUpdateProjectMediaMutation_srcProject
    ...BulkUpdateProjectMediaMutation_srcProjectForRemove
  }
`);
