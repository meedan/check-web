import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import config from 'config';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RadioButton from 'material-ui/RadioButton';
import RadioButtonGroup from 'material-ui/RadioButton';
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
import { bemClass } from '../../helpers';

const messages = defineMessages({
  mediaTitle: {
    id: 'mediaDetail.mediaTitle',
    defaultMessage: 'Title'
  }
});

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

  handleMove() {
    this.setState({ openMoveDialog: true });
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
    this.setState({ openMoveDialog: false });
  }

  handleMoveProjectMedia() { //maybe rename to submit of perform
    console.log('should move media between projects');
  }

  statusToClass(baseClass, status) {
    // TODO: replace with helpers.js#bemClassFromMediaStatus
    return status.length ?
      [baseClass, `${baseClass}--${status.toLowerCase().replace(/[ _]/g, '-')}`].join(' ') :
      baseClass;
  }

  render() {
    const { media, annotated, annotatedType, condensed } = this.props;
    const data = JSON.parse(media.embed);
    const createdAt = MediaUtil.createdAt(media);
    const annotationsCount = MediaUtil.notesCount(media, data);

    let projectId = media.project_id;
    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }
    const mediaUrl = (projectId && media.team) ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}` : null;

    const byUser = (media.user && media.user.source && media.user.source.dbid && media.user.name !== 'Pender') ?
      (<FormattedMessage id="mediaDetail.byUser" defaultMessage={`by {username}`} values={{username: media.user.name}} />) : '';

    let embedCard = null;
    media.url = media.media.url;
    media.quote = media.media.quote;

    if (media.media.embed_path) {
      const path = condensed ? media.media.thumbnail_path : media.media.embed_path;
      embedCard = <ImageMediaCard imagePath={path} />;
    } else if (media.quote && media.quote.length) {
      embedCard = <QuoteMediaCard quoteText={media.quote} attributionName={null} attributionUrl={null} />;
    } else if (media.url) {
       embedCard = condensed ?
                   <SocialMediaCard media={media} data={data} condensed={condensed} /> :
                   <PenderCard url={media.url} penderUrl={config.penderUrl} fallback={null} />;
    }

    const actions = [
      <FlatButton label={<FormattedMessage id="mediaDetail.cancel" defaultMessage="Nevermind" />} primary={true} onClick={this.handleCloseDialog.bind(this)} />,
      <FlatButton label={<FormattedMessage id="mediaDetail.move" defaultMessage="Move" />} primary={true} keyboardFocused={true} onClick={this.handleMoveProjectMedia.bind(this)} />
    ];

    return (
      <div className={this.statusToClass('media-detail', media.last_status) + ' ' + 'media-detail--' + MediaUtil.typeLabel(media, data).toLowerCase()}>
        <div className="media-detail__header">
          <div className="media-detail__status"><MediaStatus media={media} readonly={this.props.readonly} /></div>
        </div>

        {this.state.isEditing ?
          <form onSubmit={this.handleSave.bind(this, media)}><input type="text" id={`media-detail-title-input-${media.dbid}`} className="media-detail__title-input" placeholder={this.props.intl.formatMessage(messages.mediaTitle)} defaultValue={MediaUtil.truncatedTitle(media, data)} /></form> :
          <h2 className="media-detail__title"><Link to={mediaUrl}>{this.props.condensed ? MediaUtil.truncatedTitle(media, data) : MediaUtil.title(media, data)}</Link></h2>
        }

        <div className={this.statusToClass('media-detail__media', media.last_status)}>
          {embedCard}
        </div>

        <div className="media-detail__check-metadata">
          {media.tags ? <MediaTags media={media} tags={media.tags.edges} isEditing={this.state.isEditing} /> : null}
          {byUser ? <span className="media-detail__check-added-by"><FormattedMessage id="mediaDetail.added" defaultMessage={`Added {byUser}`} values={{byUser: byUser}} /> </span> : null}
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
          <MediaActions media={media} handleEdit={this.handleEdit.bind(this)} handleMove={this.handleMove.bind(this)}/>
            }

          <Dialog actions={actions} modal={true} open={this.state.openMoveDialog} onRequestClose={this.handleCloseDialog.bind(this)}>
            <h4>Move this project_media.media.type to a different project</h4>
            <small>Currently filed under project_media.team.name > project_media.project.title</small>
            <form name="move-dialog-test">
              <ul>
                {/* <RadioButtonGroup children={projectRadios} /> */}
                  <li><RadioButton label="Project A" /></li>
                  <li><RadioButton label="Project B" /></li>
              </ul>
            </form>
          </Dialog>
        </div>
      </div>
    );
  }
}

MediaDetail.propTypes = {
  intl: intlShape.isRequired
};

MediaDetail.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(MediaDetail);
