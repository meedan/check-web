import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Link } from 'react-router';
import Tooltip from 'rc-tooltip';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import MediaTags from './MediaTags';
import MediaActions from './MediaActions';
import MediaUtil from './MediaUtil';
import ClaimReview from './ClaimReview';
import DestinationProjects from './DestinationProjects';
import UserTooltip from '../user/UserTooltip';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import DeleteProjectMediaMutation from '../../relay/mutations/DeleteProjectMediaMutation';
import CreateTagMutation from '../../relay/mutations/CreateTagMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import CheckContext from '../../CheckContext';
import Message from '../Message';
import Attribution from '../task/Attribution';
import UserAvatar from '../UserAvatar';
import ProfileLink from '../layout/ProfileLink';
import { safelyParseJSON } from '../../helpers';
import {
  Row,
  black10,
  black87,
  title1,
  units,
  caption,
  Text,
} from '../../styles/js/shared';

const StyledMetadata = styled.div`
  margin: ${units(1)} 0 0;
  padding-${props => props.fromDirection}: ${units(1)};

  .media-detail__dialog-header {
    color: ${black87};
    font: ${title1};
    height: ${units(4)};
    margin-bottom: ${units(0.5)};
    margin-top: ${units(0.5)};
    margin-${props => props.fromDirection}: auto;
  }

  .media-detail__dialog-media-path {
    height: ${units(2)};
    margin-bottom: ${units(4)};
    text-align: ${props => props.fromDirection};
  }

  .media-detail__dialog-radio-group {
    margin-top: ${units(4)};
    margin-${props => props.fromDirection}: ${units(4)};
  }
`;

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
    defaultMessage: 'Edit report',
  },
  editReportError: {
    id: 'mediaDetail.editReportError',
    defaultMessage: 'Sorry, we could not edit this report',
  },
  trash: {
    id: 'mediaDetail.trash',
    defaultMessage: 'Trash',
  },
});

class MediaMetadata extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      openMoveDialog: false,
      openDeleteDialog: false,
      confirmationError: false,
      message: null,
      pendingMutations: null,
      hasFailure: false,
      openAssignDialog: false,

    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleError(json) {
    let message = this.props.intl.formatMessage(messages.error);
    if (json && json.error) {
      message = json.error;
    }
    this.setState({ message });
  }

  handleRefresh() {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = () => {
      // Do nothing.
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: this.props.media.id,
      }),
      { onSuccess, onFailure },
    );
  }

  handleSendToTrash() {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = (response) => {
      const pm = response.updateProjectMedia.project_media;
      const message = (
        <FormattedMessage
          id="mediaMetadata.movedToTrash"
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
      this.context.setMessage(message);
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        archived: 1,
        check_search_team: this.props.media.team.search_id,
        check_search_project: this.props.media.project.search_id,
        id: this.props.media.id,
      }),
      { onSuccess, onFailure },
    );
  }

  handleRestore() {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = (response) => {
      const pm = response.updateProjectMedia.project_media;
      const message = (
        <FormattedMessage
          id="mediaMetadata.movedBack"
          defaultMessage="Moved back to project: {project}"
          values={{
            project: (
              <Link to={`/${pm.team.slug}/project/${pm.project_id}`}>
                {pm.project.title}
              </Link>
            ),
          }}
        />
      );
      this.context.setMessage(message);
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        archived: 0,
        check_search_team: this.props.media.team.search_id,
        check_search_project: this.props.media.project.search_id,
        id: this.props.media.id,
      }),
      { onSuccess, onFailure },
    );
  }

  handleConfirmDeleteForever() {
    // TODO Use React ref
    const { value: confirmValue } = document.getElementById('delete-forever__confirm');
    if (confirmValue && confirmValue.toUpperCase() === 'CONFIRM') {
      this.setState({ confirmationError: false });
      this.handleCloseDialogs();
      this.handleRequestDeleteForever();
    } else {
      this.setState({ confirmationError: true });
    }
  }

  handleDeleteForever() {
    this.setState({ openDeleteDialog: true });
  }

  handleRequestDeleteForever() {
    const { media } = this.props;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="mediaMetadata.deletedForever"
          defaultMessage="Deleted"
        />
      );
      const { history } = this.getContext();
      history.push(`/${media.team.slug}/project/${media.project_id}`);
      this.context.setMessage(message);
    };

    Relay.Store.commitUpdate(
      new DeleteProjectMediaMutation({
        id: media.id,
        check_search_team: media.team.search_id,
      }),
      { onSuccess, onFailure },
    );
  }

  handleEdit() {
    this.setState({ isEditing: true });
  }

  handleMove() {
    this.setState({ openMoveDialog: true });
  }

  handleMoveProjectMedia() {
    const { media } = this.props;
    const { dstProj: { dbid: projectId } } = this.state;
    const { dbid: previousProjectId } = this.currentProject();
    const { history } = this.getContext();

    const onFailure = (transaction) => {
      if (/^\/[^/]+\/project\/[0-9]+$/.test(window.location.pathname)) {
        history.push(`/${media.team.slug}/project/${previousProjectId}`);
      }
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const path = `/${media.team.slug}/project/${projectId}`;

    const onSuccess = () => {
      if (/^\/[^/]+\/search\//.test(window.location.pathname)) {
        this.props.parentComponent.props.relay.forceFetch();
      } else if (
        /^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+$/.test(window.location.pathname)
      ) {
        history.push(`${path}/media/${media.dbid}`);
      }
    };

    // Optimistic-redirect to target project
    if (/^\/[^/]+\/project\/[0-9]+$/.test(window.location.pathname)) {
      history.push(path);
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        project_id: projectId,
        id: media.id,
        srcProj: this.currentProject(),
        dstProj: this.state.dstProj,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ openMoveDialog: false });
  }

  handleAssign() {
    this.setState({ openAssignDialog: true });
  }

  handleAssignProjectMedia() {
    const { media } = this.props;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = () => {};

    const status_id = media.last_status_obj ? media.last_status_obj.id : '';

    let assignment = document.getElementById(`attribution-media-${media.dbid}`);
    if (assignment) {
      assignment = parseInt(assignment.value, 10);
    } else {
      assignment = 0;
    }

    const statusAttr = {
      parent_type: 'project_media',
      annotated: media,
      annotation: {
        status_id,
        assigned_to_id: assignment,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onSuccess, onFailure },
    );

    this.setState({ openAssignDialog: false });
  }

  currentProject() {
    return this.props.media.project;
  }

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

    const pendingTag = document.forms['edit-media-form'].sourceTagInput.value;
    const title = this.state.title && this.state.title.trim();
    const description = this.state.description && this.state.description.trim();

    const embed = {
      title,
      description,
    };

    const onEditFailure = (transaction) => {
      this.fail(transaction, 'editMedia');
    };

    const onTagFailure = (transaction) => {
      this.fail(transaction, 'createTag');
    };

    const onEditSuccess = (response) => {
      this.success(response, 'editMedia');
    };

    const onTagSuccess = (response) => {
      this.success(response, 'createTag');
    };

    if ((typeof title !== 'undefined' && title !== null) ||
      (typeof description !== 'undefined' && description !== null)) {
      if (!title) {
        embed.title = media.media.embed_path
          ? media.media.embed_path.split('/').pop().replace('embed_', '')
          : title;
      }

      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          embed: JSON.stringify(embed),
          id: media.id,
        }),
        { onSuccess: onEditSuccess, onFailure: onEditFailure },
      );

      this.registerPendingMutation('editMedia');
    }

    const context = this.getContext();

    if (pendingTag && pendingTag.trim()) {
      const tagsList = [...new Set(pendingTag.split(','))];

      tagsList.forEach((tag) => {
        Relay.Store.commitUpdate(
          new CreateTagMutation({
            annotated: media,
            annotator: context.currentUser,
            parent_type: 'project_media',
            context,
            annotation: {
              tag: tag.trim(),
              annotated_type: 'ProjectMedia',
              annotated_id: media.dbid,
            },
          }),
          { onSuccess: onTagSuccess, onFailure: onTagFailure },
        );

        this.registerPendingMutation('createTag');
      });
    }

    this.setState({
      message: null,
      tagErrorMessage: null,
      pendingMutations: null,
      hasFailure: false,
    });

    this.manageEditingState();
  }

  fail(transaction, mutation) {
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.editReportError);
    const json = safelyParseJSON(error.source);
    if (json && json.error) {
      message = json.error;
    }
    if (mutation === 'createTag') {
      this.setState({ tagErrorMessage: message, hasFailure: true });
    } else {
      this.setState({ message, hasFailure: true });
    }
  }

  manageEditingState = () => {
    const isEditing = (!!this.state.pendingMutations &&
    this.state.pendingMutations.length > 0) ||
    this.state.hasFailure;

    const message = isEditing ? this.state.message : null;

    this.setState({ isEditing, message });
  };

  success(response, mutation) {
    const pendingMutations = this.state.pendingMutations
      ? this.state.pendingMutations.slice(0)
      : [];
    this.setState(
      { pendingMutations: pendingMutations.filter(m => m !== mutation) },
      this.manageEditingState,
    );
  }

  registerPendingMutation(mutation) {
    const pendingMutations = this.state.pendingMutations
      ? this.state.pendingMutations.slice(0)
      : [];
    pendingMutations.push(mutation);
    this.setState({ pendingMutations });
  }

  handleCancel() {
    this.setState({
      isEditing: false,
      hasFailure: false,
      message: null,
      tagErrorMessage: null,
      title: null,
      description: null,
      pendingMutations: null,
    });
  }

  handleCloseDialogs() {
    this.setState({
      isEditing: false,
      openMoveDialog: false,
      dstProj: null,
      openDeleteDialog: false,
      openAssignDialog: false,
    });
  }

  handleSelectDestProject(event, dstProj) {
    this.setState({ dstProj });
  }

  isStatusFinal(id) {
    let isFinal = false;
    try {
      this.props.media.verification_statuses.statuses.forEach((status) => {
        if (status.id === id && status.completed === '1') {
          isFinal = true;
        }
      });
    } catch (e) {
      isFinal = false;
    }
    return isFinal;
  }

  render() {
    const { media, intl: { locale } } = this.props;
    const data = media.embed;
    const context = this.getContext();
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';

    const byUser = media.user &&
      media.user.source &&
      media.user.source.dbid &&
      media.user.name !== 'Pender' ? (
        <FormattedMessage
          id="mediaDetail.byUser"
          defaultMessage="by {username}"
          values={{
            username: (
              <Tooltip placement="top" overlay={<UserTooltip user={media.user} team={media.team} />}>
                <Link to={`/check/user/${media.user.dbid}`}>
                  {media.user.name}
                </Link>
              </Tooltip>
            ),
          }}
        />) : null;
    const moveDialogActions = [
      <FlatButton
        label={
          <FormattedMessage
            id="mediaDetail.cancelButton"
            defaultMessage="Cancel"
          />
        }
        primary
        onClick={this.handleCloseDialogs.bind(this)}
      />,
      <FlatButton
        label={<FormattedMessage id="mediaDetail.move" defaultMessage="Move" />}
        primary
        className="media-detail__move-button"
        keyboardFocused
        onClick={this.handleMoveProjectMedia.bind(this)}
        disabled={!this.state.dstProj}
      />,
    ];
    const assignDialogActions = [
      <FlatButton
        label={
          <FormattedMessage
            id="mediaDetail.cancelButton"
            defaultMessage="Cancel"
          />
        }
        primary
        onClick={this.handleCloseDialogs.bind(this)}
      />,
      <FlatButton
        label={<FormattedMessage id="mediaDetail.done" defaultMessage="Done" />}
        primary
        keyboardFocused
        onClick={this.handleAssignProjectMedia.bind(this)}
      />,
    ];

    const description = MediaUtil.hasCustomDescription(media, data)
      ? data.description
      : null;

    const editDialog = (
      <Dialog
        modal
        title={this.props.intl.formatMessage(messages.editReport)}
        open={this.state.isEditing}
        onRequestClose={this.handleCloseDialogs.bind(this)}
        autoScrollBodyContent
      >
        <form onSubmit={this.handleSave.bind(this, media)} name="edit-media-form">
          <Message message={this.state.message} />
          <TextField
            type="text"
            id={`media-detail-title-input-${media.dbid}`}
            className="media-detail__title-input"
            floatingLabelText={this.props.intl.formatMessage(messages.mediaTitle)}
            defaultValue={this.props.heading}
            onChange={this.handleChangeTitle.bind(this)}
            style={{ width: '100%' }}
          />

          <TextField
            type="text"
            id={`media-detail-description-input-${media.dbid}`}
            className="media-detail__description-input"
            floatingLabelText={this.props.intl.formatMessage(messages.mediaDescription)}
            defaultValue={description}
            onChange={this.handleChangeDescription.bind(this)}
            style={{ width: '100%' }}
          />

          { media.tags ?
            <MediaTags
              media={media}
              tags={media.tags.edges}
              errorText={this.state.tagErrorMessage}
              onChange={() => {
                this.setState({ tagErrorMessage: null });
              }}
              isEditing
            /> : null
          }
        </form>

        <span style={{ display: 'flex' }}>
          <FlatButton
            onClick={this.handleCancel.bind(this)}
            className="media-detail__cancel-edits"
            label={
              <FormattedMessage
                id="mediaDetail.cancelButton"
                defaultMessage="Cancel"
              />
            }
          />
          <FlatButton
            onClick={this.handleSave.bind(this, media)}
            className="media-detail__save-edits"
            label={
              <FormattedMessage
                id="mediaDetail.doneButton"
                defaultMessage="Done"
              />
            }
            primary
          />
        </span>
      </Dialog>
    );

    const deleteDialogActions = [
      <FlatButton
        label={
          <FormattedMessage id="mediaDetail.cancel" defaultMessage="Cancel" />
        }
        primary
        onClick={this.handleCloseDialogs.bind(this)}
      />,
      <RaisedButton
        label={
          <FormattedMessage
            id="mediaDetail.deleteForever"
            defaultMessage="Delete forever"
          />
        }
        primary
        onClick={this.handleConfirmDeleteForever.bind(this)}
      />,
    ];

    const claimReview = data.schema && data.schema.ClaimReview ? data.schema.ClaimReview[0] : null;
    const url = MediaUtil.url(media, data);
    const assignment = media.last_status_obj.assigned_to;

    return (
      <StyledMetadata
        fromDirection={fromDirection}
        className="media-detail__check-metadata"
      >
        {this.state.isEditing ? editDialog : null}

        {claimReview ? <Row><ClaimReview data={claimReview} /></Row> : null}

        <Row>
          <Text font={caption} breakWord>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </Text>
        </Row>
        <Row>
          {byUser ?
            <span className="media-detail__check-added-by" style={{ display: 'flex' }}>
              <UserAvatar
                user={media.user}
                size="extraSmall"
                style={{ display: 'inline-block', border: `1px solid ${black10}` }}
              />
              <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
                <FormattedMessage
                  id="mediaDetail.addedBy"
                  defaultMessage="Added {byUser}"
                  values={{ byUser }}
                />
              </span>
            </span>
            : null}
          {media.tags ?
            <MediaTags
              media={media}
              tags={media.tags.edges}
              isEditing={false}
            />
            : null}

          {this.props.readonly || this.state.isEditing ?
            null :
            <MediaActions
              media={media}
              handleEdit={this.handleEdit.bind(this)}
              handleMove={this.handleMove.bind(this)}
              handleRefresh={this.handleRefresh.bind(this)}
              handleSendToTrash={this.handleSendToTrash.bind(this)}
              handleRestore={this.handleRestore.bind(this)}
              handleDeleteForever={this.handleDeleteForever.bind(this)}
              handleAssign={this.handleAssign.bind(this)}
              style={{ display: 'flex' }}
              locale={locale}
            />}
        </Row>
        {assignment && !this.isStatusFinal(media.last_status) ?
          <Row>
            <div className="media-detail__assignment" style={{ display: 'flex', alignItems: 'center' }}>
              <UserAvatar
                user={media.last_status_obj.assigned_to}
                size="extraSmall"
                style={{ display: 'inline-block', border: `1px solid ${black10}` }}
              />
              <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
                <FormattedMessage
                  id="mediaDetail.assignedTo"
                  defaultMessage="Assigned to {name}"
                  values={{
                    name: <ProfileLink user={assignment} team={media.team} />,
                  }}
                />
              </span>
            </div>
          </Row> : null}

        <Dialog
          actions={moveDialogActions}
          modal
          open={this.state.openMoveDialog}
          onRequestClose={this.handleCloseDialogs.bind(this)}
          autoScrollBodyContent
        >
          <h4 className="media-detail__dialog-header">
            <FormattedMessage
              id="mediaDetail.dialogHeader"
              defaultMessage="Move this {mediaType} to a different project"
              values={{
                mediaType: MediaUtil.typeLabel(
                  media,
                  this.props.data,
                  this.props.intl,
                ),
              }}
            />
          </h4>
          <small className="media-detail__dialog-media-path">
            <FormattedMessage
              id="mediaDetail.dialogMediaPath"
              defaultMessage="Currently filed under {teamName} > {projectTitle}"
              values={{
                teamName: context.team.name,
                projectTitle: media.project.title,
              }}
            />
          </small>
          <DestinationProjects
            team={context.team}
            projectId={media.project.dbid}
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
              id="mediaDetail.deleteForever"
              defaultMessage="Delete forever"
            />
          </h2>
          <p>
            <FormattedMessage
              id="mediaDetail.deleteForeverConfirmationText"
              defaultMessage='Are you sure? This will permanently delete this item and its {notesCount, plural, =0 {0 annotations} one {1 annotation} other {# annotations}}. Type "confirm" if you want to proceed.'
              values={{ notesCount: media.log_count.toString() }}
            />
          </p>
          <TextField
            id="delete-forever__confirm"
            fullWidth
            errorText={this.state.confirmationError ?
              <FormattedMessage
                id="mediaDetail.confirmationError"
                defaultMessage="Did not match"
              />
              : null
            }
            hintText={
              <FormattedMessage
                id="mediaDetail.typeHere"
                defaultMessage="Type here"
              />
            }
          />
        </Dialog>

        <Dialog
          actions={assignDialogActions}
          modal
          open={this.state.openAssignDialog}
          onRequestClose={this.handleCloseDialogs.bind(this)}
          autoScrollBodyContent
        >
          <h4 className="media-detail__dialog-header">
            <FormattedMessage
              id="mediaDetail.assignDialogHeader"
              defaultMessage="Assignment"
            />
          </h4>
          <Attribution
            multi={false}
            selectedUsers={
              media.last_status_obj.assigned_to ?
                [{ node: media.last_status_obj.assigned_to }] : []
            }
            id={`media-${media.dbid}`}
          />
        </Dialog>
      </StyledMetadata>
    );
  }
}

MediaMetadata.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(MediaMetadata);
