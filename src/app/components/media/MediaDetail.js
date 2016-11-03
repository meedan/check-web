import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router';
import config from 'config';
import MediaStatus from './MediaStatus';
import MediaTags from './MediaTags';
import QuoteMediaCard from './QuoteMediaCard';
import SocialMediaCard from './SocialMediaCard';
import MediaActions from './MediaActions';
import util from './MediaUtil';
import Tags from '../source/Tags';
import DefaultButton from '../inputs/DefaultButton';
import PenderCard from '../PenderCard';

class MediaDetail extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isEditing: false
    }
  }

  handleEdit() {
    this.setState({isEditing: true});
  }

  handleSave() {
    // TODO: mutation
    this.setState({isEditing: false});
  }

  handleCancel() {
    this.setState({isEditing: false});
  }

  statusToClass(baseClass, status) {
    return status.length ?
      [baseClass, `${baseClass}--${status.toLowerCase().replace(/[ _]/g, '-')}`].join(' ') :
      baseClass;
  }

  render() {
    const media = this.props.media;
    const data = JSON.parse(media.jsondata);
    const createdAt = util.createdAt(media);
    const annotationsCount = util.notesCount(media, data);

    const byUser = (media.user && media.user.source && media.user.source.dbid && media.user.name !== 'Pender') ?
      (<span>by <Link to={`/source/${media.user.source.dbid}`}>{media.user.name}</Link></span>) : '';

    const embedCard = (media, data) => {
      if (data && data.quote && data.quote.length) {
        return <QuoteMediaCard quoteText={data.quote} attributionName={null} attributionUrl={null}/>;
      }
      if (media.url) {
        return this.props.condensed ?
            <SocialMediaCard media={media} data={data} /> :
            <PenderCard url={media.url} penderUrl={config.penderUrl} />;
      }
      return null; // TODO: fallback
    }(media, data);

    return (
      <div className={this.statusToClass('media-detail', media.last_status)}>
        <div className='media-detail__header'>
          <div className='media-detail__status'><MediaStatus media={media} /></div>

          {this.state.isEditing ? (
            <span className='media-detail__editing-buttons'>
              {/*<DefaultButton onClick={this.handleCancel.bind(this)} className='media-detail__cancel-edits' size='xsmall'>Cancel</DefaultButton>*/}
              <DefaultButton onClick={this.handleSave.bind(this)} className='media-detail__save-edits' size='xsmall' style='primary'>Done</DefaultButton>
            </span>
            ) :
            <MediaActions media={media} handleEdit={this.handleEdit.bind(this)} />
          }
        </div>

        <div className={this.statusToClass('media-detail__media', media.last_status)}>
          {embedCard}
        </div>

        <p className='media-detail__check-metadata'>
          {byUser ? <span className='media-detail__check-added-by'>Added {byUser} </span> : null}
          {createdAt ? <span className='media-detail__check-added-at'>
            <Link to={window.location.href}><TimeAgo date={createdAt} live={false} /></Link>
          </span> : null}
          <span className='media-detail__check-notes-count'>{annotationsCount}</span>
        </p>

        <MediaTags media={media} tags={media.tags.edges} isEditing={this.state.isEditing} />
      </div>
    );
  }
}

export default MediaDetail;
