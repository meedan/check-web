import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router';
import PenderCard from '../PenderCard';
import config from 'config';
import MediaStatus from './MediaStatus';

class MediaDetail extends Component {
  statusToClass(status) {
    if (status === '') {
      return '';
    }
    return 'media-detail__media--' + status.toLowerCase().replace(/[ _]/g, '-');
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

    return (
      <div className="media-detail">
        <div className='media-detail__status'><MediaStatus media={media} /></div>

        <div className={'media-detail__media ' + this.statusToClass(media.last_status)}>
          <PenderCard url={media.url} penderUrl={config.penderUrl} />
        </div>
        <p className="media-detail__original-metadata">
          
          <span><Link to={data.url} target="_blank">Posted</Link> </span>
          
          {(() => {
            if (media.account && media.account.source && media.account.source.name) {
              return (
                <span>by {media.account.source.name} (<Link to={data.author_url} target="_blank">{username}</Link>) </span>
              );
            }
          })()}
          
          to <Link to={'https://' + media.domain}><img src={data.favicon} />{media.domain}</Link> {data.published_at ? <Link to={data.url} target="_blank"><TimeAgo date={data.published_at} live={false} /></Link> : null}

        </p>
        {hide.title[data.provider] ? null : (<h2 className="media-detail__title">{data.title}</h2>)}
        {hide.description[data.provider] ? null : (<p className="media-detail__description">{data.description}</p>)}
      </div>
    );
  }
}

export default MediaDetail;
