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
    return 'media-detail__media--' + status.toLowerCase().replace(' ', '-');
  }

  render() {
    const media = this.props.media;
    media.created_at = new Date(parseInt(media.published) * 1000);
    const data = JSON.parse(media.jsondata);
    const prefix = '/team/' + Checkdesk.context.team.dbid + '/source/';

    const hide = {
      title: { twitter: true, instagram: true },
      description: { twitter: true, oembed: true, instagram: true }
    };

    return (
      <div className="media-detail">
        <div className='media-detail__status'><MediaStatus media={media} /></div>

        <div className={'media-detail__media ' + this.statusToClass(media.last_status)}>
          <PenderCard url={media.url} penderUrl={config.penderUrl} />
        </div>
        <p className="media-detail__original-metadata">
          <Link to={data.url} target="_blank">Posted</Link> by {media.account.source.name} (<Link to={data.author_url} target="_blank">@{data.username}</Link>) to <Link to={'https://' + media.domain}><img src={data.favicon} />{media.domain}</Link> {data.published_at ? <Link to={data.url} target="_blank"><TimeAgo date={data.published_at} live={false} /></Link> : null}
        </p>
        <h2 className="media-detail__title">{hide.title[data.provider] ? null : data.title}</h2>
        <p className="media-detail__description">{hide.description[data.provider] ? null : data.description}</p>
      </div>
    );
  }
}

export default MediaDetail;
