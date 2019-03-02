import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import IconSelectAll from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import IconUnselectAll from 'material-ui/svg-icons/toggle/check-box';
import IconMove from 'material-ui/svg-icons/action/input';
import IconDelete from 'material-ui/svg-icons/action/delete';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import styled from 'styled-components';
import DestinationProjects from './DestinationProjects';
import BulkUpdateProjectMediaMutation from '../../relay/mutations/BulkUpdateProjectMediaMutation';
import BulkDeleteProjectMediaMutation from '../../relay/mutations/BulkDeleteProjectMediaMutation';
import { units } from '../../styles/js/shared';

const StyledIcon = styled.span`
  margin: 0 ${units(1)};
  cursor: pointer;
`;

const messages = defineMessages({
  move: {
    id: 'bulkActions.move',
    defaultMessage: 'Move selected items to another project',
  },
  delete: {
    id: 'bulkActions.delete',
    defaultMessage: 'Delete selected items',
  },
  selectAll: {
    id: 'bulkActions.selectAll',
    defaultMessage: 'Select all items on this page',
  },
});

class BulkActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allSelected: false,
      openMoveDialog: false,
      openDeleteDialog: false,
      confirmationError: false,
      dstProj: null,
    };
  }

  moveSelected() {
    if (this.props.selectedMedia.length > 0) {
      this.setState({ openMoveDialog: true });
    }
  }

  deleteSelected() {
    if (this.props.selectedMedia.length > 0) {
      this.setState({ openDeleteDialog: true });
    }
  }

  selectAll() {
    this.setState({ allSelected: true });
    this.props.onSelectAll();
  }

  unselectAll() {
    this.setState({ allSelected: false });
    this.props.onUnselectAll();
  }

  handleCloseDialogs() {
    this.setState({ openMoveDialog: false, openDeleteDialog: false });
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
      this.setState({ openMoveDialog: false, dstProj: null, allSelected: false });
      this.props.onUnselectAll();
    };
    const onFailure = () => {};

    if (this.props.selectedMedia.length && this.state.dstProj) {
      Relay.Store.commitUpdate(
        new BulkUpdateProjectMediaMutation({
          id: this.props.selectedMedia[0],
          ids: this.props.selectedMedia,
          dstProject: this.state.dstProj,
          srcProject: this.props.project,
          teamSearchId: this.props.team.search_id,
        }),
        { onSuccess, onFailure },
      );
    }
  }

  handleDelete() {
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="bulkActions.deletedSuccessfully"
          defaultMessage="Done! Please note that it can take a while until the items are actually deleted."
        />
      );
      this.context.setMessage(message);
      this.setState({ openDeleteDialog: false, allSelected: false });
      this.props.onUnselectAll();
    };
    const onFailure = () => {};

    if (this.props.selectedMedia.length && !this.state.confirmationError) {
      Relay.Store.commitUpdate(
        new BulkDeleteProjectMediaMutation({
          id: this.props.selectedMedia[0],
          ids: this.props.selectedMedia,
          project: this.props.project,
          teamSearchId: this.props.team.search_id,
        }),
        { onSuccess, onFailure },
      );
    }
  }

  handleSelectDestProject(event, dstProj) {
    this.setState({ dstProj });
  }

  handleConfirmDeleteForever() {
    const { value: confirmValue } = document.getElementById('delete-forever__confirm');
    if (confirmValue && parseInt(confirmValue, 10) === this.props.selectedMedia.length) {
      this.setState({ confirmationError: false });
      this.handleDelete();
    } else {
      this.setState({ confirmationError: true });
    }
  }

  render() {
    const actions = (
      <span id="media-bulk-actions__actions">
        <StyledIcon title={this.props.intl.formatMessage(messages.move)}>
          <IconMove onClick={this.moveSelected.bind(this)} />
        </StyledIcon>
        <StyledIcon title={this.props.intl.formatMessage(messages.delete)}>
          <IconDelete onClick={this.deleteSelected.bind(this)} />
        </StyledIcon>
      </span>
    );

    const cancelButton = (
      <FlatButton
        label={
          <FormattedMessage
            id="bulkActions.cancelButton"
            defaultMessage="Cancel"
          />
        }
        primary
        onClick={this.handleCloseDialogs.bind(this)}
      />
    );

    const moveDialogActions = [
      cancelButton,
      <FlatButton
        label={<FormattedMessage id="bulkActions.moveTitle" defaultMessage="Move" />}
        primary
        className="media-bulk-actions__move-button"
        onClick={this.handleMove.bind(this)}
        disabled={!this.state.dstProj}
      />,
    ];

    const deleteDialogActions = [
      cancelButton,
      <FlatButton
        label={
          <FormattedMessage
            id="bulkActions.deleteForever"
            defaultMessage="Delete forever"
          />
        }
        primary
        onClick={this.handleConfirmDeleteForever.bind(this)}
      />,
    ];

    return (
      <span id="media-bulk-actions">
        <StyledIcon title={this.props.intl.formatMessage(messages.selectAll)}>
          {this.state.allSelected ?
            <IconUnselectAll onClick={this.unselectAll.bind(this)} /> :
            <IconSelectAll onClick={this.selectAll.bind(this)} /> }
        </StyledIcon>
        {this.props.selectedMedia && this.props.selectedMedia.length > 0 ? actions : null}

        <Dialog
          actions={moveDialogActions}
          modal
          open={this.state.openMoveDialog}
          onRequestClose={this.handleCloseDialogs.bind(this)}
          autoScrollBodyContent
        >
          <h4 className="media-bulk-actions__move-dialog-header">
            <FormattedMessage
              id="bulkActions.moveDialogHeader"
              defaultMessage="Move to a different project"
            />
          </h4>
          <DestinationProjects
            team={this.props.team}
            projectId={this.props.project ? this.props.project.dbid : null}
            onChange={this.handleSelectDestProject.bind(this)}
          />
        </Dialog>

        <Dialog
          actions={deleteDialogActions}
          modal={false}
          open={this.state.openDeleteDialog}
          onRequestClose={this.handleCloseDialogs.bind(this)}
        >
          <h2>
            <FormattedMessage
              id="bulkActions.deleteForever"
              defaultMessage="Delete forever"
            />
          </h2>
          <p>
            <FormattedMessage
              id="bulkActions.deleteForeverConfirmationText"
              defaultMessage="Are you sure? This will permanently delete {count, plural, =0 {0 items} one {1 item} other {# items}}. Type the number of items ({count}) if you want to proceed."
              values={{ count: this.props.selectedMedia.length }}
            />
          </p>
          <TextField
            id="delete-forever__confirm"
            fullWidth
            errorText={this.state.confirmationError ?
              <FormattedMessage
                id="bulkActions.confirmationError"
                defaultMessage="Wrong value"
              />
              : null
            }
            hintText={
              <FormattedMessage
                id="bulkActions.typeHere"
                defaultMessage="Type here"
              />
            }
          />
        </Dialog>
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
