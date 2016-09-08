import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router';
import PenderCard from '../PenderCard';
import config from 'config';
import MediaStatus from './MediaStatus';

class MediaDetail extends Component {
  render() {
    const media = this.props.media;
    media.created_at = new Date(parseInt(media.published) * 1000);
    const data = JSON.parse(media.jsondata);
    const prefix = '/team/' + Checkdesk.currentProject.team.dbid + '/source/';

    return (
      <div className="media-detail">
        <div className='media-detail__status'><MediaStatus status={media.last_status} /></div>

        {/* <h2 className="media-name">{data.title}</h2> */}

        <PenderCard url={media.url} penderUrl={config.penderUrl} />

        <p className="media-description">{data.description}</p>

        <p className="media-detail__metadata">
          Submitted by user <Link to={prefix + media.user.source.dbid}>{media.user.name}</Link> under source <Link to={prefix + media.account.source.dbid}>{media.account.source.name}</Link> <TimeAgo date={media.created_at} live={false} />
        </p>

        <p className="media-detail__metadata">
          <img src={data.favicon} /> <a href={data.url} target="_blank">Originally published</a> by <a href={data.author_url} target="_blank">{data.username}</a>
          {(() => {
            if (data.published_at) {
              return (<span> <TimeAgo date={data.published_at} live={false} /></span>);
            }
          })()}
        </p>
      </div>
    )
  }
}

export default MediaDetail;
