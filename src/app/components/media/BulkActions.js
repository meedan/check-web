import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Button from '@material-ui/core/Button';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import IconDelete from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import styled from 'styled-components';
import { withSetFlashMessage } from '../FlashMessage';
import MoveDialog from './MoveDialog';
import Can from '../Can';
import BulkUpdateProjectMediaMutation from '../../relay/mutations/BulkUpdateProjectMediaMutation';
import { Row, units } from '../../styles/js/shared';

const StyledIcon = styled.span`
  margin: 0 ${units(1)};
  cursor: pointer;
`;

const messages = defineMessages({
  move: {
    id: 'bulkActions.move',
    defaultMessage: 'Move selected items to another list',
  },
  delete: {
    id: 'bulkActions.sendItemsToTrash',
    defaultMessage: 'Send selected items to trash',
  },
  restore: {
    id: 'bulkActions.restoreItemsFromTrash',
    defaultMessage: 'Restore selected items from trash',
  },
  selectAll: {
    id: 'bulkActions.selectAll',
    defaultMessage: 'Select all items on this page',
  },
  add: {
    id: 'bulkActions.add',
    defaultMessage: 'Add selected items to another list',
  },
  remove: {
    id: 'bulkActions.remove',
    defaultMessage: 'Remove selected items from this list',
  },
});

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
          dstProjectForAdd: this.state.dstProjForAdd,
          teamSearchId: this.props.team.search_id,
          count: this.props.count,
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
    };

    if (this.props.selectedMedia.length && !this.state.confirmationError) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0],
          ids: this.props.selectedMedia,
          srcProject: this.props.project,
          archived: params.archived,
          teamSearchId: this.props.team.search_id,
          team: this.props.team,
          count: this.props.count,
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
    const { page, team } = this.props;

    const actions = (
      <div id="media-bulk-actions__actions">
        { page === 'trash' ?
          <Can permission="restore ProjectMedia" permissions={team.permissions}>
            <Tooltip title={this.props.intl.formatMessage(messages.restore)}>
              <StyledIcon>
                <Button
                  className="media-bulk-actions__restore-button"
                  onClick={() => { this.handleDelete({ archived: 0 }); }}
                  variant="outlined"
                >
                  <FormattedMessage id="bulkActions.restore" defaultMessage="Restore from trash" />
                </Button>
              </StyledIcon>
            </Tooltip>
          </Can>
          :
          <Row>
            <Tooltip title={this.props.intl.formatMessage(messages.add)} style={{ margin: '0 10px' }}>
              <Button
                id="media-bulk-actions__add-icon"
                onClick={this.addSelected.bind(this)}
                color="primary"
                variant="contained"
              >
                <FormattedMessage id="bulkActions.addTo" defaultMessage="Add to..." />
              </Button>
            </Tooltip>
            <Tooltip title={this.props.intl.formatMessage(messages.move)} style={{ margin: '0 10px' }}>
              <Button
                id="media-bulk-actions__move-to"
                onClick={this.moveSelected.bind(this)}
                color="primary"
                variant="contained"
              >
                <FormattedMessage id="bulkActions.moveTo" defaultMessage="Move to..." />
              </Button>
            </Tooltip>
            { !/all-items/.test(window.location.pathname) ?
              <Tooltip title={this.props.intl.formatMessage(messages.remove)} style={{ margin: '0 10px' }}>
                <Button
                  id="media-bulk-actions__remove-from-list"
                  style={{ margin: '0 8px', border: '1px solid #000' }}
                  onClick={this.handleRemoveSelectedFromList.bind(this)}
                >
                  <FormattedMessage
                    id="bulkActions.removeFromList"
                    defaultMessage="Remove from list"
                  />
                </Button>
              </Tooltip> : null }
            <Tooltip title={this.props.intl.formatMessage(messages.delete)}>
              <StyledIcon>
                <IconDelete
                  className="media-bulk-actions__delete-icon"
                  onClick={() => { this.handleDelete({ archived: 1 }); }}
                />
              </StyledIcon>
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
          handleClose={this.handleCloseDialogs.bind(this)}
          team={this.props.team}
          projectId={this.props.project ? this.props.project.dbid : null}
          onChange={this.handleSelectDestProject.bind(this)}
          style={{
            minHeight: 400,
          }}
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
          handleClose={this.handleCloseDialogs.bind(this)}
          team={this.props.team}
          projectId={this.props.project ? this.props.project.dbid : null}
          onChange={this.handleSelectDestProjectForAdd.bind(this)}
          style={{
            minHeight: 400,
          }}
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
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default createFragmentContainer(withSetFlashMessage(injectIntl(BulkActions)), graphql`
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
