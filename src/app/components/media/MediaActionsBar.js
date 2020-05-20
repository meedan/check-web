import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import IconReport from '@material-ui/icons/Receipt';
import MediaStatus from './MediaStatus';
import MediaRoute from '../../relay/MediaRoute';
import MediaActions from './MediaActions';
import Attribution from '../task/Attribution';
import CreateProjectMediaProjectMutation from '../../relay/mutations/CreateProjectMediaProjectMutation';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import DeleteProjectMediaProjectMutation from '../../relay/mutations/DeleteProjectMediaProjectMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import MoveDialog from './MoveDialog';
import CheckContext from '../../CheckContext';
import globalStrings from '../../globalStrings';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import { nested, getErrorMessage } from '../../helpers';

const messages = defineMessages({
  mediaTitle: {
    id: 'mediaDetail.mediaTitle',
    defaultMessage: 'Title',
  },
  mediaDescription: {
    id: 'mediaDetail.mediaDescription',
    defaultMessage: 'Description',
  },
  editReport: {
    id: 'mediaDetail.editReport',
    defaultMessage: 'Edit',
  },
  editReportError: {
    id: 'mediaDetail.editReportError',
    defaultMessage: 'Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists.',
  },
  trash: {
    id: 'mediaDetail.trash',
    defaultMessage: 'Trash',
  },
});

const Styles = theme => ({
  root: {
    width: '50%',
    position: 'absolute',
    height: 64,
    right: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    zIndex: 2,
    padding: '0 16px',
    justifyContent: 'space-between',
  },
  spacedButton: {
    marginRight: theme.spacing(1),
  },
});

class MediaActionsBarComponent extends Component {
  static handleReportDesigner() {
    const path = `${window.location.pathname}/report-designer`;
    browserHistory.push(path);
  }

  constructor(props) {
    super(props);

    this.state = {
      openAddToListDialog: false,
      openMoveDialog: false,
      openAssignDialog: false,
      dstProj: null,
      isEditing: false,
      title: null,
      description: null,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  getDescription() {
    return (typeof this.state.description === 'string') ? this.state.description.trim() : this.props.media.description;
  }

  getTitle() {
    return (typeof this.state.title === 'string') ? this.state.title.trim() : this.props.media.title;
  }

  currentProject() {
    return this.props.media.project;
  }

  handleAddToList = () => {
    this.setState({ openAddToListDialog: true });
  }

  handleAddItemToList() {
    const onSuccess = (response) => {
      const { project } = response.createProjectMediaProject;
      const message = (
        <FormattedMessage
          id="mediaMetadata.addedToList"
          defaultMessage="Added to list {listName}"
          values={{
            listName: (
              <Link to={`/${project.team.slug}/project/${project.dbid}`}>
                {project.title}
              </Link>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message);
    };

    const context = this.getContext();

    Relay.Store.commitUpdate(
      new CreateProjectMediaProjectMutation({
        project: this.state.dstProj,
        project_media: this.props.media,
        context,
      }),
      { onSuccess, onFailure: this.fail },
    );

    this.setState({ openAddToListDialog: false });
  }

  handleMove = () => {
    this.setState({ openMoveDialog: true });
  }

  fail(transaction) {
    const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message);
  }

  handleMoveProjectMedia() {
    const { media } = this.props;
    const { dstProj: { dbid: projectId } } = this.state;

    const onFailure = (transaction) => {
      this.fail(transaction);
    };

    const path = `/${media.team.slug}/project/${projectId}`;
    const context = this.getContext();

    const onSuccess = () => {
      browserHistory.push(path);
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        project_id: projectId,
        id: media.id,
        srcProj: this.currentProject(),
        dstProj: this.state.dstProj,
        context,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ openMoveDialog: false });
  }

  handleRemoveFromList = () => {
    const context = this.getContext();
    const { media } = this.props;

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="mediaActionsBar.removedFromList"
          defaultMessage="Removed from list"
        />
      );
      this.props.setFlashMessage(message);
      const path = `/${media.team.slug}/media/${media.dbid}`;
      browserHistory.push(path);
    };

    Relay.Store.commitUpdate(
      new DeleteProjectMediaProjectMutation({
        project: media.project,
        project_media: media,
        context,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  canSubmit = () => {
    const { title, description } = this.state;
    const permissions = JSON.parse(this.props.media.permissions);
    return (permissions['update Dynamic'] !== false && (typeof title === 'string' || typeof description === 'string'));
  };

  handleChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  handleChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  handleSave(media, event) {
    if (event) {
      event.preventDefault();
    }

    const embed = {};

    const title = this.getTitle();
    const description = this.getDescription();

    if (typeof title === 'string' && title.trim().length > 0) {
      embed.title = title.trim();
    }

    if (typeof description === 'string' && description.trim().length > 0) {
      embed.description = description.trim();
    }

    if (embed.title === '' && media.media.embed_path) {
      embed.title = media.media.embed_path.split('/').pop().replace('embed_', '');
    }

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.editReportError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.props.setFlashMessage(message);
    };

    if (this.canSubmit()) {
      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          media,
          metadata: JSON.stringify(embed),
          id: media.id,
        }),
        { onFailure },
      );
    }

    this.handleCancel();
  }

  handleSendToTrash() {
    const onSuccess = (response) => {
      const pm = response.updateProjectMedia.project_media;
      const message = (
        <FormattedMessage
          id="mediaActionsBar.movedToTrash"
          defaultMessage="Sent to {trash}"
          values={{
            trash: (
              <Link to={`/${pm.team.slug}/trash`}>
                {this.props.intl.formatMessage(messages.trash)}
              </Link>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message);
    };

    const context = this.getContext();
    if (context.team && !context.team.public_team) {
      context.team.public_team = Object.assign({}, context.team);
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        archived: 1,
        check_search_team: this.props.media.team.search,
        check_search_project: this.props.media.project ? this.props.media.project.search : null,
        check_search_trash: this.props.media.team.check_search_trash,
        media: this.props.media,
        context,
        id: this.props.media.id,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  handleCancel() {
    this.setState({
      isEditing: false,
      title: null,
      description: null,
    });
  }

  handleCloseDialogs() {
    this.setState({
      isEditing: false,
      openAddToListDialog: false,
      openMoveDialog: false,
      openAssignDialog: false,
      dstProj: null,
    });
  }

  handleSelectDestProject(dstProj) {
    this.setState({ dstProj });
  }

  handleEdit() {
    this.setState({ isEditing: true });
  }

  handleRefresh() {
    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: this.props.media.id,
      }),
      { onFailure: this.fail },
    );
  }

  handleStatusLock() {
    const { media } = this.props;

    const statusAttr = {
      parent_type: 'project_media',
      annotated: media,
      annotation: {
        status_id: media.last_status_obj.id,
        locked: !media.last_status_obj.locked,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onFailure: this.fail },
    );
  }

  handleAssign() {
    this.setState({ openAssignDialog: true });
  }

  handleAssignProjectMedia() {
    const { media } = this.props;

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="mediaActionsBar.assignmentsUpdated"
          defaultMessage="Assignments updated successfully!"
        />
      );
      this.props.setFlashMessage(message);
    };

    const status_id = media.last_status_obj ? media.last_status_obj.id : '';

    const assignment = document.getElementById(`attribution-media-${media.dbid}`).value;

    const statusAttr = {
      parent_type: 'project_media',
      annotated: media,
      annotation: {
        status_id,
        assigned_to_ids: assignment,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onSuccess, onFailure: this.fail },
    );

    this.setState({ openAssignDialog: false });
  }

  handleRestore() {
    const onSuccess = (response) => {
      const pm = response.updateProjectMedia.project_media;
      const message = (
        <FormattedMessage
          id="mediaActionsBar.movedBack"
          defaultMessage="Restored to list {project}"
          values={{
            project: (
              <Link to={`/${pm.team.slug}/project/${pm.project_id}`}>
                {pm.project.title}
              </Link>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message);
    };

    const context = this.getContext();
    if (context.team && !context.team.public_team) {
      context.team.public_team = Object.assign({}, context.team);
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        id: this.props.media.id,
        media: this.props.media,
        archived: 0,
        check_search_team: this.props.media.team.search,
        check_search_project: this.props.media.project.search,
        check_search_trash: this.props.media.team.check_search_trash,
        context,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  render() {
    const { classes, media, intl: { locale } } = this.props;
    const context = this.getContext();

    const addToListDialogActions = [
      <Button
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
      >
        <FormattedMessage
          id="mediaActionsBar.cancelButton"
          defaultMessage="Cancel"
        />
      </Button>,
      <Button
        color="primary"
        className="media-actions-bar__add-button"
        onClick={this.handleAddItemToList.bind(this)}
        disabled={!this.state.dstProj}
      >
        <FormattedMessage id="mediaActionsBar.add" defaultMessage="Add" />
      </Button>,
    ];

    const moveDialogActions = [
      <Button
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
      >
        <FormattedMessage
          id="mediaActionsBar.cancelButton"
          defaultMessage="Cancel"
        />
      </Button>,
      <Button
        color="primary"
        className="media-actions-bar__move-button"
        onClick={this.handleMoveProjectMedia.bind(this)}
        disabled={!this.state.dstProj}
      >
        <FormattedMessage id="mediaActionsBar.move" defaultMessage="Move" />
      </Button>,
    ];

    let smoochBotInstalled = false;
    if (media.team && media.team.team_bot_installations) {
      media.team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }
    let isChild = false;
    let isParent = false;
    if (media.relationship) {
      if (media.relationship.target_id === media.dbid) {
        isChild = true;
      } else if (media.relationship.source_id === media.dbid) {
        isParent = true;
      }
    }
    const readonlyStatus = smoochBotInstalled && isChild && !isParent;
    const published = (media.dynamic_annotation_report_design && media.dynamic_annotation_report_design.data && media.dynamic_annotation_report_design.data.state === 'published');

    const assignments = media.last_status_obj.assignments.edges;

    const assignDialogActions = [
      <Button
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
        key="mediaActionsBar.cancelButton"
      >
        <FormattedMessage id="mediaActionsBar.cancelButton" defaultMessage="Cancel" />
      </Button>,
      <Button
        color="primary"
        onClick={this.handleAssignProjectMedia.bind(this)}
        key="mediaActionsBar.done"
      >
        <FormattedMessage id="mediaActionsBar.done" defaultMessage="Done" />
      </Button>,
    ];

    const editDialog = (
      <Dialog
        open={this.state.isEditing}
        onClose={this.handleCloseDialogs.bind(this)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{this.props.intl.formatMessage(messages.editReport)}</DialogTitle>
        <DialogContent>
          <form onSubmit={this.handleSave.bind(this, media)} name="edit-media-form">
            <TextField
              id="media-detail__title-input"
              label={this.props.intl.formatMessage(messages.mediaTitle)}
              defaultValue={this.getTitle()}
              onChange={this.handleChangeTitle.bind(this)}
              fullWidth
              margin="normal"
            />

            <TextField
              id="media-detail__description-input"
              label={this.props.intl.formatMessage(messages.mediaDescription)}
              defaultValue={this.getDescription()}
              onChange={this.handleChangeDescription.bind(this)}
              fullWidth
              multiline
              margin="normal"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <span style={{ display: 'flex' }}>
            <Button
              onClick={this.handleCancel.bind(this)}
              className="media-detail__cancel-edits"
            >
              <FormattedMessage
                id="mediaDetail.cancelButton"
                defaultMessage="Cancel"
              />
            </Button>
            <Button
              onClick={this.handleSave.bind(this, media)}
              className="media-detail__save-edits"
              disabled={!this.canSubmit()}
              color="primary"
            >
              <FormattedMessage
                id="mediaDetail.doneButton"
                defaultMessage="Done"
              />
            </Button>
          </span>
        </DialogActions>
      </Dialog>
    );

    return (
      <div className={classes.root}>
        { !media.archived ?
          <div>
            <Button
              id="media-actions-bar__add-to"
              variant="contained"
              className={classes.spacedButton}
              color="primary"
              onClick={this.handleAddToList}
            >
              <FormattedMessage
                id="mediaActionsBar.addTo"
                defaultMessage="Add to..."
              />
            </Button>

            <Button
              id="media-actions-bar__move-to"
              variant="contained"
              className={classes.spacedButton}
              color="primary"
              onClick={this.handleMove}
            >
              <FormattedMessage
                id="mediaActionsBar.moveTo"
                defaultMessage="Move to..."
              />
            </Button>

            { media.project_id ?
              <Button
                id="media-actions-bar__remove-from-list"
                variant="outlined"
                className={classes.spacedButton}
                onClick={this.handleRemoveFromList}
              >
                <FormattedMessage
                  id="mediaActionsBar.removeFromList"
                  defaultMessage="Remove from list"
                />
              </Button> : null }

            <Button
              onClick={MediaActionsBarComponent.handleReportDesigner}
              id="media-detail__report-designer"
              variant="outlined"
              className={classes.spacedButton}
              startIcon={<IconReport />}
            >
              <FormattedMessage
                id="mediaActionsBar.reportDesigner"
                defaultMessage="Report"
              />
            </Button>
          </div> : <div />}

        <div
          style={{
            display: 'flex',
          }}
        >
          <MediaStatus
            media={media}
            readonly={media.archived || media.last_status_obj.locked || readonlyStatus || published}
          />

          <MediaActions
            style={{
              height: 36,
              marginTop: -5,
            }}
            media={media}
            handleEdit={this.handleEdit.bind(this)}
            handleRefresh={this.handleRefresh.bind(this)}
            handleSendToTrash={this.handleSendToTrash.bind(this)}
            handleRestore={this.handleRestore.bind(this)}
            handleAssign={this.handleAssign.bind(this)}
            handleStatusLock={this.handleStatusLock.bind(this)}
            locale={locale}
          />
        </div>

        {this.state.isEditing ? editDialog : null}

        <MoveDialog
          actions={addToListDialogActions}
          open={this.state.openAddToListDialog}
          handleClose={this.handleCloseDialogs.bind(this)}
          team={context.team}
          projectId={media.project_ids}
          onChange={this.handleSelectDestProject.bind(this)}
          style={{
            minHeight: 400,
          }}
          title={
            <FormattedMessage
              id="mediaActionsBar.dialogAddToListTitle"
              defaultMessage="Add to a different list"
            />
          }
        />

        <MoveDialog
          actions={moveDialogActions}
          open={this.state.openMoveDialog}
          handleClose={this.handleCloseDialogs.bind(this)}
          team={context.team}
          projectId={nested(['project', 'dbid'], media)}
          onChange={this.handleSelectDestProject.bind(this)}
          style={{
            minHeight: 400,
          }}
          title={
            <FormattedMessage
              id="mediaActionsBar.dialogMoveTitle"
              defaultMessage="Move to a different list"
            />
          }
        />

        <Dialog
          open={this.state.openAssignDialog}
          onClose={this.handleCloseDialogs.bind(this)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <FormattedMessage
              id="mediaActionsBar.assignDialogHeader"
              defaultMessage="Assignment"
            />
          </DialogTitle>
          <DialogContent>
            <Attribution
              multi
              selectedUsers={assignments}
              id={`media-${media.dbid}`}
            />
          </DialogContent>
          <DialogActions>
            {assignDialogActions}
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

MediaActionsBarComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

MediaActionsBarComponent.contextTypes = {
  store: PropTypes.object,
};

const ConnectedMediaActionsBarComponent =
  withStyles(Styles)(withSetFlashMessage(injectIntl(MediaActionsBarComponent)));

const MediaActionsBarContainer = Relay.createContainer(ConnectedMediaActionsBarComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        project_id
        project_ids
        title
        demand
        description
        permissions
        verification_statuses
        metadata
        overridden
        url
        quote
        archived
        dynamic_annotation_report_design {
          id
          data
        }
        media {
          url
          embed_path
          metadata
        }
        targets_by_users(first: 50) {
          edges {
            node {
              id
              dbid
              last_status
            }
          }
        }
        last_status
        last_status_obj {
          id
          dbid
          locked
          content
          assignments(first: 10000) {
            edges {
              node {
                id
                dbid
                name
              }
            }
          }
        }
        relationship {
          id
          dbid
          target_id
          source_id
        }
        project {
          id
          dbid
          title
          search_id
          medias_count
          search {
            id
            number_of_results
          }
        }
        team {
          id
          dbid
          slug
          medias_count
          trash_count
          public_team {
            id
          }
          search {
            id
            number_of_results
          }
          check_search_trash {
            id
            number_of_results
          }
          team_bot_installations(first: 10000) {
            edges {
              node {
                id
                team_bot: bot_user {
                  id
                  identifier
                }
              }
            }
          }
        }
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class MediaActionsBar extends React.PureComponent {
  render() {
    const { projectId, projectMediaId } = this.props;
    const ids = `${projectMediaId},${projectId}`;
    const route = new MediaRoute({ ids });

    return (
      <Relay.RootContainer
        Component={MediaActionsBarContainer}
        renderFetched={data => <MediaActionsBarContainer {...this.props} {...data} />}
        route={route}
      />
    );
  }
}

export default MediaActionsBar;
