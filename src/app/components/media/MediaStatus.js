import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';

class MediaStatus extends Component {
  statusToClass(status) {
    if (status === '') {
      return '';
    }
    return 'media-status--' + status.toLowerCase().replace(' ', '-');
  }

  render() {
    return (
      <div className={'media-status ' + this.statusToClass(this.props.status)}>
        <i className="media-status__icon / fa fa-circle"></i>
        <span className='media-status__label'>{this.props.status}</span>
      </div>
    );
  }
}

export default MediaStatus;
