import React, { Component, PropTypes } from 'react';
import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';
import { Link } from 'react-router';
 
class MediaCard extends Component {
  statusToClass(status) {
    if (status === '') {
      return '';
    }
    return 'media-last-status-' + status.toLowerCase().replace(' ', '-');
  }

  render() {
    const that = this;
    const props = that.props;
    const media = props.media;
    media.created_at = new Date(parseInt(media.published) * 1000);
    const data = JSON.parse(media.jsondata);
    const prefix = '/team/' + Checkdesk.currentProject.team.dbid + '/project/' + Checkdesk.currentProject.dbid + '/media/';
          
    return (
      <article className='media-card --last_status'>
        <Link to={prefix + media.dbid} className='media-card__clickable'>
          <div className='media-card__status'>
            <i className="media-card__status-icon / fa fa-circle"></i>
            <span className='media-card__status-label'>{media.last_status}</span>
          </div>
          <div className='media-card__content'>
            <h3 className='media-card__title'>{data.description}</h3>
            <div className='media-card__metadata'>
              <span className='media-card__metadatum'>{media.annotations_count} notes</span>
              <span className='media-card__metadatum'>{media.domain}</span>
              <span className='media-card__metadatum'>{data.username ? '@' + data.username : null}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }
}

export default MediaCard;
