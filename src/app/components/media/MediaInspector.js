import React, { Component, PropTypes } from 'react';
import { bemClass } from '../../helpers';
import PenderCard from '../PenderCard';
import config from 'config';
import ContentColumn from '../layout/ContentColumn';
import CloseButton from '../CloseButton';

class MediaInspector extends Component {
  handleCaptionClick(e) {
    e.stopPropagation();
  }

  render() {
    const { media, isActive, dismiss } = this.props;

    return (
      <div className={bemClass('media-inspector', isActive, '--active')} onClick={dismiss}>
        <div className={bemClass('media-inspector__overlay', isActive, '--active')} />

        <div className="media-inspector__media">
          <ContentColumn flex>
            <CloseButton onClick={dismiss} />
            <PenderCard url={media.url} penderUrl={config.penderUrl} onClick={console.log.bind(this, 'click .pender-card')} />
            <div className="media-inspector__caption" onClick={this.handleCaptionClick.bind(this)}>
              <p className="media-inspector__caption-url">{media.url}</p>
            </div>
          </ContentColumn>
        </div>
      </div>
    );
  }
}

export default MediaInspector;
