import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import IconDelete from '@material-ui/icons/Delete';
import FlatButton from 'material-ui/FlatButton';
import Tooltip from '@material-ui/core/Tooltip';
import styled from 'styled-components';
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
  clone: {
    id: 'bulkActions.clone',
    defaultMessage: 'Copy selected items to another list',
  },
});

class BulkActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openMoveDialog: false,
      openCloneDialog: false,
      dstProj: null,
      dstProjForClone: null,
    };
  }

  moveSelected() {
    if (this.props.selectedMedia.length > 0) {
      this.setState({ openMoveDialog: true });
    }
  }

  cloneSelected() {
    if (this.props.selectedMedia.length > 0) {
      this.setState({ openCloneDialog: true });
    }
  }

  handleCloseDialogs() {
    this.setState({ openMoveDialog: false, openCloneDialog: false });
  }

  handleClone() {
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="bulkActions.clonedSuccessfully"
          defaultMessage="Done! Please note that it can take a while until the items are actually cloned."
        />
      );
      this.context.setMessage(message);
      this.setState({ openCloneDialog: false, dstProjForClone: null });
      this.props.onUnselectAll();
    };
    const onDone = () => {};

    onSuccess();

    if (this.props.selectedMedia.length && this.state.dstProjForClone) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0],
          ids: this.props.selectedMedia,
          dstProjectForClone: this.state.dstProjForClone,
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
      this.context.setMessage(message);
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
      this.context.setMessage(message);
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
          count: this.props.count,
        }),
        { onSuccess },
      );
    }
  };

  handleSelectDestProject(dstProj) {
    this.setState({ dstProj });
  }

  handleSelectDestProjectForClone(dstProjForClone) {
    this.setState({ dstProjForClone });
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
            <Tooltip title={this.props.intl.formatMessage(messages.move)}>
              <Button
                className="media-bulk-actions__move-icon"
                onClick={this.moveSelected.bind(this)}
                color="primary"
                variant="contained"
              >
                <FormattedMessage id="bulkActions.moveTo" defaultMessage="Move to..." />
              </Button>
            </Tooltip>
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
      <FlatButton
        label={
          <FormattedMessage
            id="bulkActions.cancelButton"
            defaultMessage="Cancel"
          />
        }
        primary
        onClick={this.handleCloseDialogs.bind(this)}
      />,
      <FlatButton
        label={<FormattedMessage id="bulkActions.moveTitle" defaultMessage="Move" />}
        primary
        className="media-bulk-actions__move-button"
        onClick={this.handleMove.bind(this)}
        disabled={!this.state.dstProj}
      />,
    ];

    const cloneDialogActions = [
      <FlatButton
        label={
          <FormattedMessage
            id="bulkActions.cancelButton"
            defaultMessage="Cancel"
          />
        }
        primary
        onClick={this.handleCloseDialogs.bind(this)}
      />,
      <FlatButton
        label={<FormattedMessage id="bulkActions.cloneTitle" defaultMessage="Copy" />}
        primary
        className="media-bulk-actions__clone-button"
        onClick={this.handleClone.bind(this)}
        disabled={!this.state.dstProjForClone}
      />,
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
          actions={cloneDialogActions}
          open={this.state.openCloneDialog}
          handleClose={this.handleCloseDialogs.bind(this)}
          projectId={this.props.project ? this.props.project.dbid : null}
          onChange={this.handleSelectDestProjectForClone.bind(this)}
          style={{
            minHeight: 400,
          }}
          title={
            <FormattedMessage
              id="bulkActions.dialogCloneTitle"
              defaultMessage="Copy to a different list"
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
};

BulkActions.contextTypes = {
  setMessage: PropTypes.func,
};

export default injectIntl(BulkActions);
