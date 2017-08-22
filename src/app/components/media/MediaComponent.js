import React, { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaUtil from './MediaUtil';
import Annotations from '../annotations/Annotations';
import CheckContext from '../../CheckContext';
import Tasks from '../task/Tasks';
import CreateTask from '../task/CreateTask';
import {
  bemClass,
  bemClassFromMediaStatus,
  safelyParseJSON,
  getStatus,
  getStatusStyle,
} from '../../helpers';
import ContentColumn from '../layout/ContentColumn';
import MediaStatus from './MediaStatus';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';

class MediaComponent extends Component {
  componentDidMount() {
    this.setCurrentContext();
    this.scrollToAnnotation();
    this.subscribe();
  }

  componentDidUpdate() {
    this.setCurrentContext();
    this.scrollToAnnotation();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  setCurrentContext() {
    const project = this.getContext().project;
    if (project && project.dbid) {
      this.props.relay.setVariables({ contextId: project.dbid });
    }
  }

  scrollToAnnotation() {
    if (window.location.hash !== '') {
      const id = window.location.hash.replace(/^#/, '');
      const element = document.getElementById(id);
      if (element.scrollIntoView !== undefined) {
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
    const primaryHeading = userOverrides && userOverrides.title
      ? MediaUtil.title(media, data, this.props.intl)
      : MediaUtil.attributedType(media, data, this.props.intl);
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

    return (
      <PageTitle
        prefix={MediaUtil.title(media, data, this.props.intl)}
        skipTeam={false}
        team={this.getContext().team}
      >
        <div
          className={bemClass('media', media.tasks.edges.length, '--has-tasks')}
          data-id={media.dbid}
        >
          <div
            className={bemClassFromMediaStatus('media__expanded', mediaLastStatus(media))}
            style={{ backgroundColor: getStatusStyle(status, 'backgroundColor') }}
          >

            <div className="media__expanded-header">
              <h1 className="media__primary-heading">{primaryHeading}</h1>
              <div className="media__status">
                <MediaStatus media={media} readonly={this.props.readonly} />
              </div>
            </div>

            <ContentColumn wide className="media__expanded-column-wrapper">
              <ContentColumn className="media__media-column">
                <MediaDetail initiallyExpanded media={media} />
                <CreateTask media={media} />
                {this.props.extras}
              </ContentColumn>
              <ContentColumn className="media__tasks-column">
                <div className="media__tasks-header">
                  <h2>
                    <FormattedMessage
                      id="mediaComponent.verificationTasks"
                      defaultMessage="Verification tasks"
                    />
                  </h2>
                  <span>
                    {media.tasks.edges.filter(t => !!t.node.first_response).length}/{media.tasks.edges.length}{' '}
                    <FormattedMessage id="mediaComponent.resolved" defaultMessage="resolved" />
                  </span>
                  <CreateTask media={media} plusIcon />
                </div>
                <Tasks tasks={media.tasks.edges} media={media} />
                <Annotations
                  annotations={media.log.edges}
                  annotated={media}
                  annotatedType="ProjectMedia"
                />
              </ContentColumn>
            </ContentColumn>
          </div>
        </div>
      </PageTitle>
    );
  }
}

MediaComponent.propTypes = {
  intl: intlShape.isRequired,
};

MediaComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(MediaComponent);
