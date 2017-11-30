import React, { Component } from 'react';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import TextField from 'material-ui/TextField';
import { Link } from 'react-router';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import MediaTags from './MediaTags';
import MediaActions from './MediaActions';
import MediaUtil from './MediaUtil';
import UpdateProjectMediaMutation from '../../relay/UpdateProjectMediaMutation';
import DeleteProjectMediaMutation from '../../relay/DeleteProjectMediaMutation';
import CreateTagMutation from '../../relay/CreateTagMutation';
import CheckContext from '../../CheckContext';
import Message from '../Message';
import {
  Row,
  black87,
  title,
  units,
  caption,
  Text,
} from '../../styles/js/shared';

const StyledMetadata = styled.div`
  margin: ${units(1)} ${units(1)} 0;

  // Move dialog
  //
  .media-detail__dialog-header {
    color: ${black87};
    font: ${title};
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
  error: {
    id: 'mediaDetail.moveFailed',
    defaultMessage: 'Sorry, we could not move this report',
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
      mediaVersion: false,
      openDeleteDialog: false,
      confirmationError: false,
      submitDisabled: true,
    };
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  handleError(json) {
    let message = `${this.props.intl.formatMessage(messages.error)}`;
    if (json && json.error) {
      message = json.error;
    }
    this.setState({ message });
  }

  handleRefresh() {
    const onFailure = (transaction) => {
      const transactionError = transaction.getError();
      transactionError.json
        ? transactionError.json().then(this.handleError)
        : this.handleError(JSON.stringify(transactionError));
    };

    const onSuccess = (response) => {
      this.setState({
        mediaVersion: JSON.parse(
          response.updateProjectMedia.project_media.embed,
        ).refreshes_count,
      });
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
      const transactionError = transaction.getError();
      transactionError.json
        ? transactionError.json().then(this.handleError)
        : this.handleError(JSON.stringify(transactionError));
    };

    const onSuccess = (response) => {
      const pm = response.updateProjectMedia.project_media;
      const message = (
        <FormattedMessage
          id="mediaMetadata.movedToTrash"
          defaultMessage={'Sent to {trash}'}
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
      const transactionError = transaction.getError();
      transactionError.json
        ? transactionError.json().then(this.handleError)
        : this.handleError(JSON.stringify(transactionError));
    };

    const onSuccess = (response) => {
      const pm = response.updateProjectMedia.project_media;
      const message = (
        <FormattedMessage
          id="mediaMetadata.movedBack"
          defaultMessage={'Moved back to project: {project}'}
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
    const confirmValue = document.getElementById('delete-forever__confirm')
      .value;
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
      const transactionError = transaction.getError();
      transactionError.json
        ? transactionError.json().then(this.handleError)
        : this.handleError(JSON.stringify(transactionError));
    };

    const onSuccess = (response) => {
      const message = (
        <FormattedMessage
          id="mediaMetadata.deletedForever"
          defaultMessage="Deleted"
        />
      );
      const history = this.getContext().history;
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
    const projectId = this.state.dstProj.dbid;
    const previousProjectId = this.currentProject().node.dbid;
    const history = this.getContext().history;

    const onFailure = (transaction) => {
      if (/^\/[^/]+\/project\/[0-9]+$/.test(window.location.pathname)) {
        history.push(`/${media.team.slug}/project/${previousProjectId}`);
      }
      const transactionError = transaction.getError();
      transactionError.json
        ? transactionError.json().then(this.handleError)
        : this.handleError(JSON.stringify(transactionError));
    };

    const path = `/${media.team.slug}/project/${projectId}`;

    const onSuccess = () => {
      if (/^\/[^/]+\/search\//.test(window.location.pathname)) {
        this.props.parentComponent.props.relay.forceFetch();
      } else if (
        /^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+$/.test(
          window.location.pathname,
        )
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
        srcProj: this.currentProject().node,
        dstProj: this.state.dstProj,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ openMoveDialog: false });
  }

  canSubmit() {
    let pendingTag = document.forms['edit-media-form'].sourceTagInput.value;
    pendingTag = pendingTag && pendingTag.trim();

    const title = this.state.title && !!this.state.title.trim();
    const description = this.state.description && !!this.state.description.trim();

    this.setState({ submitDisabled: !title && !description && !pendingTag });
  }

  currentProject() {
    const projectId = this.props.media.project_id;
    const context = this.getContext();
    const projects = context.team.projects.edges;

    return projects[projects.findIndex(p => p.node.dbid === projectId)];
  }

  destinationProjects() {
    const projectId = this.props.media.project_id;
    const context = this.getContext();
    if (context.team.projects) {
      const projects = context.team.projects.edges.sortp((a, b) =>
        a.node.title.localeCompare(b.node.title),
      );

      return projects.filter(p => p.node.dbid !== projectId);
    }

    return [];
  }

  handleChangeTitle(e) {
    this.setState({ title: e.target.value }, this.canSubmit);
  }

  handleChangeDescription(e) {
    this.setState({ description: e.target.value }, this.canSubmit);
  }

  handleSave(media, event) {
    if (this.state.submitDisabled) { return; }

    if (event) {
      event.preventDefault();
    }

    const pendingTag = document.forms['edit-media-form'].sourceTagInput.value;
    const title = this.state.title && this.state.title.trim();
    const description = this.state.description && this.state.description.trim();

    const embed = {};
    embed.title = title;
    embed.description = description;

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

    if (title || description) {
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
      let tagsList = [...new Set(pendingTag.split(','))];

      tagsList.map((tag) => {
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

    this.setState({ message: null, tagErrorMessage: null, pendingMutations: null, hasFailure: false, submitDisabled: true });
  }

  fail = (transaction, mutation) => {
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.editReportError);
    try {
      const json = JSON.parse(error.source);
      if (json.error) {
        message = json.error;
      }
    } catch (e) {}
    const tagErrorMessage = message;

    if (mutation === 'createTag') {
      this.setState({ tagErrorMessage, hasFailure: true, submitDisabled: false });
    } else {
      this.setState({ message, hasFailure: true, submitDisabled: false });
    }
  };

  success = (response, mutation) => {
    const manageEditingState = () => {
      const submitDisabled = this.state.pendingMutations.length > 0;
      const isEditing = submitDisabled || this.state.hasFailure;
      const message = isEditing ? this.state.message : null;

      this.setState({ isEditing, submitDisabled, message });
    };

    const pendingMutations = this.state.pendingMutations
      ? this.state.pendingMutations.slice(0)
      : [];
    this.setState(
      { pendingMutations: pendingMutations.filter(m => m !== mutation) },
      manageEditingState,
    );
  };

  registerPendingMutation = (mutation) => {
    const pendingMutations = this.state.pendingMutations
      ? this.state.pendingMutations.slice(0)
      : [];
    pendingMutations.push(mutation);
    this.setState({ pendingMutations });
  };

  handleCancel() {
    this.setState({
      isEditing: false,
      hasFailure: false,
      message: null,
      tagErrorMessage: null,
      title: null,
      description: null,
      submitDisabled: true,
      pendingMutations: null,
    });
  }

  handleCloseDialogs() {
    this.setState({
      isEditing: false,
      openMoveDialog: false,
      dstProj: null,
      openDeleteDialog: false,
    });
  }

  handleSelectDestProject(event, dstProj) {
    this.setState({ dstProj });
  }

  render() {
    const { media } = this.props;
    const data = JSON.parse(media.embed);
    const context = this.getContext();
    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';

    const byUser = media.user &&
      media.user.source &&
      media.user.source.dbid &&
      media.user.name !== 'Pender'
      ? (<FormattedMessage
        id="mediaDetail.byUser"
        defaultMessage={'by {username}'}
        values={{
          username: (
            <Link to={`/check/user/${media.user.dbid}`}>
              {media.user.name}
            </Link>
            ),
        }}
      />)
      : '';
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
        keyboardFocused
        onClick={this.handleMoveProjectMedia.bind(this)}
        disabled={!this.state.dstProj}
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

        { media.tags &&
          <MediaTags
            media={media}
            tags={media.tags.edges}
            errorText={this.state.tagErrorMessage}
            onChange={() => {
              this.setState({ tagErrorMessage: null });
              this.canSubmit();
            }}
            ref={"mediaTags"}
            isEditing
          />
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
            disabled={this.state.submitDisabled}
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

    const url = MediaUtil.url(media, data);

    return (
      <StyledMetadata
        fromDirection={fromDirection}
        className="media-detail__check-metadata"
      >
        {this.state.isEditing ? editDialog : null}
        <Row>
          <Text font={caption} breakWord>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </Text>
        </Row>
        <Row>
          {byUser
            ? <span className="media-detail__check-added-by">
              <FormattedMessage
                id="mediaDetail.addedBy"
                defaultMessage={'Added {byUser}'}
                values={{ byUser }}
              />
            </span>
            : null}
          {media.tags
            ? <MediaTags
              media={media}
              tags={media.tags.edges}
              isEditing={false}
            />
            : null}

          {this.props.readonly || this.state.isEditing
            ? null
            : <MediaActions
              media={media}
              handleEdit={this.handleEdit.bind(this)}
              handleMove={this.handleMove.bind(this)}
              handleRefresh={this.handleRefresh.bind(this)}
              handleSendToTrash={this.handleSendToTrash.bind(this)}
              handleRestore={this.handleRestore.bind(this)}
              handleDeleteForever={this.handleDeleteForever.bind(this)}
              style={{ display: 'flex' }}
              locale={this.props.intl.locale}
            />}
        </Row>

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
              defaultMessage={'Move this {mediaType} to a different project'}
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
              defaultMessage={
                'Currently filed under {teamName} > {projectTitle}'
              }
              values={{
                teamName: context.team.name,
                projectTitle: media.project.title,
              }}
            />
          </small>
          <RadioButtonGroup
            name="moveMedia"
            className="media-detail__dialog-radio-group"
            onChange={this.handleSelectDestProject.bind(this)}
          >
            {this.destinationProjects().map(proj =>
              <RadioButton
                key={proj.node.dbid}
                label={proj.node.title}
                value={proj.node}
                style={{ padding: units(1) }}
              />,
            )}
          </RadioButtonGroup>
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
              defaultMessage={
                'Are you sure? This will permanently delete this item and its {notesCount, plural, =0 {0 annotations} one {1 annotation} other {# annotations}}. Type "confirm" if you want to proceed.'
              }
              values={{ notesCount: media.log_count.toString() }}
            />
          </p>
          <TextField
            id="delete-forever__confirm"
            fullWidth
            errorText={
              this.state.confirmationError
                ? <FormattedMessage
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
      </StyledMetadata>
    );
  }
}

MediaMetadata.contextTypes = {
  store: React.PropTypes.object,
  setMessage: React.PropTypes.func,
};

export default injectIntl(MediaMetadata);
