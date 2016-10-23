import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router';
import PenderCard from '../PenderCard';
import config from 'config';
import MediaStatus from './MediaStatus';
import MediaTags from './MediaTags';
import QuoteMediaCard from './QuoteMediaCard';

class MediaDetail extends Component {
  statusToClass(baseClass, status) {
    return status.length ?
      [baseClass, `${baseClass}--${status.toLowerCase().replace(/[ _]/g, '-')}`].join(' ') :
      baseClass;
  }

  render() {
    const media = this.props.media;
    media.created_at = new Date(parseInt(media.published) * 1000);
    const data = JSON.parse(media.jsondata);
    const prefix = '/source/';

    const hide = {
      title: { twitter: true, instagram: true },
      description: { twitter: true, oembed: true, instagram: true }
    };

    const username = data.username ? ('@' + data.username) : data.author_url;
    const byUser = (media.user && media.user.source && media.user.source.dbid && media.user.name !== 'Pender') ?
      (<span>by <Link to={`/source/${media.user.source.dbid}`}>{media.user.name}</Link></span>) : '';

    const embedCard = (media, data) => {
      // if (data && data.quote && data.quote.length) {
      //   return <QuoteMediaCard quoteText={data.quote} attributionName={null} attributionUrl={null}/>;
      // }
      return <PenderCard url={media.url} penderUrl={config.penderUrl}/>;
    }(media, data);

    return (
      <div className={this.statusToClass('media-detail', media.last_status)}>
        <div className='media-detail__status'><MediaStatus media={media} /></div>
        <div className={this.statusToClass('media-detail__media', media.last_status)}>
          {embedCard}
        </div>
        <p className='media-detail__check-metadata'>
          <span className='media-detail__check-added-by'>Added {byUser}</span> <span className='media-detail__check-added-at'>{media.created_at ?
            <Link to={window.location.href}><TimeAgo date={media.created_at} live={false} /></Link>
            : null
          }</span> <span className='media-detail__check-notes-count'>{media.annotations_count} notes</span>
        </p>
        <MediaTags tags={media.tags.edges} />
        {hide.title[data.provider] ? null : (<h2 className="media-detail__title">{data.title}</h2>)}
        {hide.description[data.provider] ? null : (<p className="media-detail__description">{data.description}</p>)}
      </div>
    );
  }
}

export default MediaDetail;
