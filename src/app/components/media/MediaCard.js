import React, { Component, PropTypes } from 'react';
import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';
import { Link } from 'react-router';
import MediaStatus from './MediaStatus';
import MediaMetadataSummary from './MediaMetadataSummary';

class MediaCard extends Component {

  render() {
    const that = this;
    const props = that.props;
    const media = props.media;
    media.created_at = new Date(parseInt(media.published) * 1000);
    const data = JSON.parse(media.jsondata);
    const prefix = '/team/' + Checkdesk.context.team.dbid + '/project/' + Checkdesk.context.project.dbid + '/media/';

    return (
      <article className='media-card'>
        <Link to={prefix + media.dbid} className='media-card__clickable'>
          <div className='media-card__status'><MediaStatus media={media} /></div>
          <div className='media-card__content'>
            <h3 className='media-card__title'>{data.title}</h3>
            <MediaMetadataSummary media={media} data={data} />
          </div>
        </Link>
      </article>
    );
  }
}

export default MediaCard;
