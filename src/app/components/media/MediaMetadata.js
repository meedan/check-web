import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { Link } from 'react-router';
import Tooltip from 'rc-tooltip';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import MediaTags from './MediaTags';
import MediaActions from './MediaActions';
import MediaUtil from './MediaUtil';
import ClaimReview from './ClaimReview';
import MoveDialog from './MoveDialog';
import UserTooltip from '../user/UserTooltip';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import CheckContext from '../../CheckContext';
import TagMenu from '../tag/TagMenu';
import Attribution from '../task/Attribution';
import UserAvatar from '../UserAvatar';
import UserAvatars from '../UserAvatars';
import ProfileLink from '../layout/ProfileLink';
import Sentence from '../Sentence';
import { nested, safelyParseJSON } from '../../helpers';
import globalStrings from '../../globalStrings';
import { stringHelper } from '../../customHelpers';
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

  .media-detail__buttons {
    display: flex;
    alignItems: center;
    margin-${props => props.fromDirection}: auto;
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

class MediaMetadata extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      description: null,
      title: null,
      openAssignDialog: false,
      openMoveDialog: false,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  getDescription() {
    const { media } = this.props;

    const defaultDescription = MediaUtil.hasCustomDescription(media, media.embed)
      ? media.embed.description
      : null;

    return (typeof this.state.description === 'string') ? this.state.description.trim() : defaultDescription;
  }

  getTitle() {
    return (typeof this.state.title === 'string') ? this.state.title.trim() : this.props.title;
  }

  handleError(json) {
    let message = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    if (json && json.error) {
      message = json.error;
    }
    this.context.setMessage(message);
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

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: this.props.media.id,
      }),
      { onFailure },
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
        relationship_sources_count: this.props.media.relationships.sources_count,
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
      } else if (/^\/[^/]+\/project\/[0-9]+$/.test(window.location.pathname)) {
        history.push(path);
      } else if (/^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+$/.test(window.location.pathname)) {
        history.push(`${path}/media/${media.dbid}`);
      }
    };

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
      { onSuccess, onFailure },
    );

    this.setState({ openAssignDialog: false });
  }

  handleStatusLock() {
    const { media } = this.props;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

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
      { onFailure },
    );
  }

  currentProject() {
    return this.props.media.project;
  }

  canSubmit = () => {
    const { title, description } = this.state;
    return (typeof title === 'string' || typeof description === 'string');
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

    const { title, description } = this.state;

    if (typeof title === 'string') {
      embed.title = title.trim();
    }

    if (typeof description === 'string') {
      embed.description = description.trim();
    }

    if (!embed.title && media.media.embed_path) {
      embed.title = media.media.embed_path.split('/').pop().replace('embed_', '');
    }

    const onFailure = (transaction) => {
      this.fail(transaction);
    };

    if (this.canSubmit()) {
      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          media,
          embed: JSON.stringify(embed),
          id: media.id,
        }),
        { onFailure },
      );
    }

    this.handleCancel();
  }

  fail(transaction) {
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.editReportError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const json = safelyParseJSON(error.source);
    if (json && json.error) {
      message = json.error;
    }
    this.context.setMessage(message);
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
      openMoveDialog: false,
      dstProj: null,
      openAssignDialog: false,
    });
  }

  handleSelectDestProject(event, dstProj) {
    this.setState({ dstProj });
  }

  // FIXME replace with helper getStatus().completed
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

    const editDialog = (
      <Dialog
        modal
        title={this.props.intl.formatMessage(messages.editReport)}
        open={this.state.isEditing}
        onRequestClose={this.handleCloseDialogs.bind(this)}
        autoScrollBodyContent
      >
        <form onSubmit={this.handleSave.bind(this, media)} name="edit-media-form">
          <TextField
            type="text"
            id={`media-detail-title-input-${media.dbid}`}
            className="media-detail__title-input"
            floatingLabelText={this.props.intl.formatMessage(messages.mediaTitle)}
            defaultValue={this.getTitle()}
            onChange={this.handleChangeTitle.bind(this)}
            style={{ width: '100%' }}
          />

          <TextField
            type="text"
            id={`media-detail-description-input-${media.dbid}`}
            className="media-detail__description-input"
            floatingLabelText={this.props.intl.formatMessage(messages.mediaDescription)}
            defaultValue={this.getDescription()}
            onChange={this.handleChangeDescription.bind(this)}
            style={{ width: '100%' }}
            multiLine
          />
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
            disabled={!this.canSubmit()}
            primary
          />
        </span>
      </Dialog>
    );

    const claimReview = data.schema && data.schema.ClaimReview ? data.schema.ClaimReview[0] : null;
    const url = MediaUtil.url(media, data);
    const assignments = media.last_status_obj.assignments.edges;
    const assignmentComponents = [];
    assignments.forEach((assignment) => {
      assignmentComponents.push(<ProfileLink user={assignment.node} team={media.team} />);
    });

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
          {media.tags ? <MediaTags media={media} tags={media.tags.edges} /> : null}
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

          <div className="media-detail__buttons">
            <TagMenu media={media} />

            {this.props.readonly || this.state.isEditing ?
              null :
              <MediaActions
                media={media}
                handleEdit={this.handleEdit.bind(this)}
                handleMove={this.handleMove.bind(this)}
                handleRefresh={this.handleRefresh.bind(this)}
                handleSendToTrash={this.handleSendToTrash.bind(this)}
                handleRestore={this.handleRestore.bind(this)}
                handleAssign={this.handleAssign.bind(this)}
                handleStatusLock={this.handleStatusLock.bind(this)}
                handleMemebuster={() => {}}
                style={{ display: 'flex' }}
                locale={locale}
              />}
          </div>
        </Row>
        {assignments && !this.isStatusFinal(media.last_status) ?
          <Row>
            <div className="media-detail__assignment" style={{ display: 'flex', alignItems: 'center' }}>
              <UserAvatars users={assignments} />
              {assignments.length > 0 ?
                <span style={{ lineHeight: '24px', paddingLeft: units(1), paddingRight: units(1) }}>
                  <FormattedMessage
                    id="mediaDetail.assignedTo"
                    defaultMessage="Assigned to {name}"
                    values={{
                      name: <Sentence list={assignmentComponents} />,
                    }}
                  />
                </span> : null}
            </div>
          </Row> : null}

        <MoveDialog
          actions={moveDialogActions}
          open={this.state.openMoveDialog}
          handleClose={this.handleCloseDialogs.bind(this)}
          team={context.team}
          projectId={nested(['project', 'dbid'], media)}
          onChange={this.handleSelectDestProject.bind(this)}
        />

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
            multi
            selectedUsers={assignments}
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
