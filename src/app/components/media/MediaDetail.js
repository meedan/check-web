import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router';
import config from 'config';
import MediaStatus from './MediaStatus';
import MediaTags from './MediaTags';
import QuoteMediaCard from './QuoteMediaCard';
import SocialMediaCard from './SocialMediaCard';
import MediaActions from './MediaActions';
import MediaUtil from './MediaUtil';
import Tags from '../source/Tags';
import DefaultButton from '../inputs/DefaultButton';
import PenderCard from '../PenderCard';
import UpdateMediaMutation from '../../relay/UpdateMediaMutation';
import CheckContext from '../../CheckContext';

class MediaDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
    };
  }

  handleEdit() {
    this.setState({ isEditing: true });
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
      new UpdateMediaMutation({
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

  statusToClass(baseClass, status) {
    return status.length ?
      [baseClass, `${baseClass}--${status.toLowerCase().replace(/[ _]/g, '-')}`].join(' ') :
      baseClass;
  }

  render() {
    const { media, annotated, annotatedType } = this.props;
    const data = JSON.parse(media.embed);
    const createdAt = MediaUtil.createdAt(media);
    const annotationsCount = MediaUtil.notesCount(media, data);

    let projectId = media.project_id;
    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }
    const mediaUrl = projectId ? `/project/${projectId}/media/${media.dbid}` : null;

    const byUser = (media.user && media.user.source && media.user.source.dbid && media.user.name !== 'Pender') ?
      (<span>by {media.user.name}</span>) : '';

    let embedCard = null;
    media.url = media.media.url
    media.quote = media.media.quote
    if (media.quote && media.quote.length) {
      embedCard = <QuoteMediaCard quoteText={media.quote} attributionName={null} attributionUrl={null} />;
    } else if (media.url) {
      embedCard = this.props.condensed ?
        <SocialMediaCard media={media} data={data} /> :
        <PenderCard url={media.url} penderUrl={config.penderUrl} fallback={<SocialMediaCard media={media} data={data} />} />;
    }

    return (
      <div className={this.statusToClass('media-detail', media.last_status)}>
        <div className="media-detail__header">
          <div className="media-detail__status"><MediaStatus media={media} readonly={this.props.readonly} /></div>
          {this.state.isEditing ? (
            <span className="media-detail__editing-buttons">
              <DefaultButton onClick={this.handleCancel.bind(this)} className="media-detail__cancel-edits" size="xsmall">Cancel</DefaultButton>
              <DefaultButton onClick={this.handleSave.bind(this, media)} className="media-detail__save-edits" size="xsmall" style="primary">Done</DefaultButton>
            </span>
              ) : null
            }
          {this.props.readonly || this.state.isEditing ? null :
          <MediaActions media={media} handleEdit={this.handleEdit.bind(this)} />
            }
        </div>

        {this.state.isEditing ?
          <form onSubmit={this.handleSave.bind(this, media)}><input type="text" id={`media-detail-title-input-${media.dbid}`} className="media-detail__title-input" placeholder="Title" defaultValue={MediaUtil.truncatedTitle(media, data)} /></form> :
          <h2 className="media-detail__title"><Link to={mediaUrl}>{this.props.condensed ? MediaUtil.truncatedTitle(media, data) : MediaUtil.title(media, data)}</Link></h2>
        }

        <div className={this.statusToClass('media-detail__media', media.last_status)}>
          {embedCard}
        </div>

        <p className="media-detail__check-metadata">
          {byUser ? <span className="media-detail__check-added-by">Added {byUser} </span> : null}
          {createdAt ? <span className="media-detail__check-added-at">
            <Link className="media-detail__check-timestamp" to={mediaUrl}><TimeAgo date={createdAt} live={false} /></Link>
          </span> : null}
          <Link to={mediaUrl} className="media-detail__check-notes-count">{annotationsCount}</Link>
        </p>

        {media.tags ? <MediaTags media={media} tags={media.tags.edges} isEditing={this.state.isEditing} /> : null}
      </div>
    );
  }
}

MediaDetail.contextTypes = {
  store: React.PropTypes.object,
};

export default MediaDetail;
