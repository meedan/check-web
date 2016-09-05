import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router';
import PenderCard from '../PenderCard';
import config from 'config';

class MediaHeader extends Component {
  render() {
    const media = this.props.media;
    media.created_at = new Date(parseInt(media.published) * 1000);
    const data = JSON.parse(media.jsondata);

    return (
      <div className="media">
        <h2 className="media-name">{data.title}</h2>

        <PenderCard url={media.url} penderUrl={config.penderUrl} />

        <p className="media-description">{data.description}</p>

        <p className="media-author">
          Submitted by user <Link to={'/source/' + media.user.source.dbid}>{media.user.name}</Link> under source <Link to={'/source/' + media.account.source.dbid}>{media.account.source.name}</Link> <TimeAgo date={media.created_at} live={false} />
        </p>

        <p className="media-author">
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

export default MediaHeader;
