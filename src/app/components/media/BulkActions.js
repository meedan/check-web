import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import BulkActionsMenu from './BulkActionsMenu';
import Can from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';
import BulkArchiveProjectMediaMutation from '../../relay/mutations/BulkArchiveProjectMediaMutation';
import BulkRestoreProjectMediaMutation from '../../relay/mutations/BulkRestoreProjectMediaMutation';
import BulkMoveProjectMediaMutation from '../../relay/mutations/BulkMoveProjectMediaMutation';
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
      dstProj: null,
    };
  }

  fail = (transaction) => {
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    this.props.setFlashMessage(message, 'error');
  };

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
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
              <a onClick={() => browserHistory.push(`/${this.props.team.slug}/project/${projectId}`)}>
                {projectTitle}
              </a>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message, 'success');
      this.setState({ dstProj: null });
      this.props.onUnselectAll();
    };

    if (this.props.selectedMedia.length && this.state.dstProj) {
      Relay.Store.commitUpdate(
        new BulkMoveProjectMediaMutation({
          ids: this.props.selectedMedia,
          dstProject: this.state.dstProj,
          srcProject: this.props.project,
        }),
        { onSuccess, onFailure: this.fail },
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
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
                <a onClick={() => browserHistory.push(`/${this.props.team.slug}/project/${projectId}`)}>
                  {projectTitle}
                </a>
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
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
                <a onClick={() => browserHistory.push(`/${this.props.team.slug}/project/${projectId}`)}>
                  {projectTitle}
                </a>
              ),
            }}
          />
        );
      this.props.setFlashMessage(message, 'success');
      this.setState({ dstProj: null });
      this.props.onUnselectAll();
    };

    if (this.props.selectedMedia.length && this.state.dstProj) {
      Relay.Store.commitUpdate(
        new BulkRestoreProjectMediaMutation({
          ids: this.props.selectedMedia,
          project: this.props.project,
          team: this.props.team,
          archived_was: params.archived_was,
          dstProject: this.state.dstProj,
        }),
        { onSuccess, onFailure: this.fail },
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
      this.props.setFlashMessage(message, 'success');
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
    // let moveButtonMessage = null;
    let archivedWas = CheckArchivedFlags.TRASHED;
    let moveAction = false;
    if (page === 'trash') {
      moveTooltipMessage = (
        <FormattedMessage
          id="bulkActions.trash"
          defaultMessage="Restore selected items and move items to another folder"
        />
      );
      // moveButtonMessage = (
      //   <FormattedMessage id="bulkActions.restore" defaultMessage="Restore from Trash" />
      // );
    } else if (page === 'unconfirmed') {
      archivedWas = CheckArchivedFlags.UNCONFIRMED;
      moveTooltipMessage = (
        <FormattedMessage
          id="bulkActions.unconfirmed"
          defaultMessage="Confirm selected items and move items to another folder"
        />
      );
      // moveButtonMessage = (
      //   <FormattedMessage id="bulkActions.confirm" defaultMessage="Move from Unconfirmed" />
      // );
    } else {
      moveAction = true;
      moveTooltipMessage = (
        <FormattedMessage
          id="bulkActions.move"
          defaultMessage="Move selected items to another folder"
        />
      );
      // moveButtonMessage = (
      //   <FormattedMessage id="bulkActions.moveTo" defaultMessage="Move to…" />
      // );
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
        <BulkActionsMenu
          excludeProjectDbids={project ? [project.dbid] : []}
          onMove={(dstProj) => {
            this.setState({ dstProj }, () => (
              moveAction
                ? this.handleMove()
                : this.handleRestoreOrConfirm({ archived_was: archivedWas })
            ));
          }}
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
          <Can permission="bulk_update ProjectMedia" permissions={team.permissions}>
            {modalToMove}
          </Can>
          {deleteButton}
        </React.Fragment>
      );
      break;
    }

    return (
      <span id="media-bulk-actions">
        <Box id="media-bulk-actions__actions" display="flex" alignItems="center">
          { actionButtons }
        </Box>
      </span>
    );
  }
}

BulkActions.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
  page: PropTypes.string.isRequired,
  project: PropTypes.object.isRequired,
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
