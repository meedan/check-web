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
    const { media, annotated, annotatedType } = props;
    media.created_at = new Date(parseInt(media.published) * 1000);
    const data = JSON.parse(media.jsondata);

    let linkUrl = null;
    if (annotatedType === 'Project' && annotated && annotated.team) { // TODO: better support for media cards on sources
      const project = annotated;
      linkUrl = '/team/' + project.team.dbid + '/project/' + project.dbid + '/media/' + media.dbid;
    }

    return (
      <article className='media-card'>
        <Link to={linkUrl} className='media-card__clickable'>{/* TODO: linkify more selectively */}
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
