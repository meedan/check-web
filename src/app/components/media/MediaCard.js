import React, { Component, PropTypes } from 'react';
import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';
import { Link } from 'react-router';
import MediaStatus from './MediaStatus';
import MediaMetadataSummary from './MediaMetadataSummary';
import util from './MediaUtil';

class MediaCard extends Component {

  render() {
    const that = this;
    const props = that.props;
    const { media, annotated, annotatedType } = props;
    const data = JSON.parse(media.jsondata);

    let linkUrl = '#';
    if (annotatedType === 'Project' && annotated && annotated.team) { // TODO: better support for media cards on sources
      const project = annotated;
      linkUrl = '/project/' + project.dbid + '/media/' + media.dbid;
    }
    else if (media.project_id) {
      linkUrl = '/project/' + media.project_id + '/media/' + media.dbid;
    }

    return (
      <article className='media-card'>
        <Link to={linkUrl} className='media-card__clickable'>{/* TODO: linkify more selectively */}
          <div className='media-card__status'><MediaStatus media={media} /></div>
          <div className='media-card__content'>
            <h3 className='media-card__title'>{util.title(media, data)}</h3>
            <MediaMetadataSummary media={media} data={data} />
          </div>
        </Link>
      </article>
    );
  }
}

export default MediaCard;
