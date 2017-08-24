import React, { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Relay from 'react-relay';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import MediaStatus from './MediaStatus';
import MediaTags from './MediaTags';
import MediaActions from './MediaActions';
import MediaUtil from './MediaUtil';
import TimeBefore from '../TimeBefore';
import UpdateProjectMediaMutation from '../../relay/UpdateProjectMediaMutation';
import CheckContext from '../../CheckContext';
import ProfileLink from '../layout/ProfileLink';
import Message from '../Message';

const messages = defineMessages({
  mediaTitle: {
    id: 'mediaDetail.mediaTitle',
    defaultMessage: 'Title',
  },
  error: {
    id: 'mediaDetail.moveFailed',
    defaultMessage: 'Sorry, we could not move this report',
  },
});

class MediaMetadata extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      openMoveDialog: false,
      mediaVersion: false,
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
        mediaVersion: JSON.parse(response.updateProjectMedia.project_media.embed).refreshes_count,
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
      } else if (/^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+$/.test(window.location.pathname)) {
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

  currentProject() {
    const projectId = this.props.media.project_id;
    const context = this.getContext();
    const projects = context.team.projects.edges;

    return projects[projects.findIndex(p => p.node.dbid === projectId)];
  }

  destinationProjects() {
    const projectId = this.props.media.project_id;
    const context = this.getContext();
    const projects = context.team.projects.edges.sortp((a, b) =>
      a.node.title.localeCompare(b.node.title),
    );

    return projects.filter(p => p.node.dbid !== projectId);
  }


  // Todo move editing to a separate modal
  // The handleSave function is duplicated in MediaDetail
  // 2017-8-24 CGB
  //
  handleSave(media, event) {
    if (event) {
      event.preventDefault();
    }


    const titleInput = document.querySelector(`#media-detail-title-input-${media.dbid}`);
    const newTitle = (titleInput.value || '').trim();


    const onFailure = (transaction) => {
      const transactionError = transaction.getError();
      transactionError.json
        ? transactionError.json().then(alert('Unhandled error'))
        : alert(JSON.stringify(transactionError));
    };

    const onSuccess = () => {
      this.setState({ isEditing: false });
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        embed: JSON.stringify({ title: newTitle }),
        id: media.id,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ isEditing: false });
  }

  handleCancel() {
    this.setState({ isEditing: false });
  }

  handleCloseDialog() {
    this.setState({ openMoveDialog: false, dstProj: null });
  }

  handleSelectDestProject(event, dstProj) {
    this.setState({ dstProj });
  }

  render() {
    const { media, readonly, mediaUrl } = this.props;
    const createdAt = MediaUtil.createdAt(media);
    const context = this.getContext();
    const currentProject = this.currentProject();
    const destinationProjects = this.destinationProjects();

    const byUser = media.user &&
      media.user.source &&
      media.user.source.dbid &&
      media.user.name !== 'Pender'
      ? (<FormattedMessage
        id="mediaDetail.byUser"
        defaultMessage={'by {username}'}
        values={{ username: <ProfileLink user={media.user} /> }}
      />)
      : '';
    const actions = [
      <FlatButton
        label={<FormattedMessage id="mediaDetail.cancelButton" defaultMessage="Cancel" />}
        primary
        onClick={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        label={<FormattedMessage id="mediaDetail.move" defaultMessage="Move" />}
        primary
        keyboardFocused
        onClick={this.handleMoveProjectMedia.bind(this)}
        disabled={!this.state.dstProj}
      />,
    ];

    return (
      <div className="media-detail__check-metadata">

        {
          // TODO move to modal
          this.state.isEditing
            ? (<form onSubmit={this.handleSave.bind(this, media)}>
              <input
                type="text"
                id={`media-detail-title-input-${media.dbid}`}
                className="media-detail__title-input"
                placeholder={this.props.intl.formatMessage(messages.mediaTitle)}
                defaultValue={this.props.heading}
                style={{ width: '100%' }}
              />
            </form>)
            : null
        }
        <Message message={this.state.message} />
        <MediaStatus media={media} readonly={readonly} />
        {byUser
          ? <span className="media-detail__check-added-by">
            <FormattedMessage
              id="mediaDetail.added"
              defaultMessage={'Added {byUser}'}
              values={{ byUser }}
            />{' '}
          </span>
          : null}
        {createdAt
          ? <span className="media-detail__check-added-at">
            <Link className="media-detail__check-timestamp" to={mediaUrl}>
              <TimeBefore date={createdAt} />
            </Link>
          </span>
          : null}
        {media.tags
          ? <MediaTags media={media} tags={media.tags.edges} isEditing={this.state.isEditing} />
          : null}
        {this.state.isEditing
          ? <span style={{ display: 'flex' }}>
            <FlatButton
              onClick={this.handleCancel.bind(this)}
              className="media-detail__cancel-edits"
              label={<FormattedMessage id="mediaDetail.cancelButton" defaultMessage="Cancel" />}
            />
            <FlatButton
              onClick={this.handleSave.bind(this, media)}
              className="media-detail__save-edits"
              label={<FormattedMessage id="mediaDetail.doneButton" defaultMessage="Done" />}
            />
          </span>
          : null}
        {this.props.readonly || this.state.isEditing
          ? null
          : <MediaActions
            media={media}
            handleEdit={this.handleEdit.bind(this)}
            handleMove={this.handleMove.bind(this)}
            handleRefresh={this.handleRefresh.bind(this)}
          />}

        <Dialog
          actions={actions}
          modal
          open={this.state.openMoveDialog}
          onRequestClose={this.handleCloseDialog.bind(this)}
          autoScrollBodyContent
        >
          <h4 className="media-detail__dialog-header">
            <FormattedMessage
              id="mediaDetail.dialogHeader"
              defaultMessage={'Move this {mediaType} to a different project'}
              values={{ mediaType: MediaUtil.typeLabel(media, this.props.data, this.props.intl) }}
            />
          </h4>
          <small className="media-detail__dialog-media-path">
            <FormattedMessage
              id="mediaDetail.dialogMediaPath"
              defaultMessage={'Currently filed under {teamName} > {projectTitle}'}
              values={{ teamName: context.team.name, projectTitle: currentProject.node.title }}
            />
          </small>
          <RadioButtonGroup
            name="moveMedia"
            className="media-detail__dialog-radio-group"
            onChange={this.handleSelectDestProject.bind(this)}
          >
            {destinationProjects.map(proj =>
              <RadioButton
                key={proj.node.dbid}
                label={proj.node.title}
                value={proj.node}
                style={{ padding: '5px' }}
              />,
            )}
          </RadioButtonGroup>
        </Dialog>
      </div>
    );
  }
}


MediaMetadata.contextTypes = {
  store: React.PropTypes.object,
};


export default MediaMetadata;
