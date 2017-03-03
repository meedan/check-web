import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Pusher from 'pusher-js';
import DocumentTitle from 'react-document-title';
import MediaDetail from './MediaDetail';
import MediaUtil from './MediaUtil';
import MediaChecklist from './MediaChecklist';
import { Tags } from '../source';
import Annotations from './Annotations';
import config from 'config';
import { pageTitle } from '../../helpers';
import CheckContext from '../../CheckContext';
import Tasks from '../task/Tasks';
import { bemClassFromMediaStatus, safelyParseJSON, getStatus, getStatusStyle } from '../../helpers';
import ContentColumn from '../layout/ContentColumn';
import MediaStatus from './MediaStatus';
import MdInfoOutline from 'react-icons/lib/md/info-outline';
import Tooltip from 'rc-tooltip';

class MediaComponent extends Component {
  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  setCurrentContext() {
    this.props.relay.setVariables({ contextId: this.getContext().project.dbid });
  }

  componentDidMount() {
    this.setCurrentContext();
    this.scrollToAnnotation();
    this.subscribe();
  }

  componentDidUpdate() {
    this.setCurrentContext();
    this.scrollToAnnotation();
  }

  scrollToAnnotation() {
    if (window.location.hash != '') {
      let id = window.location.hash.replace(/^#/, ''),
        element = document.getElementById(id);
      if (element.scrollIntoView != undefined) {
        element.scrollIntoView();
      }
    }
  }

  subscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', (data) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === that.props.media.dbid) {
          that.props.relay.forceFetch();
        }
      });
    }
  }

  unsubscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    if (this.props.relay.variables.contextId === null) {
      return null;
    }

    const media = this.props.media;
    const data = JSON.parse(media.embed);
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;
    const userOverrides = safelyParseJSON(media.overridden);
    const primaryHeading = (userOverrides && userOverrides.title) ?
        MediaUtil.title(media, data) : MediaUtil.attributedType(media, data);
    const status = getStatus(this.props.media.verification_statuses, media.last_status);

    return (
      <DocumentTitle title={pageTitle(MediaUtil.title(media, data), false, this.getContext().team)}>
        <div className="media" data-id={media.dbid}>
          <div
            className={bemClassFromMediaStatus('media__expanded',
          media.last_status)} style={{ backgroundColor: getStatusStyle(status, 'backgroundColor') }}
          >
            <ContentColumn>
              <h1 className="media__primary-heading">{primaryHeading}</h1>
              <div className="media__status">
                <MediaStatus media={media} readonly={this.props.readonly} />
              </div>
              <MediaDetail media={media} />
              <Tasks tasks={media.tasks.edges} media={media} />
            </ContentColumn>
          </div>

          <ContentColumn>
            <Tooltip placement="bottom" trigger={['click']} overlay={<MediaChecklist/>} overlayClassName="">
              <h3 className="media__notes-heading">
                <FormattedMessage id="mediaComponent.verificationTimeline" defaultMessage="Verification Timeline" />
                <MdInfoOutline/>
              </h3>
            </Tooltip>
          </ContentColumn>
          <Annotations annotations={media.log.edges} annotated={media} annotatedType="ProjectMedia" />
        </div>
      </DocumentTitle>
    );
  }
}

MediaComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default MediaComponent;
