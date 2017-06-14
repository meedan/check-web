import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import config from 'config';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import MediaStatus from './MediaStatus';
import MediaTags from './MediaTags';
import QuoteMediaCard from './QuoteMediaCard';
import SocialMediaCard from './SocialMediaCard';
import MediaActions from './MediaActions';
import MediaUtil from './MediaUtil';
import Tags from '../source/Tags';
import DefaultButton from '../inputs/DefaultButton';
import PenderCard from '../PenderCard';
import TimeBefore from '../TimeBefore';
import ImageMediaCard from './ImageMediaCard';
import UpdateProjectMediaMutation from '../../relay/UpdateProjectMediaMutation';
import CheckContext from '../../CheckContext';
import { bemClass, safelyParseJSON, getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const messages = defineMessages({
  error: {
    id: 'mediaDetail.moveFailed',
    defaultMessage: 'Sorry, we could not move this report',
  },
  mediaTitle: {
    id: 'mediaDetail.mediaTitle',
    defaultMessage: 'Title',
  },
});

class MediaDetail extends Component {
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

  handleEdit() {
    this.setState({ isEditing: true });
  }

  handleMove() {
    this.setState({ openMoveDialog: true });
  }

  handleRefresh() {
    const onFailure = (transaction) => {
      const transactionError = transaction.getError();
      transactionError.json ? transactionError.json().then(handleError) : handleError(JSON.stringify(transactionError));
    };

    const onSuccess = (response) => {
      this.setState({ mediaVersion: JSON.parse(response.updateProjectMedia.project_media.embed).refreshes_count });
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: this.props.media.id,
      }),
      { onSuccess, onFailure },
    );
  }

  handleSave(media, event) {
    if (event) {
      event.preventDefault();
    }

    const titleInput = document.querySelector(`#media-detail-title-input-${media.dbid}`);
    const newTitle = (titleInput.value || '').trim();

    const onFailure = (transaction) => {
      const transactionError = transaction.getError();
      transactionError.json ? transactionError.json().then(handleError) : handleError(JSON.stringify(transactionError));
    };

    const onSuccess = (response) => {
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

  submitMoveProjectMedia() {
    const { media } = this.props;
    const projectId = this.state.dstProj.dbid;
    const previousProjectId = this.currentProject().node.dbid;
    const history = this.getContext().history;
    const that = this;

    const handleError = (json) => {
      let message = `${this.props.intl.formatMessage(messages.error)} <b id="close-message">✖</b>`;
      if (json && json.error) {
        message = json.error;
      }
      that.setState({ message });
    };

    const onFailure = (transaction) => {
      if (/^\/[^\/]+\/project\/[0-9]+$/.test(window.location.pathname)) {
        history.push(`/${media.team.slug}/project/${previousProjectId}`);
      }
      const transactionError = transaction.getError();
      transactionError.json ? transactionError.json().then(handleError) : handleError(JSON.stringify(transactionError));
    };

    const path = `/${media.team.slug}/project/${projectId}`;

    const onSuccess = (response) => {
      if (/^\/[^\/]+\/search\//.test(window.location.pathname)) {
        that.props.parentComponent.props.relay.forceFetch();
      } else if (/^\/[^\/]+\/project\/[0-9]+\/media\/[0-9]+$/.test(window.location.pathname)) {
        history.push(`${path}/media/${media.dbid}`);
      }
    };

    // Optimistic-redirect to target project
    if (/^\/[^\/]+\/project\/[0-9]+$/.test(window.location.pathname)) {
      history.push(path);
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        project_id: projectId,
        id: media.id,
        srcProj: that.currentProject().node,
        dstProj: this.state.dstProj,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ openMoveDialog: false });
  }

  statusToClass(baseClass, status) {
    // TODO: replace with helpers.js#bemClassFromMediaStatus
    return status.length ?
      [baseClass, `${baseClass}--${status.toLowerCase().replace(/[ _]/g, '-')}`].join(' ') :
      baseClass;
  }

  currentProject() {
    const projectId = this.props.media.project_id;
    const context = this.getContext();
    const projects = context.team.projects.edges;

    return projects[projects.findIndex(p => (p.node.dbid === projectId))];
  }

  destinationProjects() {
    const projectId = this.props.media.project_id;
    const context = this.getContext();
    const projects = context.team.projects.edges.sortp((a, b) => a.node.title.localeCompare(b.node.title));

    return projects.filter(p => (p.node.dbid !== projectId));
  }

  profileLink(user){
    let url = user.email ? 'mailto:' + user.email : '';

    if (user && user.source && user.source.accounts && user.source.accounts.edges && user.source.accounts.edges.length > 0){
      url = user.source.accounts.edges[0].node.url;
    }

    return url ? <a target="_blank" rel="noopener noreferrer" href={url}>{user.name}</a> : user.name;
  }

  render() {
    const { media, annotated, annotatedType, condensed } = this.props;
    const data = JSON.parse(media.embed);
    const createdAt = MediaUtil.createdAt(media);
    const annotationsCount = MediaUtil.notesCount(media, data, this.props.intl);
    const userOverrides = safelyParseJSON(media.overridden);

    const context = this.getContext();

    let projectId = media.project_id;
    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }
    const mediaUrl = (projectId && media.team) ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}` : null;

    const currentProject = this.currentProject();
    const destinationProjects = this.destinationProjects();

    const byUser = (media.user && media.user.source && media.user.source.dbid && media.user.name !== 'Pender') ?
      (<FormattedMessage id="mediaDetail.byUser" defaultMessage={'by {username}'} values={{ username: this.profileLink(media.user) }} />) : '';

    let embedCard = null;
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;

    const heading = (userOverrides && userOverrides.title) ? MediaUtil.title(media, data, this.props.intl) : MediaUtil.attributedType(media, data, this.props.intl);

    if (media.media.embed_path) {
      const path = condensed ? media.media.thumbnail_path : media.media.embed_path;
      embedCard = <ImageMediaCard imagePath={path} />;
    } else if (media.quote && media.quote.length) {
      embedCard = <QuoteMediaCard quoteText={media.quote} languageCode={media.language_code} attributionName={null} attributionUrl={null} />;
    } else if (media.url) {
      embedCard = condensed ?
        <SocialMediaCard media={media} data={data} condensed={condensed} /> :
        <PenderCard url={media.url} penderUrl={config.penderUrl} fallback={null} mediaVersion={this.state.mediaVersion || data.refreshes_count} />;
    }

    const actions = [
      <FlatButton label={<FormattedMessage id="mediaDetail.cancelButton" defaultMessage="Cancel" />} primary onClick={this.handleCloseDialog.bind(this)} />,
      <FlatButton label={<FormattedMessage id="mediaDetail.move" defaultMessage="Move" />} primary keyboardFocused onClick={this.submitMoveProjectMedia.bind(this)} disabled={!this.state.dstProj} />,
    ];
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

    return (
      <div className={`${this.statusToClass('media-detail', mediaLastStatus(media))} ` + `media-detail--${MediaUtil.mediaTypeCss(media, data)}`} style={{ borderColor: getStatusStyle(status, 'borderColor') }}>
        <div className="media-detail__header">
          <div className="media-detail__status"><MediaStatus media={media} readonly={this.props.readonly} /></div>
        </div>

        {this.state.isEditing ?
          <form onSubmit={this.handleSave.bind(this, media)}><input type="text" id={`media-detail-title-input-${media.dbid}`} className="media-detail__title-input" placeholder={this.props.intl.formatMessage(messages.mediaTitle)} defaultValue={heading} /></form> :
          <h2 className="media-detail__heading"><Link to={mediaUrl}>{heading}</Link></h2>
        }

        <div className={this.statusToClass('media-detail__media', mediaLastStatus(media))}>
          {embedCard}
        </div>

        <div className="media-detail__check-metadata">
          {media.tags ? <MediaTags media={media} tags={media.tags.edges} isEditing={this.state.isEditing} /> : null}
          {byUser ? <span className="media-detail__check-added-by"><FormattedMessage id="mediaDetail.added" defaultMessage={'Added {byUser}'} values={{ byUser }} /> </span> : null}
          {createdAt ? <span className="media-detail__check-added-at">
            <Link className="media-detail__check-timestamp" to={mediaUrl}><TimeBefore date={createdAt} /></Link>
          </span> : null}
          <Link to={mediaUrl} className="media-detail__check-notes-count">{annotationsCount}</Link>
          {this.state.isEditing ? (
            <span className="media-detail__editing-buttons">
              <DefaultButton onClick={this.handleCancel.bind(this)} className="media-detail__cancel-edits" size="xsmall">
                <FormattedMessage id="mediaDetail.cancelButton" defaultMessage="Cancel" />
              </DefaultButton>
              <DefaultButton onClick={this.handleSave.bind(this, media)} className="media-detail__save-edits" size="xsmall" style="primary">
                <FormattedMessage id="mediaDetail.doneButton" defaultMessage="Done" />
              </DefaultButton>
            </span>
              ) : null
            }
          {this.props.readonly || this.state.isEditing ? null :
          <MediaActions media={media} handleEdit={this.handleEdit.bind(this)} handleMove={this.handleMove.bind(this)} handleRefresh={this.handleRefresh.bind(this)} />
          }

          <Dialog actions={actions} modal open={this.state.openMoveDialog} onRequestClose={this.handleCloseDialog.bind(this)} autoScrollBodyContent>
            <h4 className="media-detail__dialog-header">
              <FormattedMessage id="mediaDetail.dialogHeader" defaultMessage={'Move this {mediaType} to a different project'} values={{ mediaType: MediaUtil.typeLabel(media, data, this.props.intl) }} />
            </h4>
            <small className="media-detail__dialog-media-path">
              <FormattedMessage id="mediaDetail.dialogMediaPath" defaultMessage={'Currently filed under {teamName} > {projectTitle}'} values={{ teamName: context.team.name, projectTitle: currentProject.node.title }} />
            </small>
            <RadioButtonGroup name="moveMedia" className="media-detail__dialog-radio-group" onChange={this.handleSelectDestProject.bind(this)}>
              {destinationProjects.map(proj => (<RadioButton label={proj.node.title} value={proj.node} style={{ padding: '5px' }} />))}
            </RadioButtonGroup>
          </Dialog>
        </div>
      </div>
    );
  }
}

MediaDetail.propTypes = {
  intl: intlShape.isRequired,
};

MediaDetail.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(MediaDetail);
